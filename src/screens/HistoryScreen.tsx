import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { ArrowLeft, Clock, Calendar, ChevronRight, Trash2, Fish } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getHistory, clearHistory, HistoryItem } from '../services/HistoryService';
import { useIsFocused } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';

import { useTranslation } from 'react-i18next';

export default function HistoryScreen({ navigation }: any) {
  const isFocused = useIsFocused();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (isFocused) {
      loadHistory();
    }
  }, [isFocused]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getHistory();
    setHistory(data);
    setLoading(false);
  };

  const handleClear = async () => {
    await clearHistory();
    setHistory([]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary, colors.background]}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={colors.white} size={24} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.white, textAlign: isRTL ? 'right' : 'left' }]}>{t('history.title')}</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Trash2 color={colors.white} size={20} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 50 }} />
        ) : history.length > 0 ? (
          history.map((item, index) => (
            <TouchableOpacity key={item.id} style={[styles.historyCard, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.fishIconBg}
              >
                <Fish color={colors.white} size={30} opacity={0.6} />
              </LinearGradient>
              <View style={[styles.infoContainer, isRTL ? { marginRight: 15, marginLeft: 0 } : { marginLeft: 15 }]}>
                <Text style={[styles.fishName, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{item.name}</Text>
                <View style={[styles.dateTimeRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Calendar color={colors.secondary} size={14} />
                  <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>{item.date}</Text>
                  <Clock color={colors.secondary} size={14} style={isRTL ? { marginRight: 10 } : { marginLeft: 10 }} />
                  <Text style={[styles.dateTimeText, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
              </View>
              <ChevronRight color={colors.textSecondary} size={20} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Clock color={colors.surface} size={80} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('history.empty_state')}</Text>
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
    flex: 1,
  },
  clearButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  fishIconBg: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  fishName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeText: {
    fontSize: 12,
    marginLeft: 4,
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
});
