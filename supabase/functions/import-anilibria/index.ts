
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

    // Fetch titles from AniLibria API
    console.log("Fetching titles from AniLibria API...");
    const anilibriaResponse = await fetch("https://api.anilibria.tv/v3/title/list?limit=50&filter=id,code,names,description,status,type,in_favorites,player,posters,season,genres", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!anilibriaResponse.ok) {
      throw new Error(`AniLibria API error: ${anilibriaResponse.statusText}`);
    }

    const anilibriaData = await anilibriaResponse.json();
    console.log(`Fetched ${anilibriaData.list.length} titles from AniLibria API`);

    // Process and insert data into database
    const titles = anilibriaData.list as AnilibriaTitle[];
    const processedAnimes = titles.map(title => {
      // Extract episode data from player.series if available
      const episodesData = [];
      
      if (title.player?.series && Object.keys(title.player.series).length > 0) {
        for (const [episodeNumber, episodeData] of Object.entries(title.player.series)) {
          // Find best quality or use first available
          let videoUrl = null;
          if (episodeData && episodeData.hls && Object.values(episodeData.hls).length > 0) {
            // Try to get HD quality if available
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
      
      // Sort episodes by number
      episodesData.sort((a, b) => a.number - b.number);
      
      // Build main video URL from first episode if available
      let videoUrl = null;
      if (episodesData.length > 0) {
        videoUrl = episodesData[0].video_url;
      }

      return {
        id: title.id,
        title: title.names.ru || title.names.en || title.code,
        description: title.description,
        episodes: episodesData.length || 0,
        year: title.season?.year || null,
        genre: title.genres || [],
        rating: title.in_favorites / 100, // Using favorites count as a proxy for rating
        status: title.status?.code || null,
        image: title.posters?.original?.url ? `https://anilibria.tv${title.posters.original.url}` : null,
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
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
