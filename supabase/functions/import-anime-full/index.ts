
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Anime data source (using Jikan API as the main source)
const API_BASE_URL = "https://api.jikan.moe/v4";

// Video sources for sample videos
const VIDEO_SOURCES = [
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

// Function to fetch anime data from Jikan API
async function fetchAnimeData(limit = 50, offset = 0) {
  try {
    console.log(`Fetching anime data from Jikan API: limit=${limit}, offset=${offset}`);
    
    // Use the top anime endpoint to get most popular anime
    const response = await fetch(`${API_BASE_URL}/top/anime?limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`API Error (${response.status}): ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching anime data:", error);
    return [];
  }
}

// Function to fetch anime episodes for a specific anime
async function fetchAnimeEpisodes(animeId: number) {
  try {
    console.log(`Fetching episodes for anime ID: ${animeId}`);
    
    // Add a delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(`${API_BASE_URL}/anime/${animeId}/episodes`);
    
    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited, wait longer and try again
        console.log("Rate limited, waiting longer...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchAnimeEpisodes(animeId);
      }
      
      console.warn(`Could not fetch episodes for anime ${animeId}: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`Error fetching episodes for anime ${animeId}:`, error);
    return [];
  }
}

// Process anime and create episode data
async function processAnimeWithEpisodes(animeData: any[]) {
  const processedAnime = [];
  
  for (const anime of animeData) {
    try {
      // Get a random video from our sample list
      const getRandomVideo = () => {
        const randomIndex = Math.floor(Math.random() * VIDEO_SOURCES.length);
        return VIDEO_SOURCES[randomIndex];
      };
      
      // Fetch episodes for this anime
      let episodes = await fetchAnimeEpisodes(anime.mal_id);
      
      // If API failed, create some dummy episodes
      if (!episodes || episodes.length === 0) {
        const episodeCount = anime.episodes || Math.floor(Math.random() * 12) + 1;
        episodes = Array.from({ length: episodeCount }, (_, index) => ({
          mal_id: index + 1,
          title: `Эпизод ${index + 1}`,
          episode: index + 1
        }));
      }
      
      // Process episodes and add video URLs
      const processedEpisodes = episodes.map((episode: any) => ({
        number: episode.mal_id || episode.episode,
        title: episode.title || `Эпизод ${episode.mal_id || episode.episode}`,
        video_url: getRandomVideo()
      }));
      
      // Map API response to our database schema
      const processedAnimeItem = {
        id: anime.mal_id,
        title: anime.title,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
        description: anime.synopsis || "Описание отсутствует",
        episodes: anime.episodes || processedEpisodes.length,
        year: anime.year || new Date().getFullYear(),
        genre: anime.genres?.map((g: any) => g.name) || [],
        rating: anime.score || Math.floor(Math.random() * 3) + 7,
        status: anime.status || "Онгоинг",
        video_url: getRandomVideo(),
        episodes_data: JSON.stringify(processedEpisodes)
      };
      
      processedAnime.push(processedAnimeItem);
    } catch (error) {
      console.error(`Error processing anime ${anime.title}:`, error);
    }
  }
  
  return processedAnime;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting full anime import with episodes...");
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get request params from URL
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    console.log(`Processing request with limit=${limit}, offset=${offset}`);
    
    // Fetch anime data
    const animeData = await fetchAnimeData(limit, offset);
    
    if (!animeData || animeData.length === 0) {
      console.log("No anime data received from API");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Не удалось получить данные из API",
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 status even for business logic errors
        }
      );
    }
    
    console.log(`Processing ${animeData.length} anime with episodes...`);
    
    // Process anime data with episodes
    const processedAnime = await processAnimeWithEpisodes(animeData);
    
    console.log(`Prepared ${processedAnime.length} anime for import`);
    
    // Insert data into database
    if (processedAnime.length > 0) {
      try {
        const { error: insertError } = await supabase
          .from('animes')
          .upsert(processedAnime, {
            onConflict: 'id',
            ignoreDuplicates: false
          });
        
        if (insertError) {
          console.error('Error inserting anime data:', insertError);
          return new Response(
            JSON.stringify({
              success: false,
              message: `Ошибка при добавлении данных в базу: ${insertError.message}`,
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 // Return 200 even for database errors
            }
          );
        }
      } catch (dbError) {
        console.error('Database operation error:', dbError);
        return new Response(
          JSON.stringify({
            success: false,
            message: `Ошибка базы данных: ${dbError.message || 'Неизвестная ошибка'}`,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
          }
        );
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Успешно импортировано ${processedAnime.length} аниме с эпизодами`,
        count: processedAnime.length,
        nextOffset: offset + limit
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in import-anime-full function:', error);
    
    // Always return a 200 status code with error details in the response body
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Произошла непредвиденная ошибка',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});
