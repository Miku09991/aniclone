
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('Fetching anime from DatabaseAnime...');
    
    // Retrieve a large set of anime from different sources to maximize the import
    const categories = ['tv', 'movie', 'ova', 'special'];
    const sources = [
      { name: 'DatabaseAnime', baseUrl: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data" },
      { name: 'AnimeDB', baseUrl: "https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json" }
    ];
    
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let errors = 0;
    
    // Process DatabaseAnime source (category-based)
    for (const category of categories) {
      try {
        console.log(`Fetching ${category} anime from DatabaseAnime...`);
        const response = await fetch(`${sources[0].baseUrl}/${category}.json`);
        
        if (!response.ok) {
          console.error(`Failed to fetch ${category} anime: ${response.statusText}`);
          continue;
        }
        
        const animeList = await response.json();
        console.log(`Found ${animeList.length} ${category} anime from DatabaseAnime`);
        
        // Process in batches to avoid timeouts and memory issues
        const batchSize = 50;
        const batches = Math.ceil(animeList.length / batchSize);
        
        for (let i = 0; i < batches; i++) {
          const batchStart = i * batchSize;
          const batchEnd = Math.min((i + 1) * batchSize, animeList.length);
          const batch = animeList.slice(batchStart, batchEnd);
          
          console.log(`Processing batch ${i+1}/${batches} for ${category} (${batchStart}-${batchEnd})`);
          
          // Process each anime in the batch
          for (const anime of batch) {
            try {
              // Check if anime already exists (by title)
              const { data: existingAnime, error: queryError } = await supabase
                .from('animes')
                .select('id, title')
                .ilike('title', anime.title)
                .maybeSingle();
              
              if (queryError) {
                console.error(`Error checking if anime exists: ${queryError.message}`);
                errors++;
                continue;
              }
              
              // Prepare anime data
              const animeData = {
                title: anime.title,
                description: anime.description || anime.synopsis || '',
                image: anime.image || anime.imageUrl || anime.imageURL || anime.poster || '',
                genre: anime.genres ? JSON.parse(JSON.stringify(anime.genres)) : [],
                year: parseInt(anime.year) || (anime.aired ? parseInt(anime.aired.split(' to ')[0]) : null),
                episodes: parseInt(anime.episodesCount) || parseInt(anime.episodes) || 0,
                rating: parseFloat(anime.score) || parseFloat(anime.rating) || 0,
                status: anime.status || category.toUpperCase(),
                video_url: anime.videoUrl || anime.trailer || getRandomSampleVideo()
              };
              
              if (existingAnime) {
                // Update existing anime only if it doesn't have video_url
                if (!existingAnime.video_url) {
                  const { error: updateError } = await supabase
                    .from('animes')
                    .update(animeData)
                    .eq('id', existingAnime.id);
                  
                  if (updateError) {
                    console.error(`Error updating anime ${anime.title}: ${updateError.message}`);
                    errors++;
                  } else {
                    totalUpdated++;
                  }
                } else {
                  totalSkipped++;
                }
              } else {
                // Insert new anime
                const { error: insertError } = await supabase
                  .from('animes')
                  .insert(animeData);
                
                if (insertError) {
                  console.error(`Error inserting anime ${anime.title}: ${insertError.message}`);
                  errors++;
                } else {
                  totalImported++;
                }
              }
            } catch (err) {
              console.error(`Error processing anime ${anime.title}: ${err.message}`);
              errors++;
            }
          }
        }
      } catch (err) {
        console.error(`Error processing ${category} category: ${err.message}`);
        errors++;
      }
    }
    
    // Try to process AnimeDB source (big JSON file)
    try {
      console.log('Fetching anime from AnimeDB...');
      const response = await fetch(sources[1].baseUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data)) {
          const animeList = data.data;
          console.log(`Found ${animeList.length} anime from AnimeDB`);
          
          // Process in batches
          const batchSize = 50;
          const batches = Math.ceil(animeList.length / batchSize);
          
          for (let i = 0; i < 10 && i < batches; i++) { // Limit to first 10 batches (500 anime)
            const batchStart = i * batchSize;
            const batchEnd = Math.min((i + 1) * batchSize, animeList.length);
            const batch = animeList.slice(batchStart, batchEnd);
            
            console.log(`Processing AnimeDB batch ${i+1}/10 (${batchStart}-${batchEnd})`);
            
            for (const anime of batch) {
              try {
                // Check if anime already exists
                const { data: existingAnime, error: queryError } = await supabase
                  .from('animes')
                  .select('id, title')
                  .ilike('title', anime.title)
                  .maybeSingle();
                
                if (queryError || existingAnime) {
                  if (queryError) errors++;
                  totalSkipped++;
                  continue;
                }
                
                // Prepare anime data
                const animeData = {
                  title: anime.title,
                  description: anime.description || anime.synopsis || '',
                  image: anime.picture || anime.image || '',
                  genre: anime.tags || [],
                  year: anime.animeSeason?.year || null,
                  episodes: anime.episodes || 0,
                  rating: anime.rating || (Math.random() * 3 + 7), // Random rating between 7-10 if not provided
                  status: anime.status || 'FINISHED',
                  video_url: getRandomSampleVideo()
                };
                
                // Insert new anime
                const { error: insertError } = await supabase
                  .from('animes')
                  .insert(animeData);
                
                if (insertError) {
                  console.error(`Error inserting anime ${anime.title}: ${insertError.message}`);
                  errors++;
                } else {
                  totalImported++;
                }
              } catch (err) {
                console.error(`Error processing AnimeDB item: ${err.message}`);
                errors++;
              }
            }
          }
        }
      } else {
        console.error(`Failed to fetch from AnimeDB: ${response.statusText}`);
      }
    } catch (err) {
      console.error(`Error processing AnimeDB: ${err.message}`);
    }
    
    // Generate a summary
    const summary = {
      success: true,
      message: `Imported ${totalImported} new anime, updated ${totalUpdated} existing anime, skipped ${totalSkipped}. ${errors} errors encountered.`,
      stats: {
        imported: totalImported,
        updated: totalUpdated,
        skipped: totalSkipped,
        errors: errors
      }
    };
    
    console.log(`Import completed: ${JSON.stringify(summary)}`);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error(`Global error in import function: ${err.message}`);
    return new Response(JSON.stringify({
      success: false,
      message: `Failed to import anime: ${err.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

// Function to get a random sample video URL
function getRandomSampleVideo() {
  const videoSources = [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
  ];
  const randomIndex = Math.floor(Math.random() * videoSources.length);
  return videoSources[randomIndex];
}
