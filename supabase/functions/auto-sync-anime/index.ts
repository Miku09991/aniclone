
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnimeData {
  id: number;
  title: string;
  image: string;
  description?: string;
  episodes?: number;
  year?: number;
  genre?: string[];
  rating?: number;
  status?: string;
  video_url?: string;
}

async function fetchNewAnimeFromJikan(limit: number = 10): Promise<AnimeData[]> {
  console.log("Fetching new anime from Jikan API");
  const response = await fetch(`https://api.jikan.moe/v4/anime?order_by=start_date&sort=desc&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from Jikan: ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return data.data.map((item: any) => ({
    id: item.mal_id,
    title: item.title,
    image: item.images.jpg.large_image_url,
    description: item.synopsis,
    episodes: item.episodes,
    year: item.aired?.prop?.from?.year,
    genre: item.genres?.map((g: any) => g.name),
    rating: item.score,
    status: item.status,
    // We'll find videos separately
    video_url: null
  }));
}

async function searchAnimeTrailers(title: string): Promise<string | null> {
  console.log(`Searching for trailer for: ${title}`);
  try {
    // This is a demo placeholder - in production, you'd use a real API
    // Example: search YouTube API for "[title] anime trailer"
    const searchQuery = encodeURIComponent(`${title} anime trailer`);
    const demoUrls = [
      "https://youtu.be/cGW6aBkCpVE",
      "https://youtu.be/MGRm4IzK1SQ", 
      "https://youtu.be/_mJNVzJOCDQ",
      "https://youtu.be/hBDE97oPV9k",
      "https://youtu.be/3xHpxfV5Wl8"
    ];
    
    // For demo purposes, return a random video from our list
    // In production, you would use the YouTube API to search for videos
    const randomIndex = Math.floor(Math.random() * demoUrls.length);
    return demoUrls[randomIndex];
  } catch (error) {
    console.error("Error searching for trailer:", error);
    return null;
  }
}

async function findAndSyncNewAnime(supabase: any) {
  try {
    console.log("Starting anime sync process");
    
    // 1. Fetch latest anime from Jikan API
    const newAnimeList = await fetchNewAnimeFromJikan(20);
    console.log(`Found ${newAnimeList.length} potential new anime`);
    
    // 2. Check which ones we don't already have in the database
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const anime of newAnimeList) {
      // Check if anime already exists in our database
      const { data: existingAnime, error: existingError } = await supabase
        .from('animes')
        .select('id, title, video_url')
        .eq('id', anime.id)
        .maybeSingle();
      
      if (existingError) {
        console.error(`Error checking for existing anime ${anime.id}:`, existingError);
        continue;
      }
      
      // If we need to add new anime or update existing without video
      if (!existingAnime || !existingAnime.video_url) {
        // Find a trailer for this anime
        const videoUrl = await searchAnimeTrailers(anime.title);
        
        if (videoUrl) {
          anime.video_url = videoUrl;
          
          if (!existingAnime) {
            // Insert new anime with video
            const { error: insertError } = await supabase
              .from('animes')
              .insert(anime);
            
            if (insertError) {
              console.error(`Error inserting anime ${anime.id}:`, insertError);
            } else {
              console.log(`Added new anime: ${anime.title} with video`);
              addedCount++;
            }
          } else {
            // Update existing anime with video
            const { error: updateError } = await supabase
              .from('animes')
              .update({ video_url: videoUrl })
              .eq('id', anime.id);
            
            if (updateError) {
              console.error(`Error updating anime ${anime.id} with video:`, updateError);
            } else {
              console.log(`Updated anime: ${anime.title} with video`);
              updatedCount++;
            }
          }
        }
      }
    }
    
    return {
      success: true,
      message: `Sync completed: Added ${addedCount} new anime and updated ${updatedCount} with videos`,
      added: addedCount,
      updated: updatedCount
    };
  } catch (error) {
    console.error("Error in findAndSyncNewAnime:", error);
    return {
      success: false,
      message: `Error syncing anime: ${error.message}`,
      added: 0,
      updated: 0
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Run the sync process
    const result = await findAndSyncNewAnime(supabase);
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 500 
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Server error: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
