
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
};

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

async function fetchDatabaseAnimeData() {
  try {
    console.log('Fetching from DatabaseAnime repository...');
    
    // The DatabaseAnime repository has its data in JSON format in the data directory
    // We're using the GitHub raw content URL to access the data
    const response = await fetch('https://raw.githubusercontent.com/LibertaSoft/DatabaseAnime/master/data/animes.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Fetched ${data.length || 0} anime records from DatabaseAnime`);
    return data;
  } catch (error) {
    console.error('Error fetching from DatabaseAnime:', error);
    throw error;
  }
}

async function importAnimeData() {
  try {
    const animeData = await fetchDatabaseAnimeData();
    
    // If no data was found, exit early
    if (!animeData || animeData.length === 0) {
      return { success: false, message: 'No anime data found in the repository' };
    }
    
    let importedCount = 0;
    let updatedCount = 0;
    
    // Process each anime entry
    for (const anime of animeData) {
      // Skip if missing essential data
      if (!anime.title) continue;
      
      // Check if anime already exists in our database
      const { data: existingAnime, error: checkError } = await supabaseAdmin
        .from('animes')
        .select('id')
        .eq('title', anime.title)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing anime:', checkError);
        continue;
      }
      
      // Prepare the anime data
      const animeEntry = {
        title: anime.title,
        description: anime.description || anime.synopsis || '',
        image: anime.image_url || anime.cover || '',
        episodes: anime.episodes || 0,
        year: anime.year || null,
        rating: anime.rating || 0,
        genre: anime.genres || [],
        status: anime.status || 'unknown',
        video_url: anime.video_url || null
      };
      
      // If anime exists, update it; otherwise, insert new record
      if (existingAnime) {
        const { error: updateError } = await supabaseAdmin
          .from('animes')
          .update(animeEntry)
          .eq('id', existingAnime.id);
        
        if (updateError) {
          console.error('Error updating anime:', updateError);
          continue;
        }
        
        updatedCount++;
      } else {
        const { error: insertError } = await supabaseAdmin
          .from('animes')
          .insert(animeEntry);
        
        if (insertError) {
          console.error('Error inserting anime:', insertError);
          continue;
        }
        
        importedCount++;
      }
    }
    
    return {
      success: true,
      message: `Successfully imported ${importedCount} new anime entries and updated ${updatedCount} existing entries from DatabaseAnime.`,
      importedCount,
      updatedCount
    };
  } catch (error) {
    console.error('Error during import:', error);
    return {
      success: false,
      message: `Failed to import anime from DatabaseAnime: ${error.message}`
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const result = await importAnimeData();
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in import-from-database-anime function:', error);
    
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
