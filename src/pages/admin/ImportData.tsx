
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Database, Film, RefreshCw, Server, Layers, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { 
  importAnimeFromDatabaseAnime, 
  autoSyncAnimeWithVideos, 
  importAnimeWithVideos,
  importAllAnimeWithEpisodes,
  importAnimeWithEpisodesFromSources
} from "@/lib/api/animeImport";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

const ImportData = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [importLimit, setImportLimit] = useState("50");
  const [importOffset, setImportOffset] = useState("0");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Check authentication
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Доступ запрещен</AlertTitle>
          <AlertDescription>
            Для доступа к этой странице необходимо авторизоваться.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/auth")}>Войти</Button>
      </div>
    );
  }
  
  const handleDatabaseImport = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const result = await importAnimeFromDatabaseAnime();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Импорт завершен",
          description: result.message,
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing anime:", error);
      setImportResult({
        success: false,
        message: "Произошла ошибка при импорте данных",
      });
      
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при импорте данных",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
  
  const handleVideoImport = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const result = await importAnimeWithVideos();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Импорт видео завершен",
          description: result.message,
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing videos:", error);
      setImportResult({
        success: false,
        message: "Произошла ошибка при импорте видео",
      });
      
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при импорте видео",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
  
  const handleAutoSync = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const result = await autoSyncAnimeWithVideos();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Синхронизация завершена",
          description: result.message,
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error syncing videos:", error);
      setImportResult({
        success: false,
        message: "Произошла ошибка при синхронизации видео",
      });
      
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при синхронизации видео",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const handleImportAllAnime = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      toast({
        title: "Начат импорт аниме",
        description: "Импорт всех аниме с сериями может занять некоторое время. Пожалуйста, подождите...",
      });
      
      const result = await importAllAnimeWithEpisodes();
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Импорт завершен",
          description: result.message,
        });
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing all anime:", error);
      setImportResult({
        success: false,
        message: "Произошла ошибка при импорте всех аниме",
      });
      
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при импорте всех аниме",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
  
  const handleImportAnimeFromSources = async () => {
    setImporting(true);
    setImportResult(null);
    
    try {
      const limit = parseInt(importLimit) || 50;
      const offset = parseInt(importOffset) || 0;
      
      toast({
        title: "Начат импорт аниме из источников",
        description: `Импортируем ${limit} аниме с отступом ${offset}...`,
      });
      
      const result = await importAnimeWithEpisodesFromSources(limit, offset);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "Импорт завершен",
          description: result.message,
        });
        
        // Update offset for next batch
        if (result.nextOffset) {
          setImportOffset(result.nextOffset.toString());
        }
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error importing anime from sources:", error);
      setImportResult({
        success: false,
        message: "Произошла ошибка при импорте аниме из источников",
      });
      
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при импорте аниме из источников",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Импорт данных</h1>
      
      {importResult && (
        <Alert
          variant={importResult.success ? "default" : "destructive"}
          className="mb-6"
        >
          {importResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {importResult.success ? "Успех" : "Ошибка"}
          </AlertTitle>
          <AlertDescription>{importResult.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <Database className="h-8 w-8 mb-2 text-blue-500" />
            <CardTitle>Импорт аниме</CardTitle>
            <CardDescription>
              Импорт базовых данных об аниме из открытых источников
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Импортирует основную информацию об аниме: названия, описания, рейтинги и прочее. Существующие записи не перезаписываются.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleDatabaseImport}
              disabled={importing}
              className="w-full"
            >
              {importing ? "Импорт..." : "Импортировать аниме"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <Film className="h-8 w-8 mb-2 text-purple-500" />
            <CardTitle>Импорт видео</CardTitle>
            <CardDescription>
              Добавление демо-видео к аниме
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Импортирует набор аниме с видео. Помогает заполнить базу контентом для просмотра.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleVideoImport}
              disabled={importing}
              className="w-full"
            >
              {importing ? "Импорт..." : "Импортировать видео"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <RefreshCw className="h-8 w-8 mb-2 text-green-500" />
            <CardTitle>Автоматическая синхронизация</CardTitle>
            <CardDescription>
              Автоматический поиск видео для аниме
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Пытается найти и добавить видео для аниме, у которых его нет.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleAutoSync}
              disabled={importing}
              className="w-full"
            >
              {importing ? "Синхронизация..." : "Запустить синхронизацию"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <Layers className="h-8 w-8 mb-2 text-amber-500" />
          <CardTitle>Импорт аниме из внешних источников</CardTitle>
          <CardDescription>
            Импорт аниме с эпизодами из JikanAPI (MyAnimeList)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Импортирует аниме с эпизодами и демо-видео из JikanAPI. Вы можете контролировать количество аниме и отступ для разбивки на порции.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Количество аниме</label>
              <Input 
                type="number" 
                value={importLimit} 
                onChange={(e) => setImportLimit(e.target.value)}
                min="1"
                max="100"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">Рекомендуется: 20-50</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Отступ</label>
              <Input 
                type="number" 
                value={importOffset} 
                onChange={(e) => setImportOffset(e.target.value)}
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Используйте для загрузки страницами</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleImportAnimeFromSources}
            disabled={importing}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {importing ? "Импорт..." : "Импортировать аниме с эпизодами"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="col-span-1 md:col-span-2 lg:col-span-3">
        <CardHeader>
          <Server className="h-8 w-8 mb-2 text-red-500" />
          <CardTitle>Импорт всех аниме с сериями</CardTitle>
          <CardDescription>
            Полный импорт аниме со всеми сериями и видео
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Импортирует большую коллекцию аниме из различных источников. Для каждого аниме создаются серии с демо-видео. 
            Это наиболее полный импорт, который может занять время.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleImportAllAnime}
            disabled={importing}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {importing ? "Выполняется полный импорт..." : "Запустить полный импорт"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImportData;
