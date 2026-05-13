import AsyncStorage from '@react-native-async-storage/async-storage';

const GUESTBOOK_STORAGE_KEY = '@fish_museum_guestbook';

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  rating: number;
  date: string;
  mood?: string;
}

export const saveComment = async (entry: Omit<GuestbookEntry, 'id' | 'date'>): Promise<GuestbookEntry> => {
  try {
    const existingComments = await getComments();
    
    const newEntry: GuestbookEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const updatedComments = [newEntry, ...existingComments];
    await AsyncStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(updatedComments));
    return newEntry;
  } catch (error) {
    console.error('Yorum kaydedilirken hata oluştu:', error);
    throw error;
  }
};

export const getComments = async (): Promise<GuestbookEntry[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(GUESTBOOK_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Yorumlar çekilirken hata oluştu:', error);
    return [];
  }
};

export const deleteComment = async (id: string): Promise<void> => {
  try {
    const existingComments = await getComments();
    const updatedComments = existingComments.filter(comment => comment.id !== id);
    await AsyncStorage.setItem(GUESTBOOK_STORAGE_KEY, JSON.stringify(updatedComments));
  } catch (error) {
    console.error('Yorum silinirken hata oluştu:', error);
    throw error;
  }
};
