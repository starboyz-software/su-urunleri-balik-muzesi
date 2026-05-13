import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@fish_museum_history';

export interface HistoryItem {
  id: string;
  name: string;
  date: string;
  time: string;
  image: string;
}

export const saveScanToHistory = async (fishData: { name: string, image: string }) => {
  try {
    const existingHistoryStr = await AsyncStorage.getItem(HISTORY_KEY);
    const history: HistoryItem[] = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
    
    const now = new Date();
    const newItem: HistoryItem = {
      id: now.getTime().toString(),
      name: fishData.name,
      image: fishData.image,
      date: now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error('Error saving history:', error);
    return null;
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyStr = await AsyncStorage.getItem(HISTORY_KEY);
    return historyStr ? JSON.parse(historyStr) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
};
