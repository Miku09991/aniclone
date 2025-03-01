
import { Link } from "react-router-dom";
import { Search, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MobileMenuProps {
  isMenuOpen: boolean;
  toggleMenu: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  user: any | null;
  handleLogout: () => void;
}

const MobileMenu = ({ 
  isMenuOpen, 
  toggleMenu, 
  searchQuery, 
  setSearchQuery,
  handleSearch,
  user,
  handleLogout
}: MobileMenuProps) => {
  if (!isMenuOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-80 transition-opacity duration-300">
      <div className="fixed inset-y-0 left-0 w-64 bg-[#121212] shadow-lg p-4 transform transition-transform duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Меню</h2>
          <button onClick={toggleMenu} className="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск аниме..."
              className="bg-[#1a1a1a] border-[#2a2a2a] w-full pr-8"
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
          </div>
        </form>
        
        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="space-y-4">
            <Link to="/" className="block py-2 text-white hover:text-red-500 transition-colors" onClick={toggleMenu}>
              Главная
            </Link>
            <Separator className="bg-[#2a2a2a]" />
            <Link to="/releases" className="block py-2 text-gray-300 hover:text-red-500 transition-colors" onClick={toggleMenu}>
              Релизы
            </Link>
            <Separator className="bg-[#2a2a2a]" />
            <Link to="/schedule" className="block py-2 text-gray-300 hover:text-red-500 transition-colors" onClick={toggleMenu}>
              Расписание
            </Link>
            <Separator className="bg-[#2a2a2a]" />
            <Link to="/favorites" className="block py-2 text-gray-300 hover:text-red-500 transition-colors" onClick={toggleMenu}>
              Избранное
            </Link>
            <Separator className="bg-[#2a2a2a]" />
            <Link to="/teams" className="block py-2 text-gray-300 hover:text-red-500 transition-colors" onClick={toggleMenu}>
              Команда
            </Link>
            <Separator className="bg-[#2a2a2a]" />
            
            {user ? (
              <>
                <Link to="/profile" className="block py-2 text-gray-300 hover:text-red-500 transition-colors" onClick={toggleMenu}>
                  Профиль пользователя
                </Link>
                <Separator className="bg-[#2a2a2a]" />
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block w-full text-left py-2 text-red-500 hover:text-red-400 transition-colors"
                >
                  Выйти <LogOut size={16} className="inline ml-1" />
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="block py-2 text-gray-300 hover:text-red-500 transition-colors" 
                onClick={toggleMenu}
              >
                Вход / Регистрация <LogIn size={16} className="inline ml-1" />
              </Link>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default MobileMenu;
