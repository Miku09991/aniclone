
import { supabase } from "@/lib/supabase";

export async function importInitialAnimeData() {
  try {
    // Проверяем, есть ли данные в таблице animes
    const { count, error: countError } = await supabase
      .from('animes')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error("Ошибка при проверке данных:", countError);
      return;
    }

    // Если данные уже есть, не импортируем
    if (count && count > 0) {
      console.log("Данные аниме уже импортированы, количество:", count);
      return;
    }

    // Вызываем Edge Function для импорта данных
    const { data, error } = await supabase.functions.invoke('import-anime');

    if (error) {
      console.error("Ошибка при импорте данных:", error);
      return;
    }

    console.log("Результат импорта:", data);
  } catch (error) {
    console.error("Непредвиденная ошибка при импорте данных:", error);
  }
}
