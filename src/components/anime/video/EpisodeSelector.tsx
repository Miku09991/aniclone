
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnimeEpisode } from "@/types/anime";
import { ChevronDown } from "lucide-react";

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
  
  const changeEpisode = (episode: AnimeEpisode) => {
    onEpisodeChange(episode);
    setShowEpisodeSelector(false);
  };

  return (
    <div className="mt-4">
      <Button 
        variant="outline" 
        onClick={() => setShowEpisodeSelector(!showEpisodeSelector)} 
        className="w-full flex justify-between items-center text-zinc-950"
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
        <div className="rounded-md mt-2 p-2 max-h-64 overflow-y-auto bg-zinc-900">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {episodes.map(episode => (
              <Button 
                key={episode.number} 
                variant={currentEpisode?.number === episode.number ? "default" : "outline"} 
                size="sm" 
                onClick={() => changeEpisode(episode)} 
                className="justify-start text-zinc-950"
              >
                Эпизод {episode.number}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EpisodeSelector;
