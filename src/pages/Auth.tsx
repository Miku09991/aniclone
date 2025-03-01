
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/auth/AuthForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 text-gray-300 hover:text-white"
          asChild
        >
          <Link to="/">
            <ArrowLeft size={20} className="mr-2" />
            Вернуться на главную
          </Link>
        </Button>
        
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-8">
            Войдите или зарегистрируйтесь в AniClone
          </h1>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
