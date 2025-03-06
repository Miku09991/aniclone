
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnilibriaTitle {
  id: number;
  code: string;
  names: {
    ru: string;
    en: string;
  };
  description: string;
  status: {
    code: string;
  };
  type: {
    full_string: string;
  };
  in_favorites: number;
  player: {
    host: string;
    series: Record<string, { hls: Record<string, string> }>;
  };
  posters: {
    original: {
      url: string;
    };
  };
  season: {
    year: number;
    string: string;
  };
  genres: string[];
  rating: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if request is authorized
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch titles from AniLibria API with updated endpoint and parameters
    console.log("Fetching titles from AniLibria API...");
    
    // Using the v2 API which tends to be more stable
    const anilibriaResponse = await fetch("https://api.anilibria.tv/v2/getUpdates?limit=50", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AniLibriaImporter/1.0" // Adding a user agent might help with the 412 error
      },
    });

    if (!anilibriaResponse.ok) {
      console.error(`AniLibria API error: ${anilibriaResponse.status} ${anilibriaResponse.statusText}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `AniLibria API error: ${anilibriaResponse.status} ${anilibriaResponse.statusText}`,
          details: await anilibriaResponse.text().catch(() => "Unable to read response body")
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Return 200 to client but with error information
        }
      );
    }

    const anilibriaData = await anilibriaResponse.json();
    console.log(`Fetched data from AniLibria API:`, anilibriaData);
    
    // Handle v2 API structure - the data might be directly in the response or in a list property
    const titles = Array.isArray(anilibriaData) ? anilibriaData : (anilibriaData.list || []);
    console.log(`Processing ${titles.length} titles from AniLibria API`);

    if (titles.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No titles received from AniLibria API",
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    // Process and insert data into database - adapting for v2 API response structure
    const processedAnimes = titles.map(title => {
      // Extract episode data from player info if available
      const episodesData = [];
      
      try {
        if (title.player && title.player.playlist) {
          // v2 API structure for episodes
          for (const [episodeNumber, episodeData] of Object.entries(title.player.playlist)) {
            if (episodeData && episodeData.hls) {
              const videoUrl = `https://${title.player.host}${episodeData.hls}`;
              
              episodesData.push({
                number: parseInt(episodeNumber),
                title: `Эпизод ${episodeNumber}`,
                video_url: videoUrl
              });
            }
          }
        } else if (title.player?.series && Object.keys(title.player.series).length > 0) {
          // v3 API fallback structure
          for (const [episodeNumber, episodeData] of Object.entries(title.player.series)) {
            let videoUrl = null;
            if (episodeData && episodeData.hls && Object.values(episodeData.hls).length > 0) {
              const quality = episodeData.hls["hd"] || episodeData.hls["sd"] || Object.values(episodeData.hls)[0];
              videoUrl = `https://${title.player.host}${quality}`;
            }
            
            if (videoUrl) {
              episodesData.push({
                number: parseInt(episodeNumber),
                title: `Эпизод ${episodeNumber}`,
                video_url: videoUrl
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing episodes for title ${title.id || 'unknown'}:`, error);
      }
      
      // Sort episodes by number
      episodesData.sort((a, b) => a.number - b.number);
      
      // Build main video URL from first episode if available
      let videoUrl = null;
      if (episodesData.length > 0) {
        videoUrl = episodesData[0].video_url;
      }

      // Extract title - adapting for different API versions
      const titleName = title.names ? 
        (title.names.ru || title.names.en || title.code) : 
        (title.russian || title.name || title.code || 'Unknown');

      // Extract poster URL - adapting for different API versions
      let posterUrl = null;
      if (title.posters?.original?.url) {
        posterUrl = `https://anilibria.tv${title.posters.original.url}`;
      } else if (title.poster) {
        posterUrl = title.poster.startsWith('http') ? title.poster : `https://anilibria.tv${title.poster}`;
      }

      // Get genres - adapting for different API versions
      const genres = title.genres || title.genre || [];

      // Fix for the numeric field overflow
      // Ensure rating is a valid numeric value between 0-10
      let normalizedRating = null;
      if (title.in_favorites) {
        // Normalize the 'in_favorites' to something between 0-10
        normalizedRating = Math.min(10, Math.max(0, title.in_favorites > 1000 ? 
          (title.in_favorites > 10000 ? 10 : title.in_favorites / 1000) : 
          (title.in_favorites / 100)));
      } else if (title.favorite?.rating) {
        normalizedRating = Math.min(10, Math.max(0, title.favorite.rating));
      } else {
        normalizedRating = 7; // Default rating
      }

      // Map to our database schema
      return {
        id: title.id,
        title: titleName,
        description: title.description || '',
        episodes: episodesData.length || 0,
        year: (title.season?.year || title.year || new Date().getFullYear()),
        genre: genres,
        rating: normalizedRating,
        status: (title.status?.code || title.status || 'ongoing'),
        image: posterUrl,
        video_url: videoUrl,
        episodes_data: episodesData
      };
    });

    // Insert data into supabase
    console.log(`Inserting ${processedAnimes.length} titles into database...`);
    const { error } = await supabase
      .from('animes')
      .upsert(processedAnimes, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Database error: ${error.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Import completed successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${processedAnimes.length} animes from AniLibria with episode data`,
        count: processedAnimes.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error during import:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Unknown error occurred"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with error information to avoid Edge Function error
      }
    );
  }
});
