import React, { useState, useEffect, memo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Heart, Info, Droplet, Ruler, Weight, Map, Share2, Volume2, Square, Fish } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { toggleFavorite, isFishFavorite } from '../services/FavoriteService';
import { saveScanToHistory } from '../services/HistoryService';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const StatItem = memo(({ icon: Icon, value, label, colors }: any) => (
  <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
    <Icon color={colors.secondary} size={20} />
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
));

export default function FishDetailScreen({ route, navigation }: any) {
  const { fish } = route.params;
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [isFav, setIsFav] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });
    checkFav();
    addToHistory();
    return () => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'flex' }
      });
      Speech.stop();
    };
  }, [navigation]);

  const startAR = useCallback(() => {
    navigation.navigate('AR', { fish });
  }, [fish, navigation]);

  const addToHistory = useCallback(async () => {
    await saveScanToHistory({
      name: t(fish.nameKey),
      image: fish.image
    });
  }, [fish, t]);

  const checkFav = useCallback(async () => {
    const favStatus = await isFishFavorite(fish.id);
    setIsFav(favStatus);
  }, [fish.id]);

  const handleToggleFav = useCallback(async () => {
    await toggleFavorite(fish);
    setIsFav(prev => !prev);
  }, [fish]);

  const toggleSpeech = useCallback(() => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      
      const speechLangMap: any = {
        tr: 'tr-TR',
        en: 'en-US',
        ar: 'ar-SA',
      };
      
      const currentSpeechLang = speechLangMap[i18n.language] || 'tr-TR';
      const textToRead = `${t(fish.nameKey)}. ${t(fish.descriptionKey) || t('common.no_info')}`;
      
      Speech.speak(textToRead, {
        language: currentSpeechLang,
        volume: 1.0,
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [fish, i18n.language, isSpeaking, t]);

  useEffect(() => {
    if (route.params?.autoStartAR) {
      startAR();
    }
    checkFav();
    addToHistory();
    return () => {
      Speech.stop();
    };
  }, [route.params?.autoStartAR, startAR, checkFav, addToHistory]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        bounces={false}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {/* Hero Section */}
        <View style={styles.imageContainer}>
          <LinearGradient colors={[colors.primary, colors.secondary]} style={StyleSheet.absoluteFill}>
            <View style={styles.heroIconContainer}>
              {fish.image ? (
                <Image source={fish.image} style={styles.image} contentFit="contain" transition={500} />
              ) : (
                <Fish color="rgba(255,255,255,0.2)" size={250} />
              )}
            </View>
          </LinearGradient>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundButton}>
              <ArrowLeft color={colors.white} size={24} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={handleToggleFav} style={styles.roundButton}>
                <Heart color={isFav ? COLORS.accent : colors.white} size={22} fill={isFav ? COLORS.accent : 'transparent'} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.titleOverlay}>
            <View style={[styles.tag, { backgroundColor: colors.accent }]}>
              <Text style={styles.tagText}>{t(fish.tagKey) || t('common.marine')}</Text>
            </View>
            <Text style={styles.fishName}>{t(fish.nameKey)}</Text>
            <Text style={styles.speciesName}>{fish.species}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.statsRow}>
            <StatItem icon={Ruler} value="120 cm" label={t('common.avg_length')} colors={colors} />
            <StatItem icon={Weight} value="45 kg" label={t('common.avg_weight')} colors={colors} />
            <StatItem icon={Droplet} value={t('common.marine')} label={t('common.habitat')} colors={colors} />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Info color={colors.secondary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('common.about_fish')}</Text>
              <TouchableOpacity 
                style={[styles.audioButton, { backgroundColor: colors.primary + '15' }]} 
                onPress={toggleSpeech}
              >
                {isSpeaking ? <Square color={colors.primary} size={16} fill={colors.primary} /> : <Volume2 color={colors.primary} size={18} />}
                <Text style={[styles.audioText, { color: colors.primary }]}>
                  {isSpeaking ? t('common.stop') : t('common.listen')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {t(fish.descriptionKey) || t('common.no_info')}
            </Text>
          </View>

          {/* Habitat Map */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Map color={colors.secondary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('common.habitat_title')}</Text>
            </View>
            <View style={[styles.mapContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.mapInner}>
                <View style={styles.mapGrid} />
                <View style={styles.riverPath}>
                  <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.riverFill} />
                </View>
                <View style={[styles.habitatMarker, { top: '40%', left: '30%' }]}>
                  <View style={styles.markerPulse} />
                  <View style={styles.markerCore} />
                </View>
                <Text style={styles.mapLabel}>Ege & Akdeniz Kıyıları</Text>
              </LinearGradient>
            </View>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.bottomAction, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={startAR}>
          <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.buttonGradient}>
            <Text style={styles.buttonText}>{t('common.view_in_ar')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { width: width, height: height * 0.40 },
  heroIconContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  headerButtons: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  roundButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  titleOverlay: { position: 'absolute', bottom: 30, left: 20, right: 20 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 10 },
  tagText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  fishName: { color: COLORS.white, fontSize: 32, fontWeight: 'bold' },
  speciesName: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontStyle: 'italic', marginTop: 4 },
  content: { flex: 1, marginTop: -20, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statItem: { width: (width - 70) / 3, padding: 15, borderRadius: 22, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 15, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 11, marginTop: 2 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10, flex: 1 },
  audioButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  audioText: { fontSize: 14, fontWeight: 'bold' },
  description: { fontSize: 15, lineHeight: 24 },
  mapContainer: { height: 180, borderRadius: 25, overflow: 'hidden', borderWidth: 1 },
  mapInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapGrid: { ...StyleSheet.absoluteFillObject, opacity: 0.1 },
  riverPath: { position: 'absolute', width: '100%', height: 40, top: '45%', transform: [{ rotate: '-10deg' }] },
  riverFill: { flex: 1, opacity: 0.3 },
  habitatMarker: { position: 'absolute', width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  markerCore: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.accent, borderWidth: 2, borderColor: '#fff' },
  markerPulse: { position: 'absolute', width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.accent, opacity: 0.3 },
  mapLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 'bold', position: 'absolute', bottom: 15, right: 15 },
  bottomAction: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
    borderTopWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  actionButton: { height: 56, borderRadius: 18, overflow: 'hidden' },
  buttonGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
