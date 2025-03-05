
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

/**
 * Fetches sample video URL for anime that don't have one
 * @param animeId ID of the anime to update
 */
export async function fetchSampleVideoForAnime(animeId: number) {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-sample-video', {
      body: { animeId }
    });
    
    if (error) {
      console.error('Error fetching sample video:', error);
      return { success: false, message: error.message };
    }
    
    return data;
  } catch (err) {
    console.error('Error calling fetch-sample-video function:', err);
    return { success: false, message: 'Не удалось найти видео для аниме' };
  }
}

/**
 * Full import of anime database with enhanced search capabilities
 */
export async function performFullAnimeImport() {
  try {
    const { data, error } = await supabase.functions.invoke('import-from-database-anime');
    
    if (error) {
      console.error('Error performing full anime import:', error);
      return { success: false, message: error.message };
    }
    
    console.log('Full anime import result:', data);
    return data;
  } catch (err) {
    console.error('Error calling full anime import function:', err);
    return { success: false, message: 'Не удалось выполнить полный импорт аниме' };
  }
}

/**
 * Imports all anime with episodes and videos from various sources
 */
export async function importAllAnimeWithEpisodes() {
  try {
    console.log('Calling import-all-anime function...');
    const { data, error } = await supabase.functions.invoke('import-all-anime', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Error importing all anime with episodes:', error);
      return { 
        success: false, 
        message: error.message || 'Произошла ошибка при импорте аниме с эпизодами'
      };
    }
    
    console.log('All anime import result:', data);
    return data;
  } catch (err) {
    console.error('Error calling import-all-anime function:', err);
    return { 
      success: false, 
      message: 'Не удалось импортировать все аниме с эпизодами. Попробуйте еще раз или импортируйте меньшее количество аниме.' 
    };
  }
}

/**
 * Import anime with episodes and data from multiple sources (in batches)
 * @param limit Number of anime to import per batch
 * @param offset Offset to start from
 */
export async function importAnimeWithEpisodesFromSources(limit = 50, offset = 0) {
  try {
    console.log(`Calling import-anime-full function with limit=${limit}, offset=${offset}...`);
    
    // Fix: Pass query parameters in the URL instead of using 'params' property
    const { data, error } = await supabase.functions.invoke(`import-anime-full?limit=${limit}&offset=${offset}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (error) {
      console.error('Error importing anime with episodes:', error);
      return { 
        success: false, 
        message: error.message || 'Произошла ошибка при импорте аниме с эпизодами'
      };
    }
    
    console.log('Anime import result:', data);
    return data;
  } catch (err) {
    console.error('Error calling import-anime-full function:', err);
    return { 
      success: false, 
      message: 'Не удалось импортировать аниме с эпизодами. Попробуйте еще раз с другими параметрами.' 
    };
  }
}
