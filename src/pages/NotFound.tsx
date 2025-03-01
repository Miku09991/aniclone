
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4 text-white">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Страница не найдена</h2>
        <p className="text-gray-400 mb-8">
          К сожалению, запрашиваемая страница не существует или была удалена.
        </p>
        <Button asChild className="bg-red-500 hover:bg-red-600 transition-colors">
          <Link to="/" className="inline-flex items-center">
            <ArrowLeft size={16} className="mr-2" />
            Вернуться на главную
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
