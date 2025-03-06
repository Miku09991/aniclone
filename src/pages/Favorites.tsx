import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from "@/contexts/AuthContext";
import { getFavoriteAnimes } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/home/LoadingSpinner";
import { Heart } from "lucide-react";
const Favorites = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();

  // Получаем список избранных аниме
  const {
    data: favorites = [],
    isLoading
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteAnimes,
    enabled: !!user
  });
  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }
  return <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6 text-gray-300 hover:text-white" asChild>
          <Link to="/">
            <ArrowLeft size={20} className="mr-2" />
            Вернуться на главную
          </Link>
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Избранное аниме</h1>
        
        {favorites.length > 0 ? <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {favorites.map(anime => <Link to={`/anime/${anime.id}`} key={anime.id} className="bg-[#1a1a1a] rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all duration-200">
                <div className="relative">
                  <AspectRatio ratio={2 / 3}>
                    <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
                  </AspectRatio>
                  {anime.rating && <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {anime.rating.toFixed(1)}
                    </div>}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2">{anime.title}</h3>
                </div>
              </Link>)}
          </div> : <div className="flex flex-col items-center justify-center py-16">
            <Heart size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-400">У вас пока нет избранного аниме</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/" className="\u0442\u0435\u043A\u0441\u0442 \u0447\u0435\u0440\u043D\u043E\u0433\u043E \u0446\u0432\u0435\u0442\u0430">
                Перейти к аниме
              </Link>
            </Button>
          </div>}
      </div>
    </div>;
};
export default Favorites;