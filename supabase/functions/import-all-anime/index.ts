
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCors(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('Starting anime import with episodes and videos...');
    
    // Video sources for sample episodes
    const videoSources = [
      'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
      'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4'
    ];
    
    // Expanded anime data with more titles
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
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
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
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
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
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
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
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        title: "Наруто",
        description: "Наруто Узумаки, молодой ниндзя с запечатанным в нем могущественным демоном-лисом, стремится стать Хокаге своей деревни.",
        image: "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
        year: 2002,
        episodes: 220,
        status: "Завершен",
        rating: 8.3,
        genre: ["Экшн", "Приключения", "Комедия"],
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4"
      },
      {
        title: "Токийский гуль",
        description: "Кен Канеки, студент колледжа, который после встречи с гулем превращается в наполовину гуля и вынужден питаться человеческой плотью, чтобы выжить.",
        image: "https://m.media-amazon.com/images/M/MV5BNTFkNmU4Y2YtMzhmMS00ZjI1LWJlMmYtZTFkMDk5NWNlN2ZmXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg",
        year: 2014,
        episodes: 12,
        status: "Завершен",
        rating: 7.9,
        genre: ["Экшн", "Драма", "Ужасы"],
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4"
      },
      {
        title: "Стальной Алхимик: Братство",
        description: "Два брата, Эдвард и Альфонс Элрики, ищут Философский Камень, чтобы восстановить свои тела после неудачной попытки воскресить свою мать.",
        image: "https://m.media-amazon.com/images/M/MV5BZmEzN2YzOTItMDI5MS00MGU4LWI1NWQtOTg5ZThhNGQwYTEzXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
        year: 2009,
        episodes: 64,
        status: "Завершен",
        rating: 9.1,
        genre: ["Экшн", "Приключения", "Драма"],
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4"
      },
      {
        title: "Твоё имя",
        description: "Двое незнакомцев обнаруживают, что они связаны странным образом и ищут друг друга.",
        image: "https://m.media-amazon.com/images/M/MV5BNGYyNmI3M2YtNzYzZS00OTViLTkxYjAtZDIyZmE1Y2U1ZmQ2XkEyXkFqcGdeQXVyMTA4NjE0NjEy._V1_.jpg",
        year: 2016,
        episodes: 1,
        status: "Фильм",
        rating: 8.8,
        genre: ["Романтика", "Драма", "Фэнтези"],
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      },
      {
        title: "Евангелион",
        description: "В постапокалиптическом мире подростки пилотируют гигантских биомеханических роботов, чтобы сражаться с таинственными врагами, известными как Ангелы.",
        image: "https://m.media-amazon.com/images/M/MV5BYjY1Y2ZmNDctZWQ3Yy00MzVlLWE4NjYtZmVjYTI0MGUxZDQ4XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
        year: 1995,
        episodes: 26,
        status: "Завершен",
        rating: 8.5,
        genre: ["Экшн", "Драма", "Меха"],
        video_url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
      }
    ];

    let totalAdded = 0;
    let totalUpdated = 0;
    
    console.log(`Processing ${animeData.length} anime records...`);
    
    // Process each anime in the dataset
    for (const anime of animeData) {
      try {
        // Generate episodes (1-12 episodes)
        const episodeCount = anime.episodes > 12 ? 12 : anime.episodes;
        
        // Generate episode data with videos
        const episodeData = [];
        for (let i = 1; i <= episodeCount; i++) {
          const randomVideo = videoSources[Math.floor(Math.random() * videoSources.length)];
          episodeData.push({
            number: i,
            title: `Эпизод ${i}`,
            video_url: randomVideo
          });
        }
        
        // Prepare anime data with episodes
        const animeWithEpisodes = {
          title: anime.title,
          description: anime.description,
          image: anime.image,
          genre: anime.genre,
          year: anime.year,
          episodes: episodeCount,
          rating: anime.rating,
          status: anime.status,
          video_url: anime.video_url,
          episodes_data: JSON.stringify(episodeData)
        };
        
        // Check if anime already exists
        const { data: existingAnime, error: queryError } = await supabase
          .from('animes')
          .select('id, title')
          .ilike('title', anime.title)
          .maybeSingle();
        
        if (queryError) {
          console.error(`Error checking if anime exists: ${queryError.message}`);
          continue;
        }
        
        if (existingAnime) {
          // Update existing anime
          const { error: updateError } = await supabase
            .from('animes')
            .update(animeWithEpisodes)
            .eq('id', existingAnime.id);
          
          if (updateError) {
            console.error(`Error updating anime: ${updateError.message}`);
          } else {
            console.log(`Updated anime: ${anime.title}`);
            totalUpdated++;
          }
        } else {
          // Insert new anime
          const { error: insertError } = await supabase
            .from('animes')
            .insert(animeWithEpisodes);
          
          if (insertError) {
            console.error(`Error inserting anime: ${insertError.message}`);
          } else {
            console.log(`Added new anime: ${anime.title}`);
            totalAdded++;
          }
        }
      } catch (err) {
        console.error(`Error processing anime ${anime.title}: ${err.message}`);
      }
    }
    
    // Check if we need to add episodes_data column
    try {
      // This is a simple check if the column exists
      const { data: checkData, error: checkError } = await supabase
        .from('animes')
        .select('episodes_data')
        .limit(1);
      
      // If we got an error about column not existing, try to add it
      if (checkError && checkError.message.includes('column "episodes_data" does not exist')) {
        console.log('Adding episodes_data column to animes table...');
        
        // Execute raw SQL to add the column if it doesn't exist
        const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
          p_table: 'animes',
          p_column: 'episodes_data',
          p_type: 'jsonb'
        });
        
        if (alterError) {
          console.warn('Could not add episodes_data column:', alterError);
        }
      }
    } catch (err) {
      console.warn('Error checking/adding episodes_data column:', err);
    }
    
    // Generate a summary
    const summary = {
      success: true,
      message: `Импортировано ${totalAdded} новых и обновлено ${totalUpdated} существующих аниме с эпизодами.`,
      stats: {
        added: totalAdded,
        updated: totalUpdated,
        total: animeData.length
      }
    };
    
    console.log(`Import completed: ${JSON.stringify(summary)}`);
    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error(`Global error in import function: ${err.message}`);
    return new Response(JSON.stringify({
      success: false,
      message: `Не удалось импортировать аниме: ${err.message}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
