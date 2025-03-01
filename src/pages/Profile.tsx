
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/user/UserProfile";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/auth");
    }
  }, [navigate]);

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
        
        <h1 className="text-2xl font-bold mb-8">Профиль пользователя</h1>
        <UserProfile />
      </div>
    </div>
  );
};

export default Profile;
