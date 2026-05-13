import React, { memo, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Animated } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Compass } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { ALL_FISH_DATA } from '../data/fishData';

const { width, height } = Dimensions.get('window');

const MapMarker = memo(({ loc, t, onFishPress, pulseAnim }: any) => {
  const fish = useMemo(() => ALL_FISH_DATA.find(f => f.id === loc.id), [loc.id]);
  
  return (
    <TouchableOpacity
      style={[styles.markerWrapper, { left: loc.x - 30, top: loc.y - 80 }]}
      onPress={() => onFishPress(loc.id)}
    >
      <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
      <View style={styles.markerCircle}>
        <Image source={fish?.image} style={styles.fishThumb} contentFit="contain" />
      </View>
      <View style={styles.infoBadge}>
        <Text style={styles.badgeName}>{fish ? t(fish.nameKey) : ''}</Text>
        <Text style={styles.badgeArea}>{t(loc.areaKey)}</Text>
      </View>
    </TouchableOpacity>
  );
});

export default function GlobalMapScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  const FISH_LOCATIONS = useMemo(() => [
    { id: 'alabalik', x: width * 0.48, y: height * 0.46, areaKey: 'map.area_1' },
    { id: 'sazan', x: width * 0.42, y: height * 0.35, areaKey: 'map.area_2' },
    { id: 'caner', x: width * 0.32, y: height * 0.26, areaKey: 'map.area_3' },
    { id: 'elazig_sirazi', x: width * 0.72, y: height * 0.63, areaKey: 'map.area_4' },
    { id: 'sabut', x: width * 0.52, y: height * 0.58, areaKey: 'map.area_5' },
    { id: 'bizir', x: width * 0.53, y: height * 0.50, areaKey: 'map.area_6' },
    { id: 'yayin', x: width * 0.45, y: height * 0.70, areaKey: 'map.area_7' },
    { id: 'kefal', x: width * 0.22, y: height * 0.38, areaKey: 'map.area_8' },
  ], []);

  const handleFishPress = (id: string) => {
    const fish = ALL_FISH_DATA.find(f => f.id === id);
    if (fish) navigation.navigate('FishDetail', { fish });
  };

  return (
    <View style={[styles.container, { backgroundColor: '#0f172a' }]}>
      <View style={styles.mapContainer}>
        <Image 
          source={require('../../assets/images/elazig_map.png')} 
          style={styles.mapImage} 
          contentFit="cover"
          transition={1000}
        />
        <View style={styles.overlay} />
        <View style={styles.gridLayer}>
          {[...Array(10)].map((_, i) => <View key={`v-${i}`} style={[styles.gridLineV, { left: (width / 10) * i }]} />)}
          {[...Array(15)].map((_, i) => <View key={`h-${i}`} style={[styles.gridLineH, { top: (height / 15) * i }]} />)}
        </View>

        {/* Labels for Districts */}
        <View style={[styles.mapLabel, { top: '22%', left: '38%' }]}>
          <Text style={styles.labelText}>{t('map.dist_keban')}</Text>
        </View>
        <View style={[styles.mapLabel, { bottom: '30%', right: '22%' }]}>
          <Text style={styles.labelText}>{t('map.dist_sivrice')}</Text>
        </View>
        <View style={[styles.mapLabel, { top: '35%', left: '15%' }]}>
          <Text style={styles.labelText}>{t('map.dist_agin')}</Text>
        </View>
        <View style={[styles.mapLabel, { top: '48%', left: '45%' }]}>
          <Text style={styles.labelText}>{t('map.dist_elazig')}</Text>
        </View>

        {FISH_LOCATIONS.map((loc) => (
          <MapMarker key={loc.id} loc={loc} t={t} onFishPress={handleFishPress} pulseAnim={pulseAnim} />
        ))}
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="white" size={28} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{t('map.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('map.subtitle')}</Text>
        </View>
        <Compass color={COLORS.accent} size={32} />
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={styles.legendText}>{t('map.legend_density')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
          <Text style={styles.legendText}>{t('map.legend_freshwater')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  mapImage: { width: width, height: height, transform: [{ scale: 1.3 }] },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  gridLayer: { ...StyleSheet.absoluteFillObject, opacity: 0.15 },
  gridLineV: { position: 'absolute', width: 1, height: '100%', backgroundColor: '#fff' },
  gridLineH: { position: 'absolute', height: 1, width: '100%', backgroundColor: '#fff' },
  mapLabel: { position: 'absolute', padding: 5 },
  labelText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  markerWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center', width: 60, height: 60 },
  pulse: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.accent, opacity: 0.3 },
  markerCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.accent, backgroundColor: 'white', overflow: 'hidden' },
  fishThumb: { width: '100%', height: '100%' },
  infoBadge: { position: 'absolute', bottom: -35, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignItems: 'center', minWidth: 80 },
  badgeName: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  badgeArea: { color: COLORS.accent, fontSize: 7, fontWeight: 'bold' },
  header: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  legend: { position: 'absolute', bottom: 110, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 20, flexDirection: 'row', justifyContent: 'space-around' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});
