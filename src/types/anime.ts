
export interface Anime {
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
  video_url?: string;
}
