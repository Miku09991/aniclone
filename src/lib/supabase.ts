
import { createClient } from '@supabase/supabase-js';
import { Anime } from '@/types/anime';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tkrmpskyskudhvvyhgqd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcm1wc2t5c2t1ZGh2dnloZ3FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MDEzMzMsImV4cCI6MjA1NjM3NzMzM30.2unkL4WVqVuxx2g5_WVHAbZI37T9MEQI4TcQkuULGFA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Favorite = {
  id: string;
  user_id: string;
  anime_id: number;
  created_at: string;
};

// Функция для получения профиля пользователя
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
}

// Функция для обновления профиля пользователя
export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  
  return true;
}

// Функция для получения аниме по ID
export async function getAnimeById(id: number) {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching anime:', error);
    return null;
  }
  
  return data as Anime;
}

// Функция для получения списка аниме с пагинацией
export async function getAnimeList(page = 1, limit = 12) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('animes')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching anime list:', error);
    return { data: [], count: 0 };
  }
  
  return { data: data as Anime[], count: count || 0 };
}

// Функция для поиска аниме
export async function searchAnime(query: string) {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .ilike('title', `%${query}%`)
    .limit(20);
  
  if (error) {
    console.error('Error searching anime:', error);
    return [];
  }
  
  return data as Anime[];
}

// Функция для добавления/удаления аниме из избранного
export async function toggleFavorite(animeId: number) {
  const user = supabase.auth.getUser();
  if (!user) return false;
  
  const { data: existingFavorite } = await supabase
    .from('favorites')
    .select('*')
    .eq('anime_id', animeId)
    .eq('user_id', (await user).data.user?.id)
    .single();
  
  if (existingFavorite) {
    // Удаляем из избранного
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFavorite.id);
    
    return !error;
  } else {
    // Добавляем в избранное
    const { error } = await supabase
      .from('favorites')
      .insert({
        anime_id: animeId,
        user_id: (await user).data.user?.id
      });
    
    return !error;
  }
}

// Проверка, находится ли аниме в избранном у пользователя
export async function isFavorite(animeId: number) {
  const user = supabase.auth.getUser();
  if (!user) return false;
  
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('anime_id', animeId)
    .eq('user_id', (await user).data.user?.id)
    .single();
  
  return !!data;
}

// Получение избранных аниме пользователя
export async function getFavoriteAnimes() {
  const user = supabase.auth.getUser();
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('favorites')
    .select('anime_id, animes:animes(*)')
    .eq('user_id', (await user).data.user?.id);
  
  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  return data.map(item => item.animes) as Anime[];
}
