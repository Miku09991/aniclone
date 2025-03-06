
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimeEpisode } from "@/types/anime";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EpisodeSelectorProps {
  episodes: AnimeEpisode[];
  currentEpisode: AnimeEpisode | null;
  onEpisodeChange: (episode: AnimeEpisode) => void;
}

const EpisodeSelector = ({
  episodes,
  currentEpisode,
  onEpisodeChange
}: EpisodeSelectorProps) => {
  const [showEpisodeSelector, setShowEpisodeSelector] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const changeEpisode = (episode: AnimeEpisode) => {
    onEpisodeChange(episode);
    setShowEpisodeSelector(false);
  };

  const filteredEpisodes = episodes.filter(episode => {
    const episodeNumber = episode.number.toString();
    const episodeTitle = episode.title.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return episodeNumber.includes(search) || episodeTitle.includes(search);
  });

  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        onClick={() => setShowEpisodeSelector(!showEpisodeSelector)} 
        className="w-full flex justify-between items-center bg-zinc-800 text-white hover:bg-zinc-700 border-zinc-700"
      >
        <span>
          {currentEpisode ? `Эпизод ${currentEpisode.number}: ${currentEpisode.title}` : 'Выбрать эпизод'}
        </span>
        <ChevronDown 
          className={`transition-transform ${showEpisodeSelector ? 'rotate-180' : ''}`} 
          size={20} 
        />
      </Button>
      
      {showEpisodeSelector && (
        <div className="rounded-md mt-2 p-4 max-h-80 overflow-y-auto bg-zinc-900 border border-zinc-800">
          {episodes.length > 10 && (
            <div className="mb-4 relative">
              <Input
                placeholder="Поиск эпизода..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" />
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredEpisodes.map(episode => (
              <Button 
                key={episode.number} 
                variant={currentEpisode?.number === episode.number ? "default" : "outline"} 
                size="sm" 
                onClick={() => changeEpisode(episode)} 
                className={`justify-start ${
                  currentEpisode?.number === episode.number 
                    ? "bg-primary" 
                    : "bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700"
                }`}
              >
                Эпизод {episode.number}
              </Button>
            ))}
          </div>
          
          {filteredEpisodes.length === 0 && (
            <p className="text-center text-zinc-400 py-4">Эпизоды не найдены</p>
          )}
        </div>
      )}
    </div>
  );
};

export default EpisodeSelector;
