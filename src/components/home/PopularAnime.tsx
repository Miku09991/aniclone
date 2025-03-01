
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Anime } from "@/types/anime";

interface PopularAnimeProps {
  animeList: Anime[];
}

const PopularAnime = ({ animeList }: PopularAnimeProps) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Популярное</h2>
        <Link 
          to="/popular" 
          className="text-red-500 hover:text-red-400 transition-colors flex items-center"
        >
          Смотреть все
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {animeList.map((anime) => (
          <div 
            key={anime.id} 
            className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
          >
            <div className="relative">
              <AspectRatio ratio={3/4}>
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                <span className="text-yellow-400">★</span>
                <span>{anime.rating}</span>
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium mb-1 line-clamp-1 hover:text-red-500 transition-colors">
                <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
              </h3>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{anime.episodes} серий</span>
                <span>{anime.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularAnime;
