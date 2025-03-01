
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Search as SearchIcon, Loader2 } from "lucide-react";
import { searchAnime } from "@/services/animeService";

interface Anime {
  id: number;
  title: string;
  image: string;
  description?: string;
  episodes?: number;
  year?: number;
  genre?: string[];
  rating?: number;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Anime[]>([]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 3) return;
    
    setIsLoading(true);
    try {
      const animeResults = await searchAnime(query);
      setResults(animeResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      setSearchParams({ q: searchQuery });
      performSearch(searchQuery);
    }
  };

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
        
        <h1 className="text-2xl font-bold mb-6">Поиск аниме</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Введите название аниме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
              <span className="ml-2">Поиск</span>
            </Button>
          </div>
        </form>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-red-500" />
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <p className="text-gray-400">Найдено результатов: {results.length}</p>
            
            <div className="grid grid-cols-1 gap-6">
              {results.map((anime) => (
                <div 
                  key={anime.id} 
                  className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/4 lg:w-1/5">
                      <AspectRatio ratio={2/3}>
                        <img 
                          src={anime.image} 
                          alt={anime.title} 
                          className="object-cover w-full h-full"
                        />
                      </AspectRatio>
                    </div>
                    <div className="p-4 md:w-3/4 lg:w-4/5">
                      <h3 className="text-lg font-semibold mb-2 hover:text-red-500 transition-colors">
                        <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {anime.genre?.slice(0, 3).map((genre) => (
                          <span key={genre} className="text-xs px-2 py-0.5 bg-[#2a2a2a] rounded-full">
                            {genre}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{anime.description}</p>
                      <div className="flex flex-wrap justify-between text-sm">
                        <div className="flex items-center space-x-4 mb-2 md:mb-0">
                          <div className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            <span>{anime.rating}</span>
                          </div>
                          {anime.episodes !== undefined && (
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-1">Серий:</span>
                              <span>{anime.episodes}</span>
                            </div>
                          )}
                          {anime.year !== undefined && (
                            <div className="flex items-center">
                              <span className="text-gray-400 mr-1">Год:</span>
                              <span>{anime.year}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400">
                          Смотреть
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchParams.get("q") ? (
          <div className="flex flex-col items-center justify-center py-12">
            <SearchIcon size={64} className="text-gray-400 mb-4" />
            <p className="text-gray-400">По запросу "{searchParams.get("q")}" ничего не найдено</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Search;
