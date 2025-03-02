
import { useState, useEffect } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import NewReleases from "@/components/home/NewReleases";
import PopularAnime from "@/components/home/PopularAnime";
import LoadingSpinner from "@/components/home/LoadingSpinner";
import NavigationMenu from "@/components/layout/NavigationMenu";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { getAnimeList } from "@/lib/supabase";
import { importAnimeData } from "@/services/importService";
import { Anime } from "@/types/anime";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Функция для загрузки данных
  const fetchData = async () => {
    setLoading(true);
    try {
      // Получаем список аниме
      const { data, count } = await getAnimeList(1, 20);
      
      // Если нет данных, запускаем импорт
      if (count === 0) {
        const imported = await importAnimeData();
        if (imported) {
          // Если импорт успешен, загружаем данные снова
          const result = await getAnimeList(1, 20);
          setAnimeList(result.data);
        }
      } else {
        setAnimeList(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
  
  // Получаем новые релизы (с условным флагом newEpisodes)
  const newReleases = animeList
    .filter(anime => anime.status === "Выходит")
    .map(anime => ({ ...anime, newEpisodes: Math.floor(Math.random() * 3) + 1 }))
    .slice(0, 3);
  
  // Получаем популярное аниме (просто другие 6 записей)
  const popularAnime = animeList
    .filter(anime => anime.rating >= 8.5)
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
