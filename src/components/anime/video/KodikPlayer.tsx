
import { useState, useEffect } from "react";
import { AnimeEpisode } from "@/types/anime";
import { useToast } from "@/components/ui/use-toast";
import EpisodeSelector from "./EpisodeSelector";
import SampleVideoButton from "./SampleVideoButton";

interface KodikPlayerProps {
  videoUrl: string;
  title: string;
  animeId?: number;
  episodes?: AnimeEpisode[];
  onEpisodeChange?: (episode: AnimeEpisode) => void;
  currentEpisode?: AnimeEpisode;
}

const KodikPlayer = ({
  videoUrl,
  title,
  animeId,
  episodes = [],
  onEpisodeChange,
  currentEpisode
}: KodikPlayerProps) => {
  const [playerUrl, setPlayerUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (videoUrl) {
      try {
        // Transform URL if needed or use directly if it's already a Kodik URL
        const processedUrl = processKodikUrl(videoUrl);
        setPlayerUrl(processedUrl);
        setHasError(false);
      } catch (error) {
        console.error("Error processing video URL:", error);
        setHasError(true);
        toast({
          title: "Ошибка загрузки видео",
          description: "Не удалось загрузить видео. Проверьте URL или попробуйте другой эпизод.",
          variant: "destructive",
        });
      }
    } else {
      setHasError(true);
    }
  }, [videoUrl, toast]);

  // Simple function to process URLs - can be expanded based on your needs
  const processKodikUrl = (url: string): string => {
    // If it's already a Kodik URL, return it
    if (url.includes("kodik") || url.includes("iframe")) {
      return url;
    }
    
    // If it's a YouTube URL, convert it to embed format
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = extractYouTubeVideoId(url);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // For non-Kodik URLs, we return the original for now
    // You may want to implement a server-side function to convert URLs to Kodik
    return url;
  };

  // Helper function to extract YouTube video ID
  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Handle when a sample video is added
  const handleSampleVideoAdded = (newVideoUrl: string) => {
    try {
      const processedUrl = processKodikUrl(newVideoUrl);
      setPlayerUrl(processedUrl);
      setHasError(false);
      toast({
        title: "Видео добавлено",
        description: "Пример видео успешно загружен",
      });
    } catch (error) {
      setHasError(true);
      toast({
        title: "Ошибка загрузки видео",
        description: "Не удалось загрузить видео",
        variant: "destructive",
      });
    }
  };

  // If there's no valid player URL, show error UI
  if (hasError || !playerUrl) {
    return (
      <div className="space-y-4">
        <div className="p-8 bg-black/50 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Видео недоступно</h3>
          <p className="mb-6 text-gray-300">
            {hasError ? 
              "Не удалось загрузить видео. Возможно, ссылка устарела или видео недоступно." : 
              "Для этого аниме еще не добавлено видео."}
          </p>
          {animeId && (
            <SampleVideoButton animeId={animeId} onVideoAdded={handleSampleVideoAdded} />
          )}
        </div>
        
        {/* Episode selector still available even if main video has error */}
        {episodes && episodes.length > 0 && onEpisodeChange && currentEpisode && (
          <EpisodeSelector
            episodes={episodes}
            currentEpisode={currentEpisode}
            onEpisodeChange={onEpisodeChange}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
        <iframe
          src={playerUrl}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation"
          loading="lazy"
        ></iframe>
      </div>

      {/* Episode selector */}
      {episodes && episodes.length > 0 && onEpisodeChange && (
        <EpisodeSelector
          episodes={episodes}
          currentEpisode={currentEpisode || null}
          onEpisodeChange={onEpisodeChange}
        />
      )}
    </div>
  );
};

export default KodikPlayer;
