
import { useState, useRef, useEffect } from "react";

export const useVideoPlayer = (videoUrl: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [videoSource, setVideoSource] = useState(videoUrl);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeout = useRef<number | null>(null);

  // Update video source if prop changes
  useEffect(() => {
    setVideoSource(videoUrl);
  }, [videoUrl]);

  // Load metadata handler
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Mute toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume change handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // Progress change handler
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(value);
      setCurrentTime(newTime);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!playerRef.current) return;

    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => {
        console.error(`Ошибка при переходе в полноэкранный режим: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  // Skip backward 10 seconds
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Controls visibility effect
  useEffect(() => {
    const showControls = () => {
      setIsControlsVisible(true);
      
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      if (isPlaying) {
        controlsTimeout.current = window.setTimeout(() => {
          setIsControlsVisible(false);
        }, 3000);
      }
    };

    const playerElement = playerRef.current;
    
    if (playerElement) {
      playerElement.addEventListener('mousemove', showControls);
      playerElement.addEventListener('click', () => {
        if (!isControlsVisible) {
          showControls();
        }
      });
    }

    document.addEventListener('fullscreenchange', () => {
      setIsFullscreen(!!document.fullscreenElement);
    });

    return () => {
      if (playerElement) {
        playerElement.removeEventListener('mousemove', showControls);
      }
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      document.removeEventListener('fullscreenchange', () => {});
    };
  }, [isPlaying, isControlsVisible]);

  return {
    videoRef,
    playerRef,
    isPlaying,
    isMuted,
    volume,
    progress,
    currentTime,
    duration,
    videoSource,
    isControlsVisible,
    isFullscreen,
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
  };
};
