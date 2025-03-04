
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

    console.log('Starting comprehensive anime import with episodes and videos...');
    
    // Data sources - combining many anime databases for maximum coverage
    const sources = [
      // Main anime datasets
      { url: "https://raw.githubusercontent.com/manami-project/anime-offline-database/master/anime-offline-database.json", type: "json" },
      { url: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/tv.json", type: "json" },
      { url: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/movie.json", type: "json" },
      { url: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/ova.json", type: "json" },
      // Additional sources for more variety
      { url: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/special.json", type: "json" },
      { url: "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/ona.json", type: "json" },
    ];
    
    // Video sources for sample episodes
    const videoSources = [
      // Stable video sources with different content types
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
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4'
    ];
    
    let totalImported = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    const processedTitles = new Set(); // Track processed titles to avoid duplicates
    
    // Process each source
    for (const source of sources) {
      try {
        console.log(`Fetching anime from ${source.url}...`);
        const response = await fetch(source.url);
        
        if (!response.ok) {
          console.error(`Failed to fetch from ${source.url}: ${response.statusText}`);
          continue;
        }
        
        const rawData = await response.json();
        
        // Handle different data formats
        let animeList = [];
        if (source.url.includes("anime-offline-database")) {
          // Handle Manami Project format
          animeList = rawData.data || [];
        } else {
          // Handle DatabaseAnime format
          animeList = Array.isArray(rawData) ? rawData : [];
        }
        
        console.log(`Found ${animeList.length} anime from source`);
        
        // Process in batches to avoid timeouts
        const batchSize = 50;
        const batches = Math.ceil(animeList.length / batchSize);
        
        for (let i = 0; i < batches; i++) {
          const batchStart = i * batchSize;
          const batchEnd = Math.min((i + 1) * batchSize, animeList.length);
          const batch = animeList.slice(batchStart, batchEnd);
          
          console.log(`Processing batch ${i+1}/${batches} (${batchStart}-${batchEnd})`);
          
          // Process each anime in the batch
          for (const anime of batch) {
            try {
              // Extract title based on data format
              let title = "";
              if (source.url.includes("anime-offline-database")) {
                title = anime.title || "";
              } else {
                title = anime.title || "";
              }
              
              // Skip if already processed
              if (processedTitles.has(title) || !title) {
                continue;
              }
              
              processedTitles.add(title);
              
              // Generate episodes (1-24 random episodes)
              const episodeCount = Math.floor(Math.random() * 24) + 1;
              
              // Generate episode data with videos
              const episodeData = [];
              for (let j = 1; j <= episodeCount; j++) {
                const randomVideo = videoSources[Math.floor(Math.random() * videoSources.length)];
                episodeData.push({
                  number: j,
                  title: `Episode ${j}`,
                  video_url: randomVideo
                });
              }
              
              // Prepare anime data
              const animeData = {
                title: title,
                description: anime.synopsis || anime.description || `Описание аниме "${title}"`,
                image: anime.picture || anime.image || anime.imageUrl || "https://via.placeholder.com/300x450.png?text=" + encodeURIComponent(title),
                genre: Array.isArray(anime.genres) ? anime.genres : (anime.tags ? anime.tags : ["Аниме"]),
                year: anime.year || anime.animeSeason?.year || 2023,
                episodes: episodeCount,
                rating: anime.score || anime.rating || (Math.random() * 3 + 7).toFixed(1),
                status: anime.status || "Finished",
                video_url: episodeData[0]?.video_url || videoSources[0],
                episodes_data: JSON.stringify(episodeData)
              };
              
              // Check if anime already exists
              const { data: existingAnime, error: queryError } = await supabase
                .from('animes')
                .select('id, title')
                .ilike('title', title)
                .maybeSingle();
              
              if (queryError) {
                console.error(`Error checking if anime exists: ${queryError.message}`);
                totalErrors++;
                continue;
              }
              
              if (existingAnime) {
                // Update existing anime
                const { error: updateError } = await supabase
                  .from('animes')
                  .update(animeData)
                  .eq('id', existingAnime.id);
                
                if (updateError) {
                  console.error(`Error updating anime: ${updateError.message}`);
                  totalErrors++;
                } else {
                  totalUpdated++;
                }
              } else {
                // Insert new anime
                const { error: insertError } = await supabase
                  .from('animes')
                  .insert(animeData);
                
                if (insertError) {
                  console.error(`Error inserting anime: ${insertError.message}`);
                  totalErrors++;
                } else {
                  totalImported++;
                }
              }
            } catch (err) {
              console.error(`Error processing anime: ${err.message}`);
              totalErrors++;
            }
          }
        }
      } catch (err) {
        console.error(`Error processing source ${source.url}: ${err.message}`);
      }
    }
    
    // Update the animes table to add episodes_data column if it doesn't exist
    try {
      // This is just to check if the column exists, not to actually use the response
      const { error } = await supabase.rpc('check_column_exists', { 
        p_table: 'animes', 
        p_column: 'episodes_data' 
      });
      
      // If we get an error that the function doesn't exist, we'll create the column directly
      if (error) {
        console.log('Adding episodes_data column to animes table...');
        // We need to use admin privileges for schema changes
        const supabaseAdmin = createClient(
          SUPABASE_URL,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );
        
        // Try to execute a raw SQL query to add the column if it doesn't exist
        await supabaseAdmin.rpc('add_column_if_not_exists', {
          p_table: 'animes',
          p_column: 'episodes_data',
          p_type: 'jsonb'
        }).catch(e => {
          console.warn('Could not add episodes_data column, it may already exist:', e);
        });
      }
    } catch (err) {
      console.warn('Error checking/adding episodes_data column:', err);
    }
    
    // Generate a summary
    const summary = {
      success: true,
      message: `Imported ${totalImported} new anime, updated ${totalUpdated} existing anime. ${totalErrors} errors encountered.`,
      stats: {
        imported: totalImported,
        updated: totalUpdated,
        errors: totalErrors,
        total_processed: processedTitles.size
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
