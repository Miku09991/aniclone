
import { useState } from "react";
import { AnimeEpisode } from "@/types/anime";
import { useVideoPlayer } from "./useVideoPlayer";
import VideoControls from "./VideoControls";
import VideoTitle from "./VideoTitle";
import EpisodeSelector from "./EpisodeSelector";
import SampleVideoButton from "./SampleVideoButton";

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

  // Handler for when a sample video is added
  const handleSampleVideoAdded = (newVideoUrl: string) => {
    setVideoSource(newVideoUrl);
  };

  // If there's no video URL and we have an animeId, show a button to fetch a sample video
  if (!videoSource && animeId) {
    return <SampleVideoButton animeId={animeId} onVideoAdded={handleSampleVideoAdded} />;
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
