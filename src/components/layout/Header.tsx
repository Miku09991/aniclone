
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, Menu, UserRound, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  user: any | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  handleLogout: () => void;
  toggleMenu: () => void;
}

const Header = ({ 
  user, 
  searchQuery, 
  setSearchQuery, 
  handleSearch, 
  handleLogout, 
  toggleMenu 
}: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-[#121212] border-b border-[#2a2a2a]">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-4 text-gray-300 hover:text-white transition-colors" 
            onClick={toggleMenu}
          >
            <Menu size={24} />
          </button>
          <Link to="/" className="text-2xl font-bold text-red-500">
            AniClone
          </Link>
        </div>
        
        <div className="hidden md:flex space-x-6 text-sm">
          <Link to="/" className="text-white hover:text-red-500 transition-colors">
            Главная
          </Link>
          <Link to="/releases" className="text-gray-300 hover:text-red-500 transition-colors">
            Релизы
          </Link>
          <Link to="/schedule" className="text-gray-300 hover:text-red-500 transition-colors">
            Расписание
          </Link>
          <Link to="/favorites" className="text-gray-300 hover:text-red-500 transition-colors">
            Избранное
          </Link>
          <Link to="/teams" className="text-gray-300 hover:text-red-500 transition-colors">
            Команда
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Поиск аниме..."
              className="bg-[#1a1a1a] border-[#2a2a2a] w-48 lg:w-64 pr-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 text-gray-300"
            >
              <Search size={18} />
            </Button>
          </form>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-300 hover:text-white transition-colors"
            onClick={() => navigate("/search")}
          >
            <Search size={20} />
          </Button>
          
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white transition-colors">
            <Bell size={20} />
          </Button>
          
          {user ? (
            <div className="relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-300 hover:text-white transition-colors"
                onClick={() => navigate("/profile")}
              >
                <UserRound size={20} />
              </Button>
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[#1a1a1a] ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                <div className="py-1">
                  <Link 
                    to="/profile" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                  >
                    Профиль
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                  >
                    Избранное
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-[#2a2a2a]"
                  >
                    Выйти <LogOut size={14} className="inline ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-300 hover:text-white transition-colors"
              onClick={() => navigate("/auth")}
            >
              <LogIn size={20} />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
