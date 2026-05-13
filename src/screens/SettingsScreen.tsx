import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert, Platform, Linking } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Bell, Moon, Globe, Trash2, Shield, HelpCircle, Smartphone, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n/i18n';

export default function SettingsScreen({ navigation }: any) {
  const { colors, toggleTheme, isDark } = useTheme();
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const languages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];
  const currentLanguageName = `${currentLang.flag} ${currentLang.name}`;

  const handleLanguageSelect = (code: string) => {
    changeLanguage(code);
    setLangModalVisible(false);
  };

  const SettingRow = ({ icon: Icon, title, value, type, onPress }: any) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon color={colors.secondary} size={20} />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: '#3E3E3E', true: colors.secondary }}
          thumbColor={colors.white}
        />
      ) : (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.settingValue}>{value || ''}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clear_cache_title'),
      t('settings.clear_cache_msg'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.clear_cache_title'), 
          onPress: () => {
            // Simulate clearing cache
            Alert.alert(t('common.success'), t('settings.clear_cache_success'));
          },
          style: 'destructive' 
        },
      ]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      t('settings.help_title'),
      t('settings.help_msg'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('common.listen'), // Using an existing key or common.success
          onPress: () => Linking.openURL('mailto:destek@elazigbalıkmuzesi.gov.tr'),
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.delete_account'),
      t('settings.help_msg'), // Reusing help_msg or could add specific one
      [
        { text: t('settings.cancel'), style: 'cancel' },
        { 
          text: t('settings.delete_account'), 
          onPress: () => Alert.alert(t('common.error'), "Demo version: Account deletion is restricted."),
          style: 'destructive'
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
        <View style={styles.card}>
          <SettingRow 
            icon={Bell} 
            title={t('settings.notifications')} 
            type="switch" 
            value={notifications} 
            onPress={setNotifications} 
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Moon} 
            title={t('settings.dark_mode')} 
            type="switch" 
            value={isDark} 
            onPress={toggleTheme} 
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Globe} 
            title={t('settings.language')} 
            value={currentLanguageName} 
            onPress={() => setLangModalVisible(true)} 
          />
        </View>

        {langModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.select_language')}</Text>
              <View style={styles.langList}>
                {languages.map((lang) => {
                  const isSelected = i18n.language === lang.code;
                  return (
                    <TouchableOpacity 
                      key={lang.code} 
                      style={[
                        styles.langOption, 
                        isSelected && { backgroundColor: colors.primary + '20', borderColor: colors.secondary }
                      ]} 
                      onPress={() => handleLanguageSelect(lang.code)}
                    >
                      <View style={styles.langLeft}>
                        <Text style={styles.flagEmoji}>{lang.flag}</Text>
                        <Text style={[styles.langText, { color: isSelected ? colors.secondary : colors.text }]}>
                          {lang.name}
                        </Text>
                      </View>
                      {isSelected && <Check color={colors.secondary} size={20} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity 
                style={[styles.closeButton, { backgroundColor: colors.background }]} 
                onPress={() => setLangModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t('settings.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t('settings.security_data')}</Text>
        <View style={styles.card}>
          <SettingRow 
            icon={Shield} 
            title={t('settings.location_permissions')} 
            type="switch" 
            value={locationEnabled} 
            onPress={setLocationEnabled} 
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Trash2} 
            title={t('settings.clear_cache')} 
            onPress={handleClearCache} 
          />
        </View>

        <Text style={styles.sectionTitle}>{t('settings.app')}</Text>
        <View style={styles.card}>
          <SettingRow 
            icon={HelpCircle} 
            title={t('settings.help_center')} 
            onPress={handleHelp} 
          />
          <View style={styles.divider} />
          <SettingRow 
            icon={Smartphone} 
            title={t('settings.version')} 
            value="v1.0.4 (Beta)" 
          />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>{t('settings.delete_account')}</Text>
        </TouchableOpacity>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 168, 232, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginLeft: 68,
  },
  deleteButton: {
    marginTop: 30,
    padding: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 69, 0, 0.1)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 0, 0.2)',
  },
  deleteButtonText: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    borderRadius: 25,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  langLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  langText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  langList: {
    marginBottom: 10,
  },
});
