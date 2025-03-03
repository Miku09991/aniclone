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

// User management functions
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

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error('Error signing in with Google:', error);
    return false;
  }
  
  return true;
}

// Password and email management
export async function updateUserEmail(newEmail: string) {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  });
  
  if (error) {
    console.error('Error updating email:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, message: 'Проверьте вашу почту для подтверждения изменения email' };
}

export async function updateUserPassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });
  
  if (error) {
    console.error('Error updating password:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, message: 'Пароль успешно обновлен' };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  
  if (error) {
    console.error('Error resetting password:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, message: 'Проверьте вашу почту для сброса пароля' };
}

export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    // Upload the file to the avatars bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL of the file
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update the user's profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: data.publicUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return { success: true, avatarUrl: data.publicUrl };
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: error.message };
  }
}

// Anime-related functions
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

// Favorites management
export async function toggleFavorite(animeId: number) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    console.error('Error getting user:', userError);
    return false;
  }
  
  const userId = userData.user.id;
  
  const { data: existingFavorite, error: checkError } = await supabase
    .from('favorites')
    .select('id')
    .eq('anime_id', animeId)
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('Error checking favorites:', checkError);
    return false;
  }
  
  if (existingFavorite) {
    const { error: deleteError } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existingFavorite.id);
    
    if (deleteError) {
      console.error('Error removing from favorites:', deleteError);
      return false;
    }
    
    return false;
  } else {
    const { error: insertError } = await supabase
      .from('favorites')
      .insert({
        anime_id: animeId,
        user_id: userId
      });
    
    if (insertError) {
      console.error('Error adding to favorites:', insertError);
      return false;
    }
    
    return true;
  }
}

export async function isFavorite(animeId: number) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return false;
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('anime_id', animeId)
    .eq('user_id', userData.user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
  
  return !!data;
}

export async function getFavoriteAnimes() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('favorites')
    .select('anime_id, animes(*)')
    .eq('user_id', userData.user.id);
  
  if (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
  
  return data.map(item => item.animes as unknown as Anime);
}

export async function getAnimesWithVideos(limit = 10) {
  const { data, error } = await supabase
    .from('animes')
    .select('*')
    .not('video_url', 'is', null)
    .limit(limit);
  
  if (error) {
    console.error('Error fetching animes with videos:', error);
    return [];
  }
  
  return data as Anime[];
}

// Data synchronization functions
export async function syncAnimeDatabase() {
  try {
    const { data, error } = await supabase.functions.invoke('sync-anime');
    
    if (error) {
      console.error('Error syncing anime database with Jikan API:', error);
      
      const anilibriaResult = await importAnimeFromAnilibria();
      return anilibriaResult;
    }
    
    return data;
  } catch (err) {
    console.error('Error calling sync function:', err);
    
    try {
      const anilibriaResult = await importAnimeFromAnilibria();
      return anilibriaResult;
    } catch (anilibriaErr) {
      console.error('Error calling AniLibria import function:', anilibriaErr);
      return { success: false, message: 'Failed to sync anime database from any source' };
    }
  }
}

export async function importAnimeFromAnilibria() {
  try {
    const { data, error } = await supabase.functions.invoke('import-anilibria');
    
    if (error) {
      console.error('Error importing anime from AniLibria:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling AniLibria import function:', err);
    return { success: false, message: 'Failed to import anime from AniLibria' };
  }
}

// New function for importing anime with videos
export async function importAnimeWithVideos() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return { success: false, message: 'Требуется авторизация' };
    }

    const { data, error } = await supabase.functions.invoke('import-anime-with-videos', {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });
    
    if (error) {
      console.error('Error importing anime with videos:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling import-anime-with-videos function:', err);
    return { success: false, message: 'Не удалось импортировать аниме с видео' };
  }
}

// Auto-sync anime with videos
export async function autoSyncAnimeWithVideos() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      return { success: false, message: 'Требуется авторизация' };
    }

    const { data, error } = await supabase.functions.invoke('auto-sync-anime', {
      headers: {
        Authorization: `Bearer ${session.session.access_token}`
      }
    });
    
    if (error) {
      console.error('Error syncing anime with videos:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling auto-sync-anime function:', err);
    return { success: false, message: 'Не удалось синхронизировать аниме с видео' };
  }
}

// Add this new function to import anime from DatabaseAnime
export async function importAnimeFromDatabaseAnime() {
  try {
    const { data, error } = await supabase.functions.invoke('import-from-database-anime');
    
    if (error) {
      console.error('Error importing anime from DatabaseAnime:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling DatabaseAnime import function:', err);
    return { success: false, message: 'Failed to import anime from DatabaseAnime' };
  }
}
