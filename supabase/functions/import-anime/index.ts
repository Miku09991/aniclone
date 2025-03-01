
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Тестовые данные аниме
const animeData = [
  {
    title: "Атака титанов",
    description: "В мире, где человечество обитает в городах, окружённых огромными стенами, защищающими их от гигантских существ, поедающих людей, подросток Эрен Йегер стремится отомстить титанам и уничтожить их после того, как один из титанов пожирает его мать.",
    image: "https://m.media-amazon.com/images/M/MV5BNDFjYTIxMjctYTQ2ZC00OWNiLWI1NzQtZDVlZTY1MjI2OTVhXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_FMjpg_UX1000_.jpg",
    episodes: 88,
    year: 2013,
    genre: ["Боевик", "Драма", "Фэнтези", "Ужасы"],
    rating: 9.0,
    status: "Завершено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4"
  },
  {
    title: "Ван Пис",
    description: "Гол Д. Роджер был известен как «Король Пиратов», самый сильный и печально известный человек, плававший по Гранд Лайн. Захват и казнь Роджера правительством подрывают политическую систему, и многие пираты приходят к власти. Роджер перед своей смертью объявляет, что его сокровища, One Piece, можно найти на Гранд Лайн, чтобы вызвать эру пиратов.",
    image: "https://m.media-amazon.com/images/M/MV5BODcwNWE3OTMtMDc3MS00NDFjLWE1OTAtNDU3NjgxODMxY2UyXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg",
    episodes: 1000,
    year: 1999,
    genre: ["Боевик", "Приключения", "Комедия", "Драма", "Фэнтези"],
    rating: 8.9,
    status: "Выходит",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4"
  },
  {
    title: "Клинок, рассекающий демонов",
    description: "История о юноше, который становится охотником на демонов после того, как его семья убита, а младшая сестра превращена в демона.",
    image: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    episodes: 44,
    year: 2019,
    genre: ["Боевик", "Приключения", "Фэнтези", "Драма"],
    rating: 8.7,
    status: "Выходит",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-mysterious-forest-in-the-fog-16750-large.mp4"
  },
  {
    title: "Моя геройская академия",
    description: "В мире, где большинство обладает суперспособностями, мальчик без таковых мечтает стать героем.",
    image: "https://m.media-amazon.com/images/M/MV5BOGZmYjdjN2UtNjAwZi00YmEyLWFhNTEtNjM1MTFjYWJkZjk0XkEyXkFqcGdeQXVyMTA1NjE5MTAz._V1_.jpg",
    episodes: 113,
    year: 2016,
    genre: ["Боевик", "Приключения", "Комедия", "Драма"],
    rating: 8.4,
    status: "Выходит",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-big-city-at-night-41375-large.mp4"
  },
  {
    title: "Наруто",
    description: "Наруто Узумаки, молодой ниндзя с огромной скрытой силой, мечтает стать Хокаге, лидером и сильнейшим ниндзя своей деревни.",
    image: "https://m.media-amazon.com/images/M/MV5BZmQ5NGFiNWEtMmMyMC00MDdiLTg4YjktOGY5Yzc2MDUxMTE1XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
    episodes: 220,
    year: 2002,
    genre: ["Боевик", "Приключения", "Комедия", "Драма", "Фэнтези"],
    rating: 8.3,
    status: "Завершено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-lake-surrounded-by-dry-grass-in-winter-39761-large.mp4"
  },
  {
    title: "Тетрадь смерти",
    description: "Гениальный подросток находит тетрадь смерти, которая принадлежит богу смерти, и решает использовать её, чтобы избавить мир от преступников.",
    image: "https://m.media-amazon.com/images/M/MV5BODkzMjhjYTQtYmQyOS00NmZlLTg3Y2UtYjkzN2JkNmRjY2FhXkEyXkFqcGdeQXVyNTM4MDQ5MDc@._V1_FMjpg_UX1000_.jpg",
    episodes: 37,
    year: 2006,
    genre: ["Детектив", "Драма", "Фэнтези", "Триллер", "Психологическое"],
    rating: 9.0,
    status: "Завершено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-fire-close-up-view-of-a-burning-fire-in-a-barbecue-43977-large.mp4"
  },
  {
    title: "Человек-бензопила",
    description: "Дэндзи — бедный юноша, который работает охотником на демонов вместе со своим демоном-питомцем Почитой, чтобы выплатить долги. После того, как его убивают, Дэндзи возрождается как гибрид человека и бензопилы.",
    image: "https://m.media-amazon.com/images/M/MV5BZjY5MDFhZTgtOGVhMi00NTUzLTk5NjktNmRlMjI3NjI4MmE0XkEyXkFqcGdeQXVyMTMzNDExODE5._V1_FMjpg_UX1000_.jpg",
    episodes: 12,
    year: 2022,
    genre: ["Боевик", "Ужасы", "Фэнтези", "Комедия", "Драма"],
    rating: 8.5,
    status: "Выходит",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-trees-in-the-savanna-plain-4274-large.mp4"
  },
  {
    title: "Хантер х Хантер",
    description: "Гон Фрикс, двенадцатилетний мальчик, отправляется на экзамен Хантеров, чтобы найти своего отца, который оставил его, когда он был ещё младенцем.",
    image: "https://m.media-amazon.com/images/M/MV5BZjNmZDhkN2QtNDYyZC00YzJmLTg0ODUtN2FjNjhhMzE3ZmUxXkEyXkFqcGdeQXVyNjc2NjA5MTU@._V1_FMjpg_UX1000_.jpg",
    episodes: 148,
    year: 2011,
    genre: ["Боевик", "Приключения", "Фэнтези", "Драма"],
    rating: 9.0,
    status: "Приостановлено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-waterfall-in-forest-2213-large.mp4"
  },
  {
    title: "Стальной алхимик: Братство",
    description: "Два брата-алхимика ищут философский камень после неудачной попытки воскресить мать, которая стоила им многого.",
    image: "https://m.media-amazon.com/images/M/MV5BZmEzN2YzOTItMDI5MS00MGU4LWI1NWQtOTg5ZThhNGQwYTEzXkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_.jpg",
    episodes: 64,
    year: 2009,
    genre: ["Боевик", "Приключения", "Драма", "Фэнтези"],
    rating: 9.1,
    status: "Завершено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-sun-setting-or-rising-on-a-hillside-with-clouds-28126-large.mp4"
  },
  {
    title: "Ковбой Бибоп",
    description: "Истории о группе охотников за головами в космосе, путешествующих на корабле 'Бибоп'.",
    image: "https://m.media-amazon.com/images/M/MV5BNGNlNjBkODEtZThlOC00YzUxLWI0MjMtMjk3YzJmMDFlNWZlXkEyXkFqcGdeQXVyNjI0MDg2NzE@._V1_FMjpg_UX1000_.jpg",
    episodes: 26,
    year: 1998,
    genre: ["Боевик", "Приключения", "Драма", "Научная фантастика"],
    rating: 8.9,
    status: "Завершено",
    video_url: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4"
  }
];

serve(async (req) => {
  // Обработка CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    let importedCount = 0;
    let errors = [];
    
    // Проверяем, есть ли данные в таблице
    const { count } = await supabase
      .from('animes')
      .select('*', { count: 'exact', head: true });
    
    // Если данные уже есть, пропускаем импорт
    if (count && count > 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "Данные уже импортированы",
        count: count
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Импортируем данные
    for (const anime of animeData) {
      const { error } = await supabase
        .from('animes')
        .insert(anime);
      
      if (error) {
        console.error("Ошибка импорта аниме:", error);
        errors.push({
          title: anime.title,
          error: error.message
        });
      } else {
        importedCount++;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Успешно импортировано ${importedCount} записей`,
      errors: errors.length > 0 ? errors : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Ошибка:", error);
    
    return new Response(JSON.stringify({
      success: false,
      message: `Произошла ошибка: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
