
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Share2 } from "lucide-react";
import VideoPlayer from "@/components/anime/VideoPlayer";
import NavigationMenu from "@/components/layout/NavigationMenu";
import Footer from "@/components/layout/Footer";
import { getAnimeById, toggleFavorite, isFavorite } from "@/lib/supabase";
import { Anime } from "@/types/anime";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/home/LoadingSpinner";

const WatchAnime = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnime = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const animeData = await getAnimeById(parseInt(id));
        
        if (!animeData) {
          toast({
            title: "Ошибка",
            description: "Аниме не найдено",
            variant: "destructive",
          });
          navigate("/");
          return;
        }
        
        if (!animeData.video_url) {
          toast({
            title: "Ошибка",
            description: "Для этого аниме нет видео",
            variant: "destructive",
          });
          navigate(`/anime/${id}`);
          return;
        }
        
        setAnime(animeData);
        
        // Проверяем, добавлено ли аниме в избранное
        if (user) {
          const favorite = await isFavorite(animeData.id);
          setIsFavorited(favorite);
        }
      } catch (error) {
        console.error("Error fetching anime:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnime();
  }, [id, navigate, toast, user]);

  const handleToggleFavorite = async () => {
    if (!anime || !user) {
      if (!user) {
        toast({
          title: "Необходима авторизация",
          description: "Пожалуйста, войдите в аккаунт",
          variant: "destructive",
        });
        navigate("/auth");
      }
      return;
    }
    
    try {
      await toggleFavorite(anime.id);
      setIsFavorited(!isFavorited);
      
      toast({
        title: isFavorited ? "Удалено из избранного" : "Добавлено в избранное",
        description: isFavorited 
          ? `"${anime.title}" удалено из избранного` 
          : `"${anime.title}" добавлено в избранное`,
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: anime?.title,
        text: `Смотреть "${anime?.title}" на AniClone`,
        url: window.location.href,
      })
      .catch((error) => console.error("Error sharing:", error));
    } else {
      // Копирование ссылки в буфер обмена, если API Share недоступен
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Ссылка скопирована",
        description: "Ссылка скопирована в буфер обмена",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
        <NavigationMenu />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!anime || !anime.video_url) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
        <NavigationMenu />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Видео не найдено</h1>
            <Button asChild>
              <Link to="/">Вернуться на главную</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <NavigationMenu />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6 flex justify-between items-center">
          <Button 
            variant="ghost" 
            className="text-gray-300 hover:text-white"
            asChild
          >
            <Link to={`/anime/${anime.id}`}>
              <ArrowLeft size={20} className="mr-2" />
              Вернуться к аниме
            </Link>
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`rounded-full ${isFavorited ? 'text-red-500 hover:text-red-400' : 'text-gray-300 hover:text-white'}`}
              onClick={handleToggleFavorite}
            >
              <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white rounded-full"
              onClick={handleShare}
            >
              <Share2 size={20} />
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{anime.title}</h1>
          {anime.episodes && (
            <div className="text-gray-400 text-sm">
              {anime.episodes} {anime.episodes === 1 ? 'серия' : anime.episodes < 5 ? 'серии' : 'серий'}
            </div>
          )}
        </div>
        
        <div className="mb-8">
          <VideoPlayer videoUrl={anime.video_url} title={anime.title} />
        </div>
        
        <div className="bg-[#1a1a1a] rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Описание</h2>
          <p className="text-gray-300">{anime.description || "Описание отсутствует"}</p>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {anime.year && (
              <div>
                <h3 className="text-gray-400 text-sm">Год выпуска</h3>
                <p>{anime.year}</p>
              </div>
            )}
            
            {anime.status && (
              <div>
                <h3 className="text-gray-400 text-sm">Статус</h3>
                <p>{anime.status}</p>
              </div>
            )}
            
            {anime.rating && (
              <div>
                <h3 className="text-gray-400 text-sm">Рейтинг</h3>
                <p>{anime.rating.toFixed(1)}</p>
              </div>
            )}
          </div>
          
          {anime.genre && anime.genre.length > 0 && (
            <div className="mt-6">
              <h3 className="text-gray-400 text-sm mb-2">Жанры</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genre.map((genre, index) => (
                  <span 
                    key={index}
                    className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WatchAnime;
