
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Starting DatabaseAnime import process...');
    
    // URL to the DatabaseAnime repository's data (you can update this to point to specific files if needed)
    const baseUrl = 'https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data';
    
    // Fetch the anime list
    console.log('Fetching anime data from DatabaseAnime repository...');
    const animeListUrl = `${baseUrl}/anime.json`;
    const animeListResponse = await fetch(animeListUrl);
    
    if (!animeListResponse.ok) {
      throw new Error(`Failed to fetch anime list: ${animeListResponse.status}`);
    }
    
    const animeList = await animeListResponse.json();
    console.log(`Found ${animeList.length} anime entries in DatabaseAnime`);
    
    // Process and insert anime data
    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const anime of animeList) {
      // Check if anime already exists in our database by title
      const { data: existingAnime, error: searchError } = await supabase
        .from('animes')
        .select('id, title')
        .ilike('title', anime.title)
        .maybeSingle();
      
      if (searchError) {
        console.error(`Error searching for anime: ${searchError.message}`);
        continue;
      }
      
      // Prepare anime data
      const animeData = {
        title: anime.title || 'Unknown Title',
        description: anime.description || anime.synopsis || '',
        image: anime.imageUrl || anime.poster || '',
        episodes: anime.episodeCount || 0,
        status: anime.status || 'Unknown',
        year: parseInt(anime.year) || new Date().getFullYear(),
        rating: parseFloat(anime.score) || 0,
        genre: Array.isArray(anime.genres) ? anime.genres : 
               (typeof anime.genres === 'string' ? anime.genres.split(',').map(g => g.trim()) : [])
      };
      
      // Insert or update the anime
      if (existingAnime) {
        const { error: updateError } = await supabase
          .from('animes')
          .update(animeData)
          .eq('id', existingAnime.id);
        
        if (updateError) {
          console.error(`Error updating anime ${anime.title}: ${updateError.message}`);
          skippedCount++;
        } else {
          updatedCount++;
        }
      } else {
        const { error: insertError } = await supabase
          .from('animes')
          .insert(animeData);
        
        if (insertError) {
          console.error(`Error inserting anime ${anime.title}: ${insertError.message}`);
          skippedCount++;
        } else {
          importedCount++;
        }
      }
    }
    
    const result = {
      success: true,
      message: `Imported ${importedCount} new anime, updated ${updatedCount} existing entries, and skipped ${skippedCount} due to errors.`,
      data: {
        imported: importedCount,
        updated: updatedCount,
        skipped: skippedCount,
        total: animeList.length
      }
    };
    
    console.log(`Import complete: ${result.message}`);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error(`DatabaseAnime import failed: ${error.message}`);
    
    const errorResult = {
      success: false,
      message: `Failed to import from DatabaseAnime: ${error.message}`,
    };
    
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
