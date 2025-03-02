
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
      // Extract episode count from player.series if available
      const episodeCount = title.player?.series ? Object.keys(title.player.series).length : 0;
      
      // Build video URL if available
      let videoUrl = null;
      if (title.player?.series && title.player.host && Object.keys(title.player.series).length > 0) {
        const firstEpisodeKey = Object.keys(title.player.series)[0];
        const episode = title.player.series[firstEpisodeKey];
        if (episode && episode.hls && Object.values(episode.hls).length > 0) {
          // Get the first available quality
          const firstQualityKey = Object.keys(episode.hls)[0];
          const videoPath = episode.hls[firstQualityKey];
          videoUrl = `https://${title.player.host}${videoPath}`;
        }
      }

      return {
        id: title.id,
        title: title.names.ru || title.names.en || title.code,
        description: title.description,
        episodes: episodeCount,
        year: title.season?.year || null,
        genre: title.genres || [],
        rating: title.in_favorites / 100, // Using favorites count as a proxy for rating
        status: title.status?.code || null,
        image: title.posters?.original?.url ? `https://anilibria.tv${title.posters.original.url}` : null,
        video_url: videoUrl,
      };
    });

    // Insert data into supabase
    console.log(`Inserting ${processedAnimes.length} titles into database...`);
    const { data, error } = await supabase
      .from('animes')
      .upsert(processedAnimes, { onConflict: 'id' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Import completed successfully");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully imported ${processedAnimes.length} animes from AniLibria`,
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
