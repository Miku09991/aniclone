
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { animeId } = await req.json();

    if (!animeId) {
      return new Response(
        JSON.stringify({ success: false, message: 'Anime ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get the anime details
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .select('id, title')
      .eq('id', animeId)
      .single();

    if (animeError || !anime) {
      return new Response(
        JSON.stringify({ success: false, message: 'Anime not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Sample video URLs (Kodik player URLs and YouTube embeds)
    const sampleVideos = [
      // YouTube embeds for anime trailers
      "https://www.youtube.com/embed/lDNRVQqKYFs", // Naruto
      "https://www.youtube.com/embed/cGW6aBkCpVE", // Attack on Titan
      "https://www.youtube.com/embed/MGRm4IzK1SQ", // My Hero Academia
      "https://www.youtube.com/embed/o3ASICWeSLc", // One Piece
      "https://www.youtube.com/embed/VQGCKyvzIM4"  // Demon Slayer
    ];

    // Select a random video URL
    const randomVideo = sampleVideos[Math.floor(Math.random() * sampleVideos.length)];

    // Update the anime with the video URL
    const { error: updateError } = await supabase
      .from('animes')
      .update({ video_url: randomVideo })
      .eq('id', animeId);

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: `Error updating anime: ${updateError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sample video added to anime',
        videoUrl: randomVideo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: `Error: ${err.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
