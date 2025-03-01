
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export const importAnimeData = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('import-anime');
    
    if (error) {
      console.error('Error importing anime data:', error);
      toast({
        title: 'Ошибка при импорте данных',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
    
    if (data.success) {
      toast({
        title: 'Импорт данных успешен',
        description: data.message,
      });
      return true;
    } else {
      toast({
        title: 'Ошибка при импорте данных',
        description: data.message,
        variant: 'destructive',
      });
      return false;
    }
  } catch (err) {
    console.error('Error calling import function:', err);
    toast({
      title: 'Ошибка при импорте данных',
      description: 'Не удалось вызвать функцию импорта',
      variant: 'destructive',
    });
    return false;
  }
};
