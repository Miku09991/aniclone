
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ANIME_API_URL = 'https://api.jikan.moe/v4'
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
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check if we already have anime data
    const { count, error: countError } = await supabaseAdmin
      .from('animes')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error checking existing data:', countError)
      throw new Error('Error checking existing data')
    }

    // Log the current count for debugging
    console.log(`Current anime count: ${count}`)

    // If we already have enough data, just return success
    if (count && count > 30) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Database already has ${count} anime entries`,
          count,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch anime data from Jikan API
    console.log('Fetching anime data from Jikan API...')
    const response = await fetch(`${ANIME_API_URL}/top/anime?limit=50`)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid API response format')
    }

    const animeList = data.data.map((anime: any) => {
      // Get a random video from our sample list
      const randomVideoIndex = Math.floor(Math.random() * VIDEO_SOURCES.length)
      const videoUrl = VIDEO_SOURCES[randomVideoIndex]
      
      // Map API response to our database schema
      return {
        id: anime.mal_id,
        title: anime.title,
        image: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
        description: anime.synopsis,
        episodes: anime.episodes || 12,
        year: anime.year || new Date().getFullYear(),
        genre: anime.genres?.map((g: any) => g.name) || [],
        rating: anime.score || Math.floor(Math.random() * 3) + 7,
        status: anime.status || "Ongoing",
        video_url: videoUrl,
      }
    })

    // Insert data into the database
    console.log(`Inserting ${animeList.length} anime entries...`)
    
    const { error: insertError } = await supabaseAdmin
      .from('animes')
      .upsert(animeList, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (insertError) {
      console.error('Error inserting anime data:', insertError)
      throw new Error('Failed to insert anime data')
    }

    // Get the updated count
    const { count: newCount } = await supabaseAdmin
      .from('animes')
      .select('*', { count: 'exact', head: true })

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced anime database with ${animeList.length} entries`,
        count: newCount || animeList.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in sync-anime function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'An unexpected error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
