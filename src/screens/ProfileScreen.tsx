import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { COLORS } from '../theme/colors';
import { Settings, User, History, Bookmark, Info, ChevronRight, LogOut, Award, Star, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('settings.clear_cache_msg'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('profile.logout'), 
          onPress: () => {
            navigation.replace('Home');
          },
          style: 'destructive'
        }
      ]
    );
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.menuItem, isRTL && { flexDirection: 'row-reverse' }]} 
      onPress={onPress}
    >
      <View style={[styles.menuIconContainer, isRTL ? { marginLeft: 15, marginRight: 0 } : { marginRight: 15 }]}>
        <Icon color={colors.secondary} size={22} />
      </View>
      <View style={[styles.menuTextContainer, isRTL && { alignItems: 'flex-end' }]}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <ChevronRight color={colors.textSecondary} size={20} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.secondary, colors.accent]}
              style={styles.avatarGradient}
            >
              <User color={colors.white} size={40} />
            </LinearGradient>
          </View>
          <Text style={[styles.userName, { color: colors.white }]}>{t('profile.visitor')}</Text>
          <Text style={styles.userEmail}>ziyaretci@elazigbalıkmuzesi.gov.tr</Text>
        </View>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.surface }, isRTL && { flexDirection: 'row-reverse' }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.white }]}>12</Text>
            <Text style={styles.statLabel}>{t('profile.stats_seen')}</Text>
          </View>
          <View style={[styles.statItem, styles.statBorder]}>
            <Text style={[styles.statValue, { color: colors.white }]}>4</Text>
            <Text style={styles.statLabel}>{t('profile.stats_collection')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.white }]}>850</Text>
            <Text style={styles.statLabel}>{t('profile.stats_points')}</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={styles.badgesSection}>
          <Text style={[styles.sectionTitle, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('profile.badges_title')}</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.badgeScroll}
            contentContainerStyle={isRTL && { flexDirection: 'row-reverse' }}
          >
            <View style={[styles.badgeItem, isRTL ? { marginLeft: 25, marginRight: 0 } : { marginRight: 25 }]}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#FFD70020' }]}>
                <Award color="#FFD700" size={24} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.badge_explorer')}</Text>
            </View>
            <View style={[styles.badgeItem, isRTL ? { marginLeft: 25, marginRight: 0 } : { marginRight: 25 }]}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#C0C0C020' }]}>
                <Star color="#C0C0C0" size={24} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.badge_hunter')}</Text>
            </View>
            <View style={[styles.badgeItem, isRTL ? { marginLeft: 25, marginRight: 0 } : { marginRight: 25 }]}>
              <View style={[styles.badgeIconBg, { backgroundColor: '#CD7F3220' }]}>
                <Zap color="#CD7F32" size={24} />
              </View>
              <Text style={styles.badgeLabel}>{t('profile.badge_scanner')}</Text>
            </View>
          </ScrollView>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={[styles.sectionTitle, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('profile.account_settings')}</Text>
          <MenuItem 
            icon={History} 
            title={t('profile.visit_history')} 
            subtitle={t('profile.visit_history_desc')} 
            onPress={() => navigation.navigate('History')}
          />
          <MenuItem 
            icon={Bookmark} 
            title={t('profile.my_favorites')} 
            subtitle={t('profile.my_favorites_desc')} 
            onPress={() => navigation.navigate('Favorites')}
          />
          <MenuItem 
            icon={Settings} 
            title={t('profile.app_settings')} 
            onPress={() => navigation.navigate('Settings')}
          />
          
          <Text style={[styles.sectionTitle, { color: colors.white, textAlign: isRTL ? 'right' : 'left', marginTop: 25 }]}>{t('profile.support')}</Text>
          <MenuItem 
            icon={Info} 
            title={t('profile.about_museum')} 
            onPress={() => navigation.navigate('About')}
          />
          <MenuItem icon={LogOut} title={t('profile.logout')} onPress={handleLogout} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: COLORS.surface,
    marginBottom: 15,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 5,
  },
  menuContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 168, 232, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  badgesSection: {
    marginBottom: 30,
  },
  badgeScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 25,
  },
  badgeIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});
