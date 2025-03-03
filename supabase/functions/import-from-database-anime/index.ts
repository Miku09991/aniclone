
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
    
    // Retrieve a large set of anime from DatabaseAnime GitHub repository
    // This uses the raw content API to get the data
    // We'll get multiple JSON files to maximize the import
    
    const baseUrl = "https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data";
    const categories = ['tv', 'movie', 'ova', 'special'];
    
    let totalImported = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let errors = 0;
    
    // Process each category
    for (const category of categories) {
      try {
        // Fetch anime list for the category
        console.log(`Fetching ${category} anime...`);
        const response = await fetch(`${baseUrl}/${category}.json`);
        
        if (!response.ok) {
          console.error(`Failed to fetch ${category} anime: ${response.statusText}`);
          continue;
        }
        
        const animeList = await response.json();
        console.log(`Found ${animeList.length} ${category} anime`);
        
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
                video_url: anime.videoUrl || anime.trailer || null
              };
              
              if (existingAnime) {
                // Update existing anime
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
    
    // Generate a summary
    const summary = {
      success: true,
      message: `Imported ${totalImported} new anime, updated ${totalUpdated} existing anime. ${errors} errors encountered.`,
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
