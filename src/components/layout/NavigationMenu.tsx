
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, LogIn, LogOut, Menu, X, Home, Calendar, List, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const NavigationMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const menuItems = [
    { title: "Главная", icon: Home, path: "/" },
    { title: "Релизы", icon: List, path: "/releases" },
    { title: "Расписание", icon: Calendar, path: "/schedule" },
    { title: "Избранное", icon: Heart, path: "/favorites" },
    { title: "О проекте", icon: Info, path: "/about" },
  ];

  return (
    <nav className="bg-[#0f0f0f] border-b border-[#2a2a2a] py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-red-500 mr-8">
              AniClone
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-gray-300 hover:text-white transition-colors flex items-center"
                >
                  <item.icon size={16} className="mr-1" />
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Поиск аниме..."
                className="bg-[#1a1a1a] border-[#2a2a2a] w-[200px] pr-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={16} className="text-gray-400" />}
                iconPosition="right"
              />
            </form>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile" className="text-gray-300 hover:text-white">
                    Профиль
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut size={16} className="mr-1" />
                  Выйти
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth" className="text-gray-300 hover:text-white">
                  <LogIn size={16} className="mr-1" />
                  Войти
                </Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#121212] border-r border-[#2a2a2a]">
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-red-500">AniClone</h2>
                  </div>
                  
                  <form onSubmit={handleSearch} className="mb-6">
                    <Input
                      type="text"
                      placeholder="Поиск аниме..."
                      className="bg-[#1a1a1a] border-[#2a2a2a] w-full"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={<Search size={16} className="text-gray-400" />}
                      iconPosition="right"
                    />
                  </form>
                  
                  <div className="space-y-4">
                    {menuItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block py-2 text-gray-300 hover:text-red-500 transition-colors flex items-center"
                      >
                        <item.icon size={20} className="mr-2" />
                        {item.title}
                      </Link>
                    ))}
                    
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          className="block py-2 text-gray-300 hover:text-red-500 transition-colors flex items-center"
                        >
                          Профиль пользователя
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left py-2 text-red-500 hover:text-red-400 transition-colors flex items-center"
                        >
                          <LogOut size={20} className="mr-2" />
                          Выйти
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="block py-2 text-gray-300 hover:text-red-500 transition-colors flex items-center"
                      >
                        <LogIn size={20} className="mr-2" />
                        Вход / Регистрация
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationMenu;
