import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Waves, ChevronRight, Fish, Info } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ALL_FISH_DATA, CATEGORIES_DATA } from '../data/fishData';

const { width } = Dimensions.get('window');

export default function MarineFishesScreen({ navigation, route }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const filter = route.params?.filter || 'all';

  const filteredFish = filter === 'all' 
    ? ALL_FISH_DATA 
    : ALL_FISH_DATA.filter(f => f.category === filter);

  const categoryInfo = CATEGORIES_DATA.find(c => c.filter === filter) || CATEGORIES_DATA[0];

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
        <Text style={[styles.headerTitle, { color: colors.white }]}>{t(categoryInfo.nameKey)}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroSection}>
          <categoryInfo.icon color={colors.secondary} size={40} />
          <Text style={[styles.heroTitle, { color: colors.white }]}>{t(categoryInfo.nameKey)}</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            {filter === 'all' ? 'Müzemizdeki tüm balık türlerini keşfedin.' : `${t(categoryInfo.nameKey)} kategorisindeki özel türler.`}
          </Text>
        </View>

        {filteredFish.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.fishCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('FishDetail', { fish: item })}
          >
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.fishIconBg}
            >
              {item.image ? (
                <Image source={item.image} style={styles.fishImage} resizeMode="contain" />
              ) : (
                <Fish color={colors.white} size={30} opacity={0.7} />
              )}
            </LinearGradient>
            <View style={styles.fishInfo}>
              <Text style={[styles.fishName, { color: colors.text }]}>{t(item.nameKey)}</Text>
              <Text style={[styles.fishSpecies, { color: colors.textSecondary }]}>{item.species}</Text>
              <View style={[styles.tag, { backgroundColor: colors.accent }]}>
                <Text style={styles.tagText}>{t(item.tagKey)}</Text>
              </View>
            </View>
            <ChevronRight color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        ))}
        
        {filteredFish.length === 0 && (
          <View style={styles.emptyContainer}>
            <Info color={colors.textSecondary} size={48} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Bu kategoride henüz balık bulunmamaktadır.</Text>
          </View>
        )}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollContent: { paddingHorizontal: 20 },
  heroSection: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  fishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  fishIconBg: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fishInfo: {
    flex: 1,
    marginLeft: 15,
  },
  fishName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fishSpecies: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fishImage: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  }
});
