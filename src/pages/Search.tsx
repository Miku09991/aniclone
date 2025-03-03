
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Anime } from "@/types/anime";
import { searchAnime, getAnimeList } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import NavigationMenu from "@/components/layout/NavigationMenu";
import Footer from "@/components/layout/Footer";
import { Search as SearchIcon, Filter, Star } from "lucide-react";
import LoadingSpinner from "@/components/home/LoadingSpinner";
import { Link } from "react-router-dom";
import { performFullAnimeImport } from "@/lib/api/animeImport";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalAnime, setTotalAnime] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const limit = 24; // Items per page
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryParam = params.get("q");
    if (queryParam) {
      setSearchQuery(queryParam);
      handleSearch(queryParam);
    } else {
      // If no search query, load the first page of all anime
      loadAllAnime(1);
    }
  }, [location.search]);
  
  // Function to handle search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadAllAnime(1);
      return;
    }
    
    setIsLoading(true);
    setIsSearching(true);
    
    try {
      const results = await searchAnime(query);
      setSearchResults(results);
      setTotalAnime(results.length);
      setTotalPages(1); // Search results are not paginated by the API
      setPage(1);
    } catch (error) {
      console.error("Error searching anime:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск аниме",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load all anime with pagination
  const loadAllAnime = async (pageNumber: number) => {
    setIsLoading(true);
    setIsSearching(false);
    
    try {
      const { data, count } = await getAnimeList(pageNumber, limit);
      setSearchResults(data);
      setTotalAnime(count);
      setTotalPages(Math.ceil(count / limit));
      setPage(pageNumber);
    } catch (error) {
      console.error("Error loading anime list:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список аниме",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update URL with search query
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    handleSearch(searchQuery);
  };
  
  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    if (isSearching) {
      // If we're searching, we don't need to load a new page
      return;
    }
    
    window.scrollTo(0, 0);
    loadAllAnime(newPage);
  };
  
  // Function to import more anime from DatabaseAnime
  const handleImportMoreAnime = async () => {
    setIsLoading(true);
    toast({
      title: "Импорт аниме",
      description: "Начат процесс импорта аниме, это может занять некоторое время...",
    });
    
    try {
      const result = await performFullAnimeImport();
      
      if (result.success) {
        toast({
          title: "Импорт завершен",
          description: result.message,
        });
        // Reload the current page
        if (isSearching) {
          handleSearch(searchQuery);
        } else {
          loadAllAnime(page);
        }
      } else {
        toast({
          title: "Ошибка импорта",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing anime:", error);
      toast({
        title: "Ошибка импорта",
        description: "Не удалось выполнить импорт аниме",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      <NavigationMenu />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">Поиск аниме</h1>
          
          <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-6">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Введите название аниме..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] focus-visible:ring-red-500 w-full"
              />
            </div>
            <Button type="submit" className="bg-red-500 hover:bg-red-600">
              Найти
            </Button>
          </form>
          
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <span className="text-gray-400">
                Найдено: {totalAnime}
              </span>
              <Button 
                variant="outline" 
                className="border-[#2a2a2a] text-gray-300"
                onClick={handleImportMoreAnime}
                disabled={isLoading}
              >
                Импортировать больше аниме
              </Button>
            </div>
            
            <Button variant="ghost" className="text-gray-300">
              <Filter size={18} className="mr-2" />
              Фильтры
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {searchResults.map((anime) => (
                  <Link
                    to={`/anime/${anime.id}`}
                    key={anime.id}
                    className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
                  >
                    <div className="relative">
                      <AspectRatio ratio={3/4}>
                        <img 
                          src={anime.image || "/placeholder.svg"} 
                          alt={anime.title} 
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                      </AspectRatio>
                      {anime.rating > 0 && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span>{anime.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {anime.video_url && (
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          Видео
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium mb-1 line-clamp-1 hover:text-red-500 transition-colors">
                        {anime.title}
                      </h3>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>{anime.episodes > 0 ? `${anime.episodes} серий` : "N/A"}</span>
                        <span>{anime.year || "N/A"}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#1a1a1a] rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
                <p className="text-gray-400 text-center mb-4">
                  {searchQuery 
                    ? `По запросу "${searchQuery}" ничего не найдено` 
                    : "В базе данных пока нет аниме"}
                </p>
                <Button onClick={handleImportMoreAnime} className="bg-red-500 hover:bg-red-600">
                  Импортировать аниме
                </Button>
              </div>
            )}
            
            {!isSearching && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Search;
