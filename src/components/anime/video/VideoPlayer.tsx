
import { useState, useEffect } from "react";
import { AnimeEpisode } from "@/types/anime";
import { useVideoPlayer } from "./useVideoPlayer";
import VideoControls from "./VideoControls";
import VideoTitle from "./VideoTitle";
import EpisodeSelector from "./EpisodeSelector";
import SampleVideoButton from "./SampleVideoButton";
import { useToast } from "@/components/ui/use-toast";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  animeId?: number;
  episodes?: AnimeEpisode[];
  onEpisodeChange?: (episode: AnimeEpisode) => void;
  currentEpisode?: AnimeEpisode;
}

const VideoPlayer = ({ 
  videoUrl, 
  title, 
  animeId, 
  episodes = [], 
  onEpisodeChange,
  currentEpisode
}: VideoPlayerProps) => {
  const [videoSource, setVideoSource] = useState(videoUrl);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();
  
  const {
    videoRef,
    playerRef,
    isPlaying,
    isMuted,
    volume,
    progress,
    currentTime,
    duration,
    isControlsVisible,
    handleLoadedMetadata,
    handleTimeUpdate,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleProgressChange,
    toggleFullscreen,
    formatTime,
    skipForward,
    skipBackward,
  } = useVideoPlayer(videoSource);

  // Update video source when props change
  useEffect(() => {
    if (videoUrl) {
      setVideoSource(videoUrl);
      setVideoError(false);
    }
  }, [videoUrl]);

  // Handler for when a sample video is added
  const handleSampleVideoAdded = (newVideoUrl: string) => {
    setVideoSource(newVideoUrl);
    setVideoError(false);
    toast({
      title: "Видео добавлено",
      description: "Пример видео успешно загружен",
    });
  };

  // Handler for video error
  const handleVideoError = () => {
    console.error("Error loading video from URL:", videoSource);
    setVideoError(true);
    
    toast({
      title: "Ошибка загрузки видео",
      description: "Не удалось загрузить видео. Попробуйте другой эпизод или аниме.",
      variant: "destructive",
    });
  };

  // If there's no video URL and we have an animeId, show a button to fetch a sample video
  if ((!videoSource || videoError) && animeId) {
    return (
      <div className="space-y-4">
        <div className="p-8 bg-black/50 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-4">Видео недоступно</h3>
          <p className="mb-6 text-gray-300">
            {videoError ? 
              "Не удалось загрузить видео. Возможно, ссылка устарела или видео недоступно." : 
              "Для этого аниме еще не добавлено видео."}
          </p>
          <SampleVideoButton animeId={animeId} onVideoAdded={handleSampleVideoAdded} />
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
    <div className="space-y-2">
      <div 
        ref={playerRef}
        className="relative w-full bg-black rounded-lg overflow-hidden group"
      >
        <video
          ref={videoRef}
          className="w-full h-full"
          src={videoSource}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
          onError={handleVideoError}
          playsInline
        />
        
        {/* Video controls overlay */}
        <VideoControls
          isPlaying={isPlaying}
          isMuted={isMuted}
          volume={volume}
          progress={progress}
          currentTime={currentTime}
          duration={duration}
          isControlsVisible={isControlsVisible}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          handleProgressChange={handleProgressChange}
          skipForward={skipForward}
          skipBackward={skipBackward}
          toggleFullscreen={toggleFullscreen}
          formatTime={formatTime}
        />
        
        {/* Title overlay at the top */}
        <div className={`absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}>
          <VideoTitle 
            title={title} 
            episodeNumber={currentEpisode?.number} 
          />
        </div>
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

export default VideoPlayer;
