import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/useMobile";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// In the navigation menu component, add a link to the admin page
const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    profile,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMobile();
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-red-500' : 'hover:text-gray-300';
  };
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  return <header className="bg-[#0f0f0f] text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">AniClone</Link>
          
          <nav className="hidden md:flex space-x-6 items-center">
            <Link to="/" className={isActive('/')}>Главная</Link>
            <Link to="/search" className={isActive('/search')}>Поиск</Link>
            {user && <>
                <Link to="/favorites" className={isActive('/favorites')}>Избранное</Link>
                <Link to="/profile" className={isActive('/profile')}>Профиль</Link>
                <Link to="/admin/import" className={isActive('/admin/import')}>Администрирование</Link>
              </>}
            
            {user ? <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.username} />
                  <AvatarFallback>{profile?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="text-zinc-950">Выйти</Button>
              </div> : <Link to="/auth" className={isActive('/auth')}>Войти</Link>}
          </nav>
          
          {isMobile && <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-[#0f0f0f] text-white w-64">
                <SheetHeader>
                  <SheetTitle>Меню</SheetTitle>
                  <SheetDescription>
                    Навигация по сайту
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 flex flex-col space-y-2">
                  <Link to="/" className={`block py-2 ${isActive('/')}`} onClick={() => setIsOpen(false)}>Главная</Link>
                  <Link to="/search" className={`block py-2 ${isActive('/search')}`} onClick={() => setIsOpen(false)}>Поиск</Link>
                  {user && <>
                      <Link to="/favorites" className={`block py-2 ${isActive('/favorites')}`} onClick={() => setIsOpen(false)}>Избранное</Link>
                      <Link to="/profile" className={`block py-2 ${isActive('/profile')}`} onClick={() => setIsOpen(false)}>Профиль</Link>
                      <Link to="/admin/import" className={`block py-2 ${isActive('/admin/import')}`} onClick={() => setIsOpen(false)}>Администрирование</Link>
                    </>}
                  {!user ? <Link to="/auth" className={`block py-2 ${isActive('/auth')}`} onClick={() => setIsOpen(false)}>Войти</Link> : <Button variant="outline" size="sm" onClick={handleSignOut}>Выйти</Button>}
                </div>
              </SheetContent>
            </Sheet>}
        </div>
      </div>
      
    </header>;
};
export default NavigationMenu;