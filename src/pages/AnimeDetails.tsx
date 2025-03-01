
import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Heart, Share2, Play, Star, Clock, Calendar, Bookmark, Info, MessageSquare, List } from "lucide-react";
import { getAnimeById } from "@/services/animeService";

interface Anime {
  id: number;
  title: string;
  image: string;
  description?: string;
  episodes?: number;
  year?: number;
  genre?: string[];
  rating?: number;
  status?: string;
}

const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const animeData = await getAnimeById(parseInt(id));
        if (animeData) {
          setAnime(animeData);
          // Check if anime is in favorites
          const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
          setIsFavorite(favorites.some((fav: any) => fav.id === animeData.id));
        } else {
          toast({
            title: "Не найдено",
            description: "Аниме не найдено",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching anime details:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить информацию об аниме",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimeDetails();
  }, [id, toast]);

  const toggleFavorite = () => {
    if (!anime) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    
    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== anime.id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(false);
      toast({
        title: "Удалено из избранного",
        description: "Аниме удалено из избранного",
      });
    } else {
      // Add to favorites
      const updatedFavorites = [...favorites, { 
        id: anime.id, 
        title: anime.title, 
        image: anime.image,
        episodes: anime.episodes,
        rating: anime.rating
      }];
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setIsFavorite(true);
      toast({
        title: "Добавлено в избранное",
        description: "Аниме добавлено в избранное",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white flex justify-center items-center">
        <div className="w-16 h-16 border-t-4 border-red-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="container mx-auto px-4 py-6">
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
          
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Info size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Аниме не найдено</h2>
            <p className="text-gray-400 mb-6">Запрошенное аниме не существует или было удалено</p>
            <Button asChild className="bg-red-500 hover:bg-red-600">
              <Link to="/">Вернуться на главную</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Generate episode list for demonstration
  const episodes = Array.from({ length: anime.episodes || 12 }, (_, i) => ({
    number: i + 1,
    title: `Эпизод ${i + 1}`,
    duration: "24 мин",
    releaseDate: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toLocaleDateString()
  }));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="relative">
        {/* Header background image */}
        <div className="absolute inset-0 h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <img 
            src={anime.image} 
            alt={anime.title} 
            className="w-full h-full object-cover object-center opacity-30 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 py-6 relative z-10">
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6">
            {/* Anime poster */}
            <div className="md:col-span-1">
              <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a]">
                <AspectRatio ratio={2/3}>
                  <img 
                    src={anime.image} 
                    alt={anime.title} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
                <div className="p-4 space-y-4">
                  <Button className="w-full bg-red-500 hover:bg-red-600">
                    <Play size={16} className="mr-2" />
                    Смотреть
                  </Button>
                  <Button 
                    variant="outline" 
                    className={`w-full ${isFavorite ? 'text-red-500 border-red-500' : ''}`}
                    onClick={toggleFavorite}
                  >
                    <Heart size={16} className="mr-2" fill={isFavorite ? "currentColor" : "none"} />
                    {isFavorite ? "В избранном" : "В избранное"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Share2 size={16} className="mr-2" />
                    Поделиться
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Anime details */}
            <div className="md:col-span-3">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{anime.title}</h1>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genre?.map((genre) => (
                  <span key={genre} className="text-xs px-2 py-1 bg-[#2a2a2a] rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center bg-[#1a1a1a] p-3 rounded-lg">
                  <Star className="text-yellow-400 mb-1" size={20} />
                  <span className="text-xl font-bold">{anime.rating}</span>
                  <span className="text-xs text-gray-400">Рейтинг</span>
                </div>
                <div className="flex flex-col items-center bg-[#1a1a1a] p-3 rounded-lg">
                  <List className="text-blue-400 mb-1" size={20} />
                  <span className="text-xl font-bold">{anime.episodes || "?"}</span>
                  <span className="text-xs text-gray-400">Эпизодов</span>
                </div>
                <div className="flex flex-col items-center bg-[#1a1a1a] p-3 rounded-lg">
                  <Calendar className="text-green-400 mb-1" size={20} />
                  <span className="text-xl font-bold">{anime.year}</span>
                  <span className="text-xs text-gray-400">Год</span>
                </div>
                <div className="flex flex-col items-center bg-[#1a1a1a] p-3 rounded-lg">
                  <Bookmark className="text-purple-400 mb-1" size={20} />
                  <span className="text-xl font-bold">{anime.status || "Онгоинг"}</span>
                  <span className="text-xs text-gray-400">Статус</span>
                </div>
              </div>
              
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="bg-[#1a1a1a] w-full mb-4">
                  <TabsTrigger value="description">Описание</TabsTrigger>
                  <TabsTrigger value="episodes">Эпизоды</TabsTrigger>
                  <TabsTrigger value="comments">Комментарии</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-0">
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {anime.description || "Описание отсутствует."}
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="episodes" className="mt-0">
                  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#2a2a2a]">
                    <div className="space-y-2">
                      {episodes.map((episode) => (
                        <div key={episode.number} className="hover:bg-[#2a2a2a] p-3 rounded-lg transition-colors">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <div className="bg-red-500 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                                {episode.number}
                              </div>
                              <div>
                                <h4 className="font-medium">{episode.title}</h4>
                                <div className="flex space-x-4 text-xs text-gray-400">
                                  <span>{episode.duration}</span>
                                  <span>{episode.releaseDate}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                              <Play size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comments" className="mt-0">
                  <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
                    <div className="flex flex-col items-center justify-center py-8">
                      <MessageSquare size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-400 mb-2">Комментариев пока нет</p>
                      <p className="text-center text-gray-500 text-sm mb-4">
                        Будьте первым, кто оставит комментарий к этому аниме!
                      </p>
                      <Button>Написать комментарий</Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
