
import { useState, useEffect } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import NewReleases from "@/components/home/NewReleases";
import PopularAnime from "@/components/home/PopularAnime";
import LoadingSpinner from "@/components/home/LoadingSpinner";
import NavigationMenu from "@/components/layout/NavigationMenu";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { 
  getAnimeList, 
  getAnimesWithVideos, 
  syncAnimeDatabase, 
  autoSyncAnimeWithVideos, 
  importAnimeFromDatabaseAnime 
} from "@/lib/supabase";
import { Anime } from "@/types/anime";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [videoAnimeList, setVideoAnimeList] = useState<Anime[]>([]);
  const { toast } = useToast();

  // Функция для загрузки данных
  const fetchData = async () => {
    setLoading(true);
    try {
      // Получаем список аниме
      const { data, count } = await getAnimeList(1, 20);
      
      // Если нет данных или данных мало, запускаем синхронизацию
      if (count === 0 || count < 10) {
        toast({
          title: "Синхронизация базы данных",
          description: "Загружаем данные об аниме, пожалуйста подождите...",
        });
        
        // Пробуем импортировать данные из DatabaseAnime
        const dbAnimeResult = await importAnimeFromDatabaseAnime();
        
        if (dbAnimeResult.success) {
          toast({
            title: "Импорт из DatabaseAnime завершен",
            description: dbAnimeResult.message,
          });
          
          // После успешного импорта загружаем данные снова
          const result = await getAnimeList(1, 20);
          setAnimeList(result.data);
        } else {
          // Если импорт из DatabaseAnime не удался, используем обычную синхронизацию
          const syncResult = await syncAnimeDatabase();
          
          if (syncResult.success) {
            toast({
              title: "Синхронизация завершена",
              description: syncResult.message,
            });
            
            // После успешной синхронизации загружаем данные снова
            const result = await getAnimeList(1, 20);
            setAnimeList(result.data);
          } else {
            toast({
              title: "Ошибка синхронизации",
              description: syncResult.message,
              variant: "destructive",
            });
            
            // Используем то, что есть
            setAnimeList(data);
          }
        }
        
        // Загружаем аниме с видео и автоматически ищем новые
        const videosResult = await getAnimesWithVideos();
        setVideoAnimeList(videosResult);
        
        // Автоматически ищем новые аниме с видео
        autoSyncAnimeWithVideos().then(syncResult => {
          if (syncResult.success) {
            toast({
              title: "Автоматическая синхронизация аниме",
              description: syncResult.message,
            });
            
            // Перезагружаем данные после синхронизации
            getAnimesWithVideos().then(newVideosResult => {
              setVideoAnimeList(newVideosResult);
            });
          }
        });
      } else {
        setAnimeList(data);
        
        // Загружаем аниме с видео
        const videosResult = await getAnimesWithVideos();
        setVideoAnimeList(videosResult);
        
        // Автоматически ищем новые аниме с видео
        autoSyncAnimeWithVideos().then(syncResult => {
          if (syncResult.success) {
            toast({
              title: "Автоматическая синхронизация аниме",
              description: syncResult.message,
            });
            
            // Перезагружаем данные после синхронизации
            getAnimesWithVideos().then(newVideosResult => {
              setVideoAnimeList(newVideosResult);
            });
          }
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить данные аниме",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Автоматическая смена слайдов каждые 5 секунд
    const slideshowInterval = setInterval(() => {
      if (animeList.length > 0) {
        setCurrentSlide((prev) => (prev + 1) % Math.min(5, animeList.length));
      }
    }, 5000);
    
    return () => clearInterval(slideshowInterval);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Получаем первые 5 аниме для слайдера (или меньше, если данных меньше)
  const heroSlides = animeList.slice(0, 5);
  
  // Получаем новые релизы с видео
  const newReleases = videoAnimeList
    .slice(0, 3)
    .map(anime => ({ ...anime, newEpisodes: Math.floor(Math.random() * 3) + 1 }));
  
  // Получаем популярное аниме с высоким рейтингом
  const popularAnime = animeList
    .filter(anime => anime.rating >= 8)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <NavigationMenu />
      <div className="container mx-auto px-4 py-4 flex-grow">
        {heroSlides.length > 0 && (
          <HeroSlider 
            slides={heroSlides} 
            currentSlide={currentSlide} 
            setCurrentSlide={setCurrentSlide} 
          />
        )}
        
        {newReleases.length > 0 && (
          <NewReleases releases={newReleases} />
        )}
        
        {popularAnime.length > 0 && (
          <PopularAnime animeList={popularAnime} />
        )}
      </div>
      <Footer />
      <Toaster />
    </div>
  );
};

export default Index;
