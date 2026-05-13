import React, { memo, useCallback, useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, TextInput, Keyboard, LayoutAnimation } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Fish, MapPin, Search, Bell, Info, Star, ChevronRight, Award, Moon, Sun, Heart, Waves, Anchor, Clock,
  Eye, TrendingDown, Navigation, Zap, Calendar, Map, Brain, Wind, Crown, Link, Droplet, Database, 
  Thermometer, Shield, Maximize, Move, Activity, Volume2, Image as ImageIcon, Send, Globe, BookOpen, Coffee, 
  ArrowDown, Layers, Compass, CloudRain, MessageCircle, PlusSquare, Music, TreePine, CheckCircle, Trophy,
  ArrowUpRight, X, TrendingUp, Sparkles
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { toggleFavorite, getFavorites } from '../services/FavoriteService';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ALL_FISH_DATA, CATEGORIES_DATA, DID_YOU_KNOW_DATA } from '../data/fishData';

const { width, height } = Dimensions.get('window');

// Optimized Sub-components
const CategoryItem = memo(({ cat, t, colors, onPress }: any) => (
  <TouchableOpacity 
    style={styles.categoryItem}
    onPress={onPress}
  >
    <View style={[styles.categoryIconCircle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <cat.icon color={colors.secondary} size={20} />
    </View>
    <Text style={[styles.categoryName, { color: colors.textSecondary }]}>{t(cat.nameKey)}</Text>
  </TouchableOpacity>
));

const FishCard = memo(({ item, t, colors, isFav, onToggleFav, onPress, gradient }: any) => (
  <TouchableOpacity 
    style={[styles.fishCard, { shadowColor: colors.primary }]}
    onPress={onPress}
    activeOpacity={0.9}
  >
    <View style={[styles.fishCardContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <LinearGradient colors={gradient} style={styles.fishIconBg} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <Fish 
          color="rgba(255,255,255,0.15)" 
          size={120} 
          style={{ position: 'absolute', right: -20, bottom: -20, transform: [{ rotate: '15deg' }] }} 
        />
        <View style={[styles.cardCircle, { top: -30, left: -30, width: 140, height: 140, backgroundColor: 'rgba(255,255,255,0.08)' }]} />
        
        {item.image ? (
          <Image 
            source={item.image} 
            style={styles.fishImage} 
            contentFit="contain" 
            transition={400} 
          />
        ) : (
          <Fish color={colors.white} size={48} opacity={0.3} />
        )}
        
        <View style={styles.glassTagContainer}>
          <BlurView intensity={30} tint="light" style={styles.glassTag}>
            <Text style={styles.glassTagText}>{t(item.tagKey)}</Text>
          </BlurView>
        </View>
      </LinearGradient>
      
      <View style={styles.fishInfoModern}>
        <View style={styles.fishMainInfo}>
          <Text style={[styles.fishNameModern, { color: colors.text }]} numberOfLines={1}>{t(item.nameKey)}</Text>
          <View style={styles.categoryRow}>
            <Waves size={12} color={colors.secondary} style={{ marginRight: 4 }} />
            <Text style={[styles.fishCategoryModern, { color: colors.secondary }]}>{item.category}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.favButtonModern, { backgroundColor: isFav ? COLORS.accent + '20' : colors.border }]} 
          onPress={() => onToggleFav(item)}
        >
          <Heart 
            size={18} 
            color={isFav ? COLORS.accent : colors.textSecondary} 
            fill={isFav ? COLORS.accent : 'transparent'} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardIndicator}>
        <ArrowUpRight size={14} color={colors.white} />
      </View>
    </View>
  </TouchableOpacity>
));

export default function HomeScreen({ navigation }: any) {
  const isFocused = useIsFocused();
  const { colors, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [favs, setFavs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredFish = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return ALL_FISH_DATA.filter(f => 
      t(f.nameKey).toLowerCase().includes(query) || 
      f.species.toLowerCase().includes(query) ||
      t(f.tagKey).toLowerCase().includes(query)
    );
  }, [searchQuery, t]);

  const loadFavs = useCallback(async () => {
    const favorites = await getFavorites();
    setFavs(favorites.map(f => f.id));
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadFavs();
    }
  }, [isFocused, loadFavs]);

  const handleToggleFav = useCallback(async (item: any) => {
    await toggleFavorite(item);
    loadFavs();
  }, [loadFavs]);

  const navigateToDetail = useCallback((item: any) => {
    Keyboard.dismiss();
    navigation.navigate('FishDetail', { fish: item });
  }, [navigation]);

  const dailyFish = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return ALL_FISH_DATA[dayOfYear % ALL_FISH_DATA.length];
  }, []);

  const handleClearSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearchQuery('');
    setIsSearching(false);
    Keyboard.dismiss();
  };

  const onSearchFocus = () => {
    if (searchQuery.length > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsSearching(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.background]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.headerFixed}>
        {/* Header */}
        {!isSearching && (
          <View style={styles.header}>
            <View>
              <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>{t('common.welcome')}</Text>
              <Text style={[styles.titleText, { color: colors.white }]}>{t('common.museum_name')}</Text>
            </View>
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
                {isDark ? <Sun color={colors.white} size={24} /> : <Moon color={colors.white} size={24} />}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: isSearching ? 10 : 0 }]}>
          <Search color={colors.textSecondary} size={20} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, textAlign: i18n.language === 'ar' ? 'right' : 'left' }]}
            placeholder={t('common.search_placeholder')}
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setSearchQuery(text);
              setIsSearching(text.length > 0);
            }}
            onFocus={onSearchFocus}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <X color={colors.textSecondary} size={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <View style={styles.searchResultsOverlay}>
          <BlurView intensity={Platform.OS === 'ios' ? 80 : 100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <ScrollView 
            contentContainerStyle={styles.searchResultsScroll}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.searchHeaderRow}>
              <View style={[styles.searchBadge, { backgroundColor: colors.secondary + '20' }]}>
                <Sparkles color={colors.secondary} size={14} style={{ marginRight: 6 }} />
                <Text style={[styles.searchBadgeText, { color: colors.secondary }]}>
                  {filteredFish.length} Tür Bulundu
                </Text>
              </View>
            </View>

            {filteredFish.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                activeOpacity={0.8}
                style={[styles.modernResultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigateToDetail(item)}
              >
                <LinearGradient 
                  colors={[colors.primary + '30', colors.secondary + '10']} 
                  style={styles.resultImageBg}
                >
                  <Image source={item.image} style={styles.resultImage} contentFit="contain" />
                </LinearGradient>
                
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultName, { color: colors.text }]}>{t(item.nameKey)}</Text>
                  <Text style={[styles.resultSpecies, { color: colors.textSecondary }]}>{item.species}</Text>
                  <View style={styles.resultTagRow}>
                    <View style={[styles.miniTag, { backgroundColor: colors.accent + '20' }]}>
                      <Text style={[styles.miniTagText, { color: colors.accent }]}>{t(item.tagKey)}</Text>
                    </View>
                    <View style={[styles.miniTag, { backgroundColor: colors.secondary + '20' }]}>
                      <Text style={[styles.miniTagText, { color: colors.secondary }]}>{item.category}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={[styles.resultArrow, { backgroundColor: colors.border }]}>
                  <ChevronRight color={colors.textSecondary} size={18} />
                </View>
              </TouchableOpacity>
            ))}

            {filteredFish.length === 0 && (
              <View style={styles.noResultLarge}>
                <View style={styles.noResultCircle}>
                  <Search color={colors.textSecondary} size={60} opacity={0.2} />
                </View>
                <Text style={[styles.noResultTitle, { color: colors.text }]}>Sonuç Bulunamadı</Text>
                <Text style={[styles.noResultSub, { color: colors.textSecondary }]}>
                  Farklı bir anahtar kelime veya özellik aramayı deneyin.
                </Text>
              </View>
            )}
            
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={Platform.OS === 'android'}
        >
          <View style={{ height: 180 }} />

          {/* Categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {CATEGORIES_DATA.map((cat) => (
              <CategoryItem 
                key={cat.id} 
                cat={cat} 
                t={t} 
                colors={colors} 
                onPress={() => cat.screen && navigation.navigate(cat.screen, { filter: cat.filter })} 
              />
            ))}
          </ScrollView>

          {/* Featured Card */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.featuredCard, { backgroundColor: colors.surface }]}
            onPress={() => navigateToDetail(dailyFish)}
          >
            <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.featuredGradient}>
              <View style={styles.featuredIconContainer}>
                <View style={[styles.cardCircle, { top: 20, right: 20, width: 150, height: 150, backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                <Image source={dailyFish.image} style={styles.featuredImage} contentFit="contain" transition={500} />
              </View>
              <View style={styles.featuredContent}>
                <View style={[styles.tagContainer, { backgroundColor: colors.accent }]}>
                  <Text style={styles.tagText}>{t('home.daily_fish')}</Text>
                </View>
                <Text style={styles.featuredTitle}>{t(dailyFish.nameKey)}</Text>
                <Text style={styles.featuredSubtitle}>{t('home.daily_fish_desc')} {t(dailyFish.nameKey)}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Map Preview Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('map.title')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('GlobalMap')}>
              <Text style={[styles.seeAllText, { color: colors.secondary }]}>{t('common.see_all')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={() => navigation.navigate('GlobalMap')}
            style={styles.mapPreviewContainer}
          >
            <Image 
              source={require('../../assets/images/elazig_map.png')} 
              style={styles.mapPreviewImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.mapPreviewOverlay}
            >
              <View style={styles.mapPreviewContent}>
                <View style={styles.mapPreviewBadge}>
                  <Compass color="white" size={16} />
                  <Text style={styles.mapPreviewBadgeText}>İnteraktif Rehber</Text>
                </View>
                <Text style={styles.mapPreviewTitle}>{t('map.subtitle')}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>{ALL_FISH_DATA.length}</Text>
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>{t('home.stats_total')}</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TrendingUp color={colors.secondary} size={18} />
              <Text style={[styles.statDesc, { color: colors.textSecondary }]}>{t('home.stats_points')}</Text>
            </View>
          </View>

          {/* Interactive Features */}
          <View style={styles.featuresRow}>
            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: '#fbbf24' }]}
              onPress={() => navigation.navigate('Quiz')}
            >
              <Trophy color="white" size={28} />
              <Text style={styles.featureTitle}>{t('home.features_quiz')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: colors.secondary }]}
              onPress={() => navigation.navigate('GlobalMap')}
            >
              <MapPin color="white" size={28} />
              <Text style={styles.featureTitle}>{t('home.features_map')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.featureCard, { backgroundColor: '#8b5cf6' }]} 
              onPress={() => navigation.navigate('Guestbook')}
            >
              <BookOpen color="white" size={28} />
              <Text style={styles.featureTitle}>{t('home.features_guestbook')}</Text>
            </TouchableOpacity>
          </View>

          {/* Fish List Section */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.featured_section')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Marine', { filter: 'all' })}>
              <Text style={[styles.seeAllText, { color: colors.secondary }]}>{t('common.see_all')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fishList}>
            {ALL_FISH_DATA.slice(0, 10).map((item, index) => (
              <FishCard 
                key={item.id} 
                item={item} 
                t={t} 
                colors={colors} 
                isFav={favs.includes(item.id)} 
                onToggleFav={handleToggleFav} 
                onPress={() => navigateToDetail(item)}
                gradient={[colors.primary, index % 2 === 0 ? colors.secondary : colors.accent]}
              />
            ))}
          </ScrollView>

          {/* Did You Know */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('home.did_you_know')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.infoScroll}>
            {DID_YOU_KNOW_DATA.map((item) => (
              <View key={item.id} style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.infoIconCircle, { backgroundColor: colors.accent + '20' }]}>
                  <item.icon color={colors.accent} size={24} />
                </View>
                <Text style={[styles.infoTitle, { color: colors.text }]}>{t(item.titleKey)}</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{t(item.textKey)}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerFixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  welcomeText: { fontSize: 16 },
  titleText: { fontSize: 26, fontWeight: 'bold' },
  iconButton: { backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 12, borderRadius: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderRadius: 18, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 101
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  clearButton: { padding: 5 },
  scrollContent: { paddingHorizontal: 20 },
  categoryScroll: { marginBottom: 25, marginHorizontal: -20, paddingHorizontal: 20 },
  categoryItem: { alignItems: 'center', marginRight: 20 },
  categoryIconCircle: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1 },
  categoryName: { fontSize: 11, fontWeight: 'bold' },
  featuredCard: { height: 180, borderRadius: 25, overflow: 'hidden', marginBottom: 25 },
  featuredGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 20 },
  featuredIconContainer: { position: 'absolute', right: -20, top: 0, width: 220, height: 180 },
  featuredImage: { width: '100%', height: '100%', opacity: 0.8 },
  featuredContent: { flex: 1, zIndex: 1 },
  tagContainer: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  tagText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },
  featuredTitle: { color: COLORS.white, fontSize: 24, fontWeight: 'bold' },
  featuredSubtitle: { color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  seeAllText: { fontSize: 14 },
  fishList: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 25 },
  fishCard: { width: width * 0.65, marginRight: 20, elevation: 10, marginBottom: 10 },
  fishCardContent: { borderRadius: 32, overflow: 'hidden', borderWidth: 1.5 },
  fishIconBg: { width: '100%', height: 180, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  fishImage: { width: '110%', height: '110%', zIndex: 2, transform: [{ translateY: 5 }] },
  cardCircle: { position: 'absolute', borderRadius: 100, zIndex: 1 },
  glassTagContainer: { position: 'absolute', top: 15, left: 15, overflow: 'hidden', borderRadius: 12 },
  glassTag: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  glassTagText: { color: 'white', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  fishInfoModern: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fishMainInfo: { flex: 1 },
  fishNameModern: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  fishCategoryModern: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  favButtonModern: { width: 44, height: 44, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginLeft: 15 },
  cardIndicator: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 28, height: 28, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center', marginHorizontal: 5, borderWidth: 1 },
  statNumber: { fontSize: 18, fontWeight: 'bold' },
  statDesc: { fontSize: 10, marginTop: 2, textTransform: 'uppercase' },
  featuresRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  featureCard: { flex: 1, padding: 15, borderRadius: 22, marginHorizontal: 5, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  featureTitle: { color: 'white', fontSize: 13, fontWeight: 'bold', marginTop: 8 },
  infoScroll: { marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 25 },
  infoCard: { width: width * 0.7, padding: 20, borderRadius: 25, marginRight: 15, borderWidth: 1 },
  infoIconCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  infoText: { fontSize: 13, lineHeight: 18 },
  mapPreviewContainer: { height: 160, borderRadius: 25, overflow: 'hidden', marginBottom: 25, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  mapPreviewImage: { width: '100%', height: '100%' },
  mapPreviewOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 15 },
  mapPreviewContent: { zIndex: 1 },
  mapPreviewBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 6, gap: 4 },
  mapPreviewBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  mapPreviewTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  // New Modern Search Results Overlay
  searchResultsOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    zIndex: 90, 
    paddingTop: Platform.OS === 'ios' ? 140 : 120 
  },
  searchResultsScroll: { 
    paddingHorizontal: 20, 
    paddingBottom: 100 
  },
  searchHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  searchBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  searchBadgeText: { 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  modernResultCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 24, 
    padding: 12, 
    marginBottom: 16, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  resultImageBg: { 
    width: 80, 
    height: 80, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    overflow: 'hidden'
  },
  resultImage: { 
    width: '90%', 
    height: '90%' 
  },
  resultInfo: { 
    flex: 1, 
    marginLeft: 15 
  },
  resultName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 2 
  },
  resultSpecies: { 
    fontSize: 12, 
    fontStyle: 'italic', 
    opacity: 0.6,
    marginBottom: 8
  },
  resultTagRow: { 
    flexDirection: 'row', 
    gap: 6 
  },
  miniTag: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 6 
  },
  miniTagText: { 
    fontSize: 9, 
    fontWeight: 'bold' 
  },
  resultArrow: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  noResultLarge: { 
    alignItems: 'center', 
    marginTop: 60, 
    paddingHorizontal: 40 
  },
  noResultCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(0,0,0,0.03)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20
  },
  noResultTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  noResultSub: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20 
  }
});
