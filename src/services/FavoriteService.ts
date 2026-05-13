import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@fish_museum_favorites';

export interface FishItem {
  id: string;
  name: string;
  species: string;
  image: string;
  tag?: string;
}

export const toggleFavorite = async (fish: FishItem) => {
  try {
    const existingFavsStr = await AsyncStorage.getItem(FAVORITES_KEY);
    let favorites: FishItem[] = existingFavsStr ? JSON.parse(existingFavsStr) : [];
    
    const isExist = favorites.find(f => f.id === fish.id);
    
    if (isExist) {
      favorites = favorites.filter(f => f.id !== fish.id);
    } else {
      favorites.push(fish);
    }

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return favorites;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
};

export const getFavorites = async (): Promise<FishItem[]> => {
  try {
    const favsStr = await AsyncStorage.getItem(FAVORITES_KEY);
    return favsStr ? JSON.parse(favsStr) : [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};

export const isFishFavorite = async (fishId: string): Promise<boolean> => {
  const favorites = await getFavorites();
  return favorites.some(f => f.id === fishId);
};
