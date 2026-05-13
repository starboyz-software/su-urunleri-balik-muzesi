import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Heart, ChevronRight, Fish } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFavorites, toggleFavorite, FishItem } from '../services/FavoriteService';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ALL_FISH_DATA } from '../data/fishData';

const { width } = Dimensions.get('window');

export default function FavoritesScreen({ navigation }: any) {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      loadFavorites();
    }
  }, [isFocused]);

  const loadFavorites = async () => {
    setLoading(true);
    const storedFavs = await getFavorites();
    // Map stored IDs to the latest ALL_FISH_DATA to get localized keys
    const localizedFavs = storedFavs.map(storedItem => {
      const fishData = ALL_FISH_DATA.find(f => f.id === storedItem.id);
      return fishData || storedItem;
    });
    setFavorites(localizedFavs);
    setLoading(false);
  };

  const handleRemoveFavorite = async (item: any) => {
    await toggleFavorite(item);
    loadFavorites();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.white }]}>{t('favorites.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 50 }} />
        ) : favorites.length > 0 ? (
          <View style={styles.grid}>
            {favorites.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.favCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('FishDetail', { fish: item })}
              >
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.fishIconBg}
                >
                  {typeof item.image === 'number' || (typeof item.image === 'object' && (item.image as any)?.uri) ? (
                    <Image source={item.image} style={styles.fishImage} />
                  ) : (
                    <Fish color={colors.white} size={40} opacity={0.6} />
                  )}
                </LinearGradient>
                <TouchableOpacity 
                  style={styles.heartButton} 
                  onPress={() => handleRemoveFavorite(item)}
                >
                  <Heart color={colors.accent} size={18} fill={colors.accent} />
                </TouchableOpacity>
                <View style={styles.favInfo}>
                  <Text style={[styles.favName, { color: colors.text }]} numberOfLines={1}>
                    {item.nameKey ? t(item.nameKey) : item.name}
                  </Text>
                  <Text style={[styles.favSpecies, { color: colors.textSecondary }]} numberOfLines={1}>{item.species}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Heart color={colors.surface} size={80} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('favorites.empty')}</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.exploreButtonText}>{t('favorites.explore_button')}</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  favCard: {
    width: (width - 45) / 2,
    borderRadius: 22,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
  },
  fishIconBg: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 12,
  },
  favInfo: {
    padding: 12,
  },
  favName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  favSpecies: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 20,
  },
  exploreButton: {
    marginTop: 20,
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 15,
  },
  exploreButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
});
