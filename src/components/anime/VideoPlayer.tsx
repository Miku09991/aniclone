
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward, SkipBack, Loader2 } from "lucide-react";
import { fetchSampleVideoForAnime } from "@/lib/api/animeImport";
import { toast } from "@/components/ui/use-toast";

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  animeId?: number;
}

const VideoPlayer = ({ videoUrl, title, animeId }: VideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [videoSource, setVideoSource] = useState(videoUrl);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeout = useRef<number | null>(null);

  // Update video source if prop changes
  useEffect(() => {
    setVideoSource(videoUrl);
  }, [videoUrl]);

  // Обработка метаданных видео
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Обновление прогресса воспроизведения
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / duration) * 100);
    }
  };

  // Воспроизведение/пауза
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

  // Включение/выключение звука
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Изменение громкости
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  // Перемотка видео
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (videoRef.current) {
      const newTime = (value / 100) * duration;
      videoRef.current.currentTime = newTime;
      setProgress(value);
      setCurrentTime(newTime);
    }
  };

  // Полноэкранный режим
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

  // Форматирование времени
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Перемотка вперед на 10 секунд
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.currentTime + 10, duration);
    }
  };

  // Перемотка назад на 10 секунд
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 10, 0);
    }
  };

  // Try to fetch a sample video if this anime doesn't have one
  const fetchSampleVideo = async () => {
    if (!animeId) return;
    
    setIsLoading(true);
    try {
      const result = await fetchSampleVideoForAnime(animeId);
      
      if (result.success && result.videoUrl) {
        setVideoSource(result.videoUrl);
        toast({
          title: "Видео добавлено",
          description: "Демо-видео было добавлено для этого аниме"
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message || "Не удалось добавить видео",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching sample video:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить видео",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Скрытие элементов управления после бездействия
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

  // If there's no video URL and we have an animeId, show a button to fetch a sample video
  if (!videoSource && animeId) {
    return (
      <div className="relative w-full bg-black rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: "300px" }}>
        <div className="text-center p-8">
          <p className="text-white mb-4">Для этого аниме пока нет видео</p>
          <Button 
            onClick={fetchSampleVideo} 
            className="bg-red-500 hover:bg-red-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Загрузка...
              </>
            ) : (
              "Добавить демо-видео"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
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
      
      {/* Элементы управления */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 flex flex-col justify-between p-4 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Верхняя панель */}
        <div className="flex justify-between items-center">
          <h3 className="text-white text-lg font-medium truncate pr-4">{title}</h3>
        </div>
        
        {/* Центральная кнопка воспроизведения/паузы */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/20 hover:bg-white/30 rounded-full w-16 h-16 pointer-events-auto"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8 text-white" />
            ) : (
              <Play className="h-8 w-8 text-white ml-1" />
            )}
          </Button>
        </div>
        
        {/* Нижняя панель */}
        <div className="space-y-2">
          {/* Прогресс видео */}
          <div className="flex items-center space-x-2">
            <span className="text-white text-xs">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="flex-grow h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-500"
            />
            <span className="text-white text-xs">{formatTime(duration)}</span>
          </div>
          
          {/* Кнопки управления */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
                onClick={skipBackward}
              >
                <SkipBack className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20 rounded-full"
                onClick={skipForward}
              >
                <SkipForward className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-white/20 rounded-full"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/20 rounded-full"
              onClick={toggleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
