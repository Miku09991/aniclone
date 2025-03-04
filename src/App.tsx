import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import AnimeDetails from './pages/AnimeDetails';
import WatchAnime from './pages/WatchAnime';
import Auth from './pages/Auth';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from "@/components/ui/toaster"
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

// If there's a new import for the admin page, add it here
import ImportData from "./pages/admin/ImportData";

const queryClient = new QueryClient()

// Add the new route to the routes array
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/anime/:id" element={<AnimeDetails />} />
            <Route path="/watch/:id" element={<WatchAnime />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin/import" element={<ImportData />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
