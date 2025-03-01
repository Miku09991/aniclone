
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, Menu, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [mainSlides, setMainSlides] = useState([
    {
      id: 1,
      title: "Клинок, рассекающий демонов",
      image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1170&auto=format&fit=crop",
      description: "Действие разворачивается в Японии периода Тайсё. Главный герой, Танджиро Камадо, становится охотником на демонов после того, как его семья была убита, а младшая сестра Незуко, единственная выжившая, превратилась в демона.",
      episodes: 26,
      year: 2023,
      genre: ["Боевик", "Фэнтези", "Драма"],
      rating: 9.8,
    },
    {
      id: 2,
      title: "Человек-бензопила",
      image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1170&auto=format&fit=crop",
      description: "Дэнджи был обычным бедным парнем, который выплачивал огромный долг, ежедневно убивая демонов вместе со своим питомцем — демоном-бензопилой по имени Почита.",
      episodes: 12,
      year: 2022,
      genre: ["Боевик", "Ужасы", "Сверхъестественное"],
      rating: 9.5,
    },
    {
      id: 3,
      title: "Неуязвимый",
      image: "https://images.unsplash.com/photo-1559125148-415a119ff323?q=80&w=1074&auto=format&fit=crop",
      description: "После того, как Марк Грейсон получает свои суперсилы, он обнаруживает, что быть супергероем — не так уж и гламурно, как кажется.",
      episodes: 8,
      year: 2023,
      genre: ["Боевик", "Драма", "Супергерои"],
      rating: 9.2,
    },
  ]);

  const [newReleases, setNewReleases] = useState([
    {
      id: 4,
      title: "Магическая битва",
      image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=1170&auto=format&fit=crop",
      description: "Итадори Юдзи - обычный старшеклассник, обладающий невероятной физической силой. Но однажды он проглатывает проклятый предмет, и его жизнь кардинально меняется.",
      episodes: 24,
      year: 2023,
      genre: ["Фэнтези", "Школа", "Боевик"],
      rating: 9.7,
      newEpisodes: 2,
    },
    {
      id: 5,
      title: "Атака титанов",
      image: "https://images.unsplash.com/photo-1612544448105-cd216f78eba0?q=80&w=1170&auto=format&fit=crop",
      description: "Человечество оказалось на грани исчезновения из-за титанов, и люди создали защитные стены. Но титаны не оставляют попытки пробиться внутрь.",
      episodes: 75,
      year: 2022,
      genre: ["Боевик", "Драма", "Фэнтези"],
      rating: 9.9,
      newEpisodes: 1,
    },
    {
      id: 6,
      title: "Стальной алхимик",
      image: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?q=80&w=1170&auto=format&fit=crop",
      description: "Братья Элрик потеряли свои тела, пытаясь воскресить мать с помощью алхимии. Теперь они ищут философский камень, чтобы восстановить то, что потеряли.",
      episodes: 64,
      year: 2022,
      genre: ["Приключения", "Фэнтези", "Боевик"],
      rating: 9.6,
      newEpisodes: 3,
    },
  ]);

  const [popularAnime, setPopularAnime] = useState([
    {
      id: 7,
      title: "Ван Пис",
      image: "https://images.unsplash.com/photo-1560972550-aba3456b5564?q=80&w=1170&auto=format&fit=crop",
      episodes: 1000,
      year: 2023,
      genre: ["Приключения", "Комедия", "Фэнтези"],
      rating: 9.5,
    },
    {
      id: 8,
      title: "Наруто",
      image: "https://images.unsplash.com/photo-1604573714288-28d08c82594b?q=80&w=1170&auto=format&fit=crop",
      episodes: 720,
      year: 2020,
      genre: ["Боевик", "Приключения", "Фэнтези"],
      rating: 9.4,
    },
    {
      id: 9,
      title: "Токийский гуль",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1170&auto=format&fit=crop",
      episodes: 48,
      year: 2018,
      genre: ["Ужасы", "Сверхъестественное", "Драма"],
      rating: 9.3,
    },
    {
      id: 10,
      title: "Моя геройская академия",
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?q=80&w=1170&auto=format&fit=crop",
      episodes: 113,
      year: 2022,
      genre: ["Супергерои", "Школа", "Боевик"],
      rating: 9.2,
    },
    {
      id: 11,
      title: "Семь смертных грехов",
      image: "https://images.unsplash.com/photo-1591871937573-74dbba515c4c?q=80&w=1170&auto=format&fit=crop",
      episodes: 96,
      year: 2021,
      genre: ["Фэнтези", "Приключения", "Боевик"],
      rating: 9.1,
    },
    {
      id: 12,
      title: "Мастер меча онлайн",
      image: "https://images.unsplash.com/photo-1640499900704-b00dd6a1103a?q=80&w=1170&auto=format&fit=crop",
      episodes: 96,
      year: 2022,
      genre: ["Фэнтези", "Приключения", "Романтика"],
      rating: 9.0,
    },
  ]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainSlides.length]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
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
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white transition-colors">
              <Search size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white transition-colors">
              <Bell size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white transition-colors">
              <User size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
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
            <ScrollArea className="h-[calc(100vh-100px)]">
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
              </div>
            </ScrollArea>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        {/* Hero Slider */}
        <div className="relative rounded-lg overflow-hidden mb-10">
          {mainSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`transition-opacity duration-1000 absolute inset-0 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="relative w-full h-[60vh] md:h-[80vh]">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute inset-y-0 left-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl z-20">
                  <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6">{slide.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {slide.genre.map((genre) => (
                      <span key={genre} className="text-xs px-2 py-1 bg-red-500 bg-opacity-70 rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm md:text-base text-gray-200 mb-4 line-clamp-3 md:line-clamp-4">
                    {slide.description}
                  </p>
                  <div className="flex space-x-4 mb-6">
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{slide.rating}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-1">Серий:</span>
                      <span>{slide.episodes}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-gray-400 mr-1">Год:</span>
                      <span>{slide.year}</span>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    <Button className="bg-red-500 hover:bg-red-600 transition-colors">
                      Смотреть
                    </Button>
                    <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black transition-colors">
                      В избранное
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex justify-center z-20">
            <div className="flex space-x-2">
              {mainSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentSlide ? "bg-red-500" : "bg-gray-500"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Updates */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Новые эпизоды</h2>
            <Link 
              to="/releases" 
              className="text-red-500 hover:text-red-400 transition-colors flex items-center"
            >
              Смотреть все
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newReleases.map((anime) => (
              <div 
                key={anime.id} 
                className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
              >
                <div className="relative">
                  <AspectRatio ratio={16/9}>
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    +{anime.newEpisodes}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 line-clamp-1 hover:text-red-500 transition-colors">
                    <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{anime.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {anime.genre.slice(0, 2).map((genre) => (
                      <span key={genre} className="text-xs px-2 py-0.5 bg-[#2a2a2a] rounded-full">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{anime.rating}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 p-0">
                      Смотреть
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Anime */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Популярное</h2>
            <Link 
              to="/popular" 
              className="text-red-500 hover:text-red-400 transition-colors flex items-center"
            >
              Смотреть все
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularAnime.map((anime) => (
              <div 
                key={anime.id} 
                className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#2a2a2a] hover:border-red-500 transition-colors"
              >
                <div className="relative">
                  <AspectRatio ratio={3/4}>
                    <img 
                      src={anime.image} 
                      alt={anime.title} 
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>
                  <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                    <span className="text-yellow-400">★</span>
                    <span>{anime.rating}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium mb-1 line-clamp-1 hover:text-red-500 transition-colors">
                    <Link to={`/anime/${anime.id}`}>{anime.title}</Link>
                  </h3>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{anime.episodes} серий</span>
                    <span>{anime.year}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#121212] border-t border-[#2a2a2a] py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-4">AniClone</h3>
              <p className="text-gray-400 text-sm">
                Аниме-портал с огромной коллекцией аниме. Смотрите аниме онлайн в хорошем качестве совершенно бесплатно.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Навигация</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-red-500 transition-colors">
                    Главная
                  </Link>
                </li>
                <li>
                  <Link to="/releases" className="text-gray-300 hover:text-red-500 transition-colors">
                    Релизы
                  </Link>
                </li>
                <li>
                  <Link to="/schedule" className="text-gray-300 hover:text-red-500 transition-colors">
                    Расписание
                  </Link>
                </li>
                <li>
                  <Link to="/favorites" className="text-gray-300 hover:text-red-500 transition-colors">
                    Избранное
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Информация</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-red-500 transition-colors">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-300 hover:text-red-500 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/contacts" className="text-gray-300 hover:text-red-500 transition-colors">
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-300 hover:text-red-500 transition-colors">
                    Правила
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Подписка</h4>
              <p className="text-gray-400 text-sm mb-3">
                Подпишитесь на нашу рассылку, чтобы получать уведомления о новых релизах
              </p>
              <div className="flex">
                <Input 
                  type="email" 
                  placeholder="Ваш Email" 
                  className="bg-[#2a2a2a] border-[#3a3a3a] text-white rounded-r-none focus-visible:ring-red-500"
                />
                <Button className="bg-red-500 hover:bg-red-600 rounded-l-none">
                  Подписаться
                </Button>
              </div>
            </div>
          </div>
          <Separator className="my-6 bg-[#2a2a2a]" />
          <div className="text-center text-gray-400 text-sm">
            <p>© 2023 AniClone. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
