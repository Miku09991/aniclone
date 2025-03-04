
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchSampleVideoForAnime } from "@/lib/api/animeImport";
import { toast } from "@/components/ui/use-toast";

interface SampleVideoButtonProps {
  animeId: number;
  onVideoAdded: (videoUrl: string) => void;
}

const SampleVideoButton = ({ animeId, onVideoAdded }: SampleVideoButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchSampleVideo = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSampleVideoForAnime(animeId);
      
      if (result.success && result.videoUrl) {
        onVideoAdded(result.videoUrl);
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
};

export default SampleVideoButton;
