
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { getTrendingAnime, getRecentAnime, getPopularAnime } from "@/services/animeService";
import { Anime } from "@/types/anime";

// Import components
import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/home/HeroSlider";
import NewReleases from "@/components/home/NewReleases";
import PopularAnime from "@/components/home/PopularAnime";
import LoadingSpinner from "@/components/home/LoadingSpinner";

const Index = () => {
  const [mainSlides, setMainSlides] = useState<Anime[]>([]);
  const [newReleases, setNewReleases] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Fetch anime data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch trending anime for main slider
        const trending = await getTrendingAnime();
        if (trending.length > 0) {
          setMainSlides(trending.slice(0, 3));
        }

        // Fetch recent anime
        const recent = await getRecentAnime();
        if (recent.length > 0) {
          setNewReleases(recent.slice(0, 6));
        }

        // Fetch popular anime
        const popular = await getPopularAnime();
        if (popular.length > 0) {
          setPopularAnime(popular);
        }
      } catch (error) {
        console.error("Failed to fetch anime data:", error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные об аниме",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Auto slide for main banner
  useEffect(() => {
    if (mainSlides.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [mainSlides.length]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Выход выполнен",
      description: "Вы успешно вышли из аккаунта",
    });
  };

  // Use placeholder data if API data is not loaded yet
  useEffect(() => {
    if (mainSlides.length === 0) {
      setMainSlides([
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
    }
    
    if (newReleases.length === 0) {
      setNewReleases([
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
    }
    
    if (popularAnime.length === 0) {
      setPopularAnime([
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
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header 
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        handleLogout={handleLogout}
        toggleMenu={toggleMenu}
      />

      <MobileMenu 
        isMenuOpen={isMenuOpen}
        toggleMenu={toggleMenu}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        user={user}
        handleLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <HeroSlider 
              slides={mainSlides}
              currentSlide={currentSlide}
              setCurrentSlide={setCurrentSlide}
            />

            <NewReleases releases={newReleases} />

            <PopularAnime animeList={popularAnime} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
