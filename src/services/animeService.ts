
interface Anime {
  id: number;
  title: string;
  image: string;
  description?: string;
  episodes?: number;
  year?: number;
  genre?: string[];
  rating?: number;
  newEpisodes?: number;
  status?: string;
}

const JIKAN_API_BASE_URL = "https://api.jikan.moe/v4";

// Simple cache to avoid excessive API calls
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

const fetchWithCache = async (url: string) => {
  const now = Date.now();
  
  // Check if we have a cached response and if it's still valid
  if (cache[url] && now - cache[url].timestamp < CACHE_EXPIRY) {
    console.log("Using cached data for:", url);
    return cache[url].data;
  }
  
  // Add a delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("Fetching from API:", url);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  cache[url] = { data, timestamp: now };
  
  return data;
};

// Transforms Jikan API data to our app's format
const transformAnimeData = (animeData: any): Anime => {
  return {
    id: animeData.mal_id,
    title: animeData.title || animeData.title_english || "Неизвестное аниме",
    image: animeData.images?.jpg?.large_image_url || animeData.images?.jpg?.image_url || "https://via.placeholder.com/225x350?text=No+Image",
    description: animeData.synopsis || "Описание отсутствует",
    episodes: animeData.episodes || 0,
    year: animeData.year || (animeData.aired?.prop?.from?.year) || new Date().getFullYear(),
    genre: animeData.genres?.map((g: any) => g.name) || [],
    rating: animeData.score || 0,
    status: animeData.status || "Unknown",
  };
};

// Get trending anime
export const getTrendingAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchWithCache(`${JIKAN_API_BASE_URL}/top/anime?filter=airing&limit=10`);
    return data.data.map(transformAnimeData);
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }
};

// Get recent anime
export const getRecentAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchWithCache(`${JIKAN_API_BASE_URL}/seasons/now?limit=10`);
    return data.data.map((anime: any) => ({
      ...transformAnimeData(anime),
      newEpisodes: Math.floor(Math.random() * 3) + 1, // Simulating new episodes
    }));
  } catch (error) {
    console.error("Error fetching recent anime:", error);
    return [];
  }
};

// Get popular anime
export const getPopularAnime = async (): Promise<Anime[]> => {
  try {
    const data = await fetchWithCache(`${JIKAN_API_BASE_URL}/top/anime?filter=bypopularity&limit=12`);
    return data.data.map(transformAnimeData);
  } catch (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }
};

// Get anime by ID
export const getAnimeById = async (id: number): Promise<Anime | null> => {
  try {
    const data = await fetchWithCache(`${JIKAN_API_BASE_URL}/anime/${id}`);
    return transformAnimeData(data.data);
  } catch (error) {
    console.error(`Error fetching anime ${id}:`, error);
    return null;
  }
};

// Search anime
export const searchAnime = async (query: string): Promise<Anime[]> => {
  if (!query || query.trim().length < 3) return [];
  
  try {
    const data = await fetchWithCache(`${JIKAN_API_BASE_URL}/anime?q=${encodeURIComponent(query)}&limit=20`);
    return data.data.map(transformAnimeData);
  } catch (error) {
    console.error("Error searching anime:", error);
    return [];
  }
};
