
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import AnimeDetails from "./pages/AnimeDetails";
import Favorites from "./pages/Favorites";
import WatchAnime from "./pages/WatchAnime";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:id" element={<WatchAnime />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/releases" element={<NotFound />} />
            <Route path="/schedule" element={<NotFound />} />
            <Route path="/teams" element={<NotFound />} />
            <Route path="/about" element={<NotFound />} />
            <Route path="/faq" element={<NotFound />} />
            <Route path="/contacts" element={<NotFound />} />
            <Route path="/terms" element={<NotFound />} />
            <Route path="/popular" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
