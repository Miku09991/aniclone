
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Play, Star } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getAnimeById, toggleFavorite, isFavorite } from "@/lib/supabase";
import { Anime } from "@/types/anime";
import LoadingSpinner from "@/components/home/LoadingSpinner";

const AnimeDetails = () => {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Аниме не найдено</h1>
          <Button asChild>
            <Link to="/">Вернуться на главную</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-300 hover:text-white"
          asChild
        >
          <Link to="/">
            <ArrowLeft size={20} className="mr-2" />
            Вернуться на главную
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div>
            <div className="rounded-lg overflow-hidden mb-4">
              <AspectRatio ratio={3/4}>
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="w-full h-full object-cover"
                />
              </AspectRatio>
            </div>
            
            <div className="flex gap-4 mb-4">
              {anime.video_url && (
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/watch/${anime.id}`)}
                >
                  <Play size={16} className="mr-2" />
                  Смотреть
                </Button>
              )}
              
              <Button 
                variant="outline"
                className={`${isFavorited ? 'text-red-500 border-red-500' : ''}`}
                onClick={handleToggleFavorite}
              >
                <Heart 
                  size={16} 
                  className="mr-2" 
                  fill={isFavorited ? "currentColor" : "none"} 
                />
                {isFavorited ? "В избранном" : "В избранное"}
              </Button>
            </div>
            
            {anime.rating && (
              <div className="bg-[#1a1a1a] rounded-lg p-4 flex items-center justify-center mb-4">
                <Star size={24} className="text-yellow-400 mr-2" />
                <span className="text-xl font-bold">{anime.rating.toFixed(1)}</span>
              </div>
            )}
            
            <div className="bg-[#1a1a1a] rounded-lg p-4">
              <h3 className="font-bold mb-3">Информация</h3>
              <dl className="space-y-2">
                {anime.year && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Год:</dt>
                    <dd>{anime.year}</dd>
                  </div>
                )}
                {anime.episodes && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Эпизоды:</dt>
                    <dd>{anime.episodes}</dd>
                  </div>
                )}
                {anime.status && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Статус:</dt>
                    <dd>{anime.status}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
            
            {anime.genre && anime.genre.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {anime.genre.map((genre, index) => (
                  <span 
                    key={index}
                    className="bg-[#2a2a2a] text-white px-3 py-1 rounded-full text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
            
            <div className="bg-[#1a1a1a] rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Описание</h2>
              <p className="text-gray-300 leading-relaxed">
                {anime.description || "Описание отсутствует"}
              </p>
            </div>
            
            {anime.video_url && (
              <div className="bg-[#1a1a1a] rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Эпизоды</h2>
                <div 
                  className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                  onClick={() => navigate(`/watch/${anime.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <span>Эпизод 1</span>
                    <Play size={16} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
