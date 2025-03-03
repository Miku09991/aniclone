
// Import anime with videos function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock data for anime with videos - in production you would fetch from an API
const animeData = [
  {
    title: "Атака титанов",
    description: "В мире, где человечество обитает за гигантскими стенами, защищающими их от титанов, Эрен Йегер клянется отомстить после трагедии.",
    image: "https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzMxXkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_.jpg",
    year: 2013,
    episodes: 25,
    status: "Завершен",
    rating: 9.0,
    genre: ["Экшн", "Драма", "Фэнтези"],
    video_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
  },
  {
    title: "Ван Пис",
    description: "Монки Д. Луффи отправляется в плавание, чтобы найти легендарное сокровище под названием \"Ван Пис\" и стать Королем Пиратов.",
    image: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxODMxY2UyXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
    year: 1999,
    episodes: 1000,
    status: "Онгоинг",
    rating: 8.7,
    genre: ["Приключения", "Комедия", "Фэнтези"],
    video_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
  },
  {
    title: "Магическая битва",
    description: "Юдзи Итадори, обычный старшеклассник с экстраординарной физической силой, участвует в оккультной деятельности школьного клуба.",
    image: "https://m.media-amazon.com/images/M/MV5BNzQyYzU3Y2MtOWY2Yy00ZGM2LTg3ZTUtMDJkZTJiMmEzMjYxXkEyXkFqcGdeQXVyMTI2NTY3NDg5._V1_.jpg",
    year: 2020,
    episodes: 24,
    status: "Завершен",
    rating: 8.6,
    genre: ["Экшн", "Фэнтези", "Сверхъестественное"],
    video_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
  },
  {
    title: "Клинок, рассекающий демонов",
    description: "После того, как его семья была убита демонами, а сестра превращена в одного из них, Танджиро Камадо становится охотником на демонов, чтобы найти лекарство для сестры.",
    image: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    year: 2019,
    episodes: 26,
    status: "Завершен",
    rating: 8.7,
    genre: ["Экшн", "Фэнтези", "Исторический"],
    video_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
  },
  {
    title: "Моя геройская академия",
    description: "В мире, где большинство людей обладают суперспособностями, Изуку Мидория рождается без них, но всё ещё мечтает стать героем.",
    image: "https://m.media-amazon.com/images/M/MV5BOGZmYjdjN2UtNjAwZi00YmEyLWFhNTEtNjM1OTc5ODg0MGEyXkEyXkFqcGdeQXVyMTA1NjQyNjkw._V1_.jpg",
    year: 2016,
    episodes: 113,
    status: "Онгоинг",
    rating: 8.4,
    genre: ["Экшн", "Комедия", "Супергерои"],
    video_url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting anime import with videos...");

    // Check if request is authorized
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ 
        error: "Требуется авторизация" 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Count existing animes with videos
    const { count, error: countError } = await supabase
      .from('animes')
      .select('*', { count: 'exact', head: true })
      .not('video_url', 'is', null);
    
    if (countError) {
      console.error("Error counting animes:", countError);
      throw countError;
    }
    
    console.log(`Found ${count} existing animes with videos`);
    
    // Skip import if we already have videos (prevent duplicates)
    if (count && count > 3) {
      return new Response(
        JSON.stringify({ 
          message: `Импорт пропущен. ${count} аниме с видео уже существуют.` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Import the anime data
    for (const anime of animeData) {
      // Check if anime with this title already exists
      const { data: existingAnime, error: findError } = await supabase
        .from('animes')
        .select('id, title')
        .eq('title', anime.title)
        .maybeSingle();
      
      if (findError) {
        console.error(`Error checking for existing anime "${anime.title}":`, findError);
        continue;
      }
      
      if (existingAnime) {
        console.log(`Updating anime: ${anime.title}`);
        
        // Update the existing anime
        const { error: updateError } = await supabase
          .from('animes')
          .update({ ...anime, video_url: anime.video_url })
          .eq('id', existingAnime.id);
        
        if (updateError) {
          console.error(`Error updating anime "${anime.title}":`, updateError);
        }
      } else {
        console.log(`Adding new anime: ${anime.title}`);
        
        // Insert new anime
        const { error: insertError } = await supabase
          .from('animes')
          .insert(anime);
        
        if (insertError) {
          console.error(`Error inserting anime "${anime.title}":`, insertError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Импорт аниме с видео завершен успешно" 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error in import function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Произошла ошибка при импорте аниме" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
