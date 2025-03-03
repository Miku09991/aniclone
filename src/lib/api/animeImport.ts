
import { supabase } from '@/lib/supabase';

/**
 * Imports anime data from DatabaseAnime repository
 * 
 * @returns Promise with the result of the import operation
 */
export async function importAnimeFromDatabaseAnime() {
  try {
    console.log('Calling import-from-database-anime function...');
    const { data, error } = await supabase.functions.invoke('import-from-database-anime');
    
    if (error) {
      console.error('Error importing anime from DatabaseAnime:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Database import result:', data);
    return data;
  } catch (err) {
    console.error('Error calling DatabaseAnime import function:', err);
    return { success: false, message: 'Failed to import anime from DatabaseAnime' };
  }
}

/**
 * Auto-syncs anime with video data
 */
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

/**
 * Imports anime with videos
 */
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
