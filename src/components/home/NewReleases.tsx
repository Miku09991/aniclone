
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Anime } from "@/types/anime";

interface NewReleasesProps {
  releases: Anime[];
}

const NewReleases = ({ releases }: NewReleasesProps) => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Новые эпизоды</h2>
        <Link 
          to="/releases" 
          className="text-red-500 hover:text-red-400 transition-colors flex items-center"
        >
          Смотреть все
          <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {releases.map((anime) => (
          <div 
            key={anime.id} 
            className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
          >
            <div className="relative">
              <AspectRatio ratio={16/9}>
                <img 
                  src={anime.image} 
                  alt={anime.title} 
                  className="object-cover w-full h-full"
                />
              </AspectRatio>
              {anime.newEpisodes && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  +{anime.newEpisodes}
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-1 hover:text-red-500 transition-colors">
                <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{anime.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {anime.genre?.slice(0, 2).map((genre) => (
                  <span key={genre} className="text-xs px-2 py-0.5 bg-[#2a2a2a] rounded-full">
                    {genre}
                  </span>
                ))}
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-yellow-400 mr-1">★</span>
                  <span>{anime.rating}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 p-0">
                  Смотреть
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewReleases;
