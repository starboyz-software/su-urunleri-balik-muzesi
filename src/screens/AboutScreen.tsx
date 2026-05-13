import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowLeft, MapPin, Clock, Phone, Globe, Info, Fish, Waves, Star, ShieldCheck, Microscope } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleOpenMap = async () => {
    const address = t('about.address_value');
    const encodedAddress = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });
    
    try {
      if (url) {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
        }
      }
    } catch (error) {
      console.log('Map Error:', error);
    }
  };

  const handleCall = async () => {
    try {
      await Linking.openURL('tel:+904242471752');
    } catch (error) {
      console.log('Call Error:', error);
    }
  };

  const handleOpenWeb = async () => {
    try {
      await WebBrowser.openBrowserAsync('https://arastirma.tarimorman.gov.tr/elazigsuurunleri');
    } catch (error) {
      console.log('Web Error:', error);
      Linking.openURL('https://arastirma.tarimorman.gov.tr/elazigsuurunleri');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surface }]}>
          <ArrowLeft color={colors.white} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('common.museum_title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Real Museum Image - TAGEM Exhibition */}
        <View style={styles.heroContainer}>
          <Image 
            source={require('../../assets/images/1710663280-aw164132_09.jpg')} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(10, 14, 18, 0.9)']}
            style={styles.heroOverlay}
          >
            <View style={[styles.museumTag, isRTL && { flexDirection: 'row-reverse', alignSelf: 'flex-end' }]}>
              <ShieldCheck color={colors.accent} size={16} />
              <Text style={styles.tagText}>{t('about.tag')}</Text>
            </View>
            <Text style={[styles.heroTitle, isRTL && { textAlign: 'right' }]}>{t('common.museum_name')}</Text>
            <Text style={[styles.heroSubtitle, isRTL && { textAlign: 'right' }]}>{t('about.institution')}</Text>
          </LinearGradient>
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <Microscope color={colors.secondary} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.white }]}>{t('about.corporate_memory')}</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('about.description')}
          </Text>
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity style={[styles.infoRow, { backgroundColor: colors.surface }, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleOpenMap}>
            <MapPin color={colors.secondary} size={24} />
            <View style={[styles.infoTextContainer, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
              <Text style={[styles.infoLabel, isRTL && { textAlign: 'right' }]}>{t('about.address_label')}</Text>
              <Text style={[styles.infoValue, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('about.address_value')}</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.infoRow, { backgroundColor: colors.surface }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Clock color={colors.secondary} size={24} />
            <View style={[styles.infoTextContainer, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
              <Text style={[styles.infoLabel, isRTL && { textAlign: 'right' }]}>{t('about.visit_hours_label')}</Text>
              <Text style={[styles.infoValue, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('about.visit_hours_value')}</Text>
            </View>
          </View>

          <TouchableOpacity style={[styles.infoRow, { backgroundColor: colors.surface }, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleCall}>
            <Phone color={colors.secondary} size={24} />
            <View style={[styles.infoTextContainer, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
              <Text style={[styles.infoLabel, isRTL && { textAlign: 'right' }]}>{t('about.contact_label')}</Text>
              <Text style={[styles.infoValue, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>+90 (424) 247 17 52</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.infoRow, { backgroundColor: colors.surface }, isRTL && { flexDirection: 'row-reverse' }]} onPress={handleOpenWeb}>
            <Globe color={colors.secondary} size={24} />
            <View style={[styles.infoTextContainer, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
              <Text style={[styles.infoLabel, isRTL && { textAlign: 'right' }]}>{t('about.website_label')}</Text>
              <Text style={[styles.infoValue, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>arastirma.tarimorman.gov.tr/elazigsuurunleri</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.historyCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.sectionHeader, isRTL && { flexDirection: 'row-reverse' }]}>
            <Star color={colors.accent} size={20} fill={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.white }]}>{t('about.collection_title')}</Text>
          </View>
          <Text style={[styles.historyText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('about.collection_text')}
          </Text>
        </View>

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
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroContainer: {
    width: '100%',
    height: 260,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: 'flex-end',
  },
  museumTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
  },
  tagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  card: {
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  historyCard: {
    padding: 20,
    borderRadius: 25,
  },
  historyText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
