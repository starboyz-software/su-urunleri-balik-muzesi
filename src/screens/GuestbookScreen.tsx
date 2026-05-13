import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MessageSquare, Star, Send, User, Calendar, Trash2, Smile, Sparkles } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { getComments, saveComment, deleteComment, GuestbookEntry } from '../services/GuestbookService';
import { useTranslation } from 'react-i18next';

const CommentCard = memo(({ item, colors, isRTL, onDelete }: any) => (
  <View style={[styles.commentCard, { backgroundColor: colors.surface }]}>
    <View style={[styles.commentHeader, isRTL && { flexDirection: 'row-reverse' }]}>
      <View style={[styles.userInfo, isRTL && { flexDirection: 'row-reverse' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }, isRTL ? { marginLeft: 12, marginRight: 0 } : { marginRight: 12 }]}>
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{item.name[0]}</Text>
        </View>
        <View style={isRTL && { alignItems: 'flex-end' }}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
          <View style={[styles.dateRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{item.date}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.ratingBadge, isRTL && { flexDirection: 'row-reverse' }]}>
        <Star color="#fbbf24" fill="#fbbf24" size={12} />
        <Text style={styles.ratingValue}>{item.rating}</Text>
      </View>
    </View>
    <Text style={[styles.messageText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>{item.message}</Text>
    <TouchableOpacity 
      style={[styles.deleteButton, isRTL ? { left: 15, right: undefined } : { right: 15, left: undefined }]} 
      onPress={() => onDelete(item.id)}
    >
      <Trash2 color={colors.border} size={16} />
    </TouchableOpacity>
  </View>
));

export default function GuestbookScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');

  const isRTL = i18n.language === 'ar';

  const loadComments = useCallback(async () => {
    setLoading(true);
    const data = await getComments();
    setComments(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadComments(); }, [loadComments]);

  const sortedComments = useMemo(() => {
    let data = [...comments];
    if (sortBy === 'newest') return data.sort((a, b) => Number(b.id) - Number(a.id));
    if (sortBy === 'highest') return data.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'lowest') return data.sort((a, b) => a.rating - b.rating);
    return data;
  }, [comments, sortBy]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    try {
      await saveComment({ name: name.trim() || t('guestbook.anonymous'), message: message.trim(), rating: rating, mood: '😊' });
      setName(''); setMessage(''); setRating(5);
      await loadComments();
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleDelete = useCallback(async (id: string) => {
    await deleteComment(id);
    await loadComments();
  }, [loadComments]);

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={[colors.primary, colors.background]} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, isRTL && { flexDirection: 'row-reverse' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="white" size={28} style={isRTL && { transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={isRTL && { alignItems: 'flex-end' }}>
          <Text style={styles.headerTitle}>{t('guestbook.title')}</Text>
          <Text style={styles.headerSubtitle}>{t('guestbook.subtitle')}</Text>
        </View>
        <Sparkles color={colors.accent} size={28} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} removeClippedSubviews={Platform.OS === 'android'}>
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.formTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{t('guestbook.form_title')}</Text>
          <View style={[styles.inputGroup, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={styles.inputIcon}><User color={colors.secondary} size={20} /></View>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('guestbook.name_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />
          </View>
          <View style={[styles.inputGroup, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.inputIcon, { alignItems: 'flex-start', paddingTop: 12 }]}><MessageSquare color={colors.secondary} size={20} /></View>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={t('guestbook.message_placeholder')}
              placeholderTextColor={colors.textSecondary}
              multiline numberOfLines={4} value={message} onChangeText={setMessage}
            />
          </View>
          <View style={[styles.ratingRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>{t('guestbook.rating_label')}</Text>
            <View style={[styles.stars, isRTL && { flexDirection: 'row-reverse' }]}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Star color={s <= rating ? '#fbbf24' : colors.border} fill={s <= rating ? '#fbbf24' : 'transparent'} size={28} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: colors.secondary }, isRTL && { flexDirection: 'row-reverse' }]} 
            onPress={handleSubmit} disabled={submitting || !message.trim()}
          >
            {submitting ? <ActivityIndicator color="white" /> : (
              <><Text style={styles.submitText}>{t('guestbook.submit_button')}</Text><Send color="white" size={20} style={isRTL && { transform: [{ rotate: '180deg' }] }} /></>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          <View style={[styles.listHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.sectionTitle, { color: colors.white }]}>{t('guestbook.section_title')}</Text>
            <View style={[styles.sortOptions, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity style={[styles.sortChip, sortBy === 'highest' && { backgroundColor: colors.accent }]} onPress={() => setSortBy('highest')}>
                <Text style={[styles.sortChipText, sortBy === 'highest' && { color: '#000' }]}>{t('guestbook.sort_highest')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sortChip, sortBy === 'newest' && { backgroundColor: colors.accent }]} onPress={() => setSortBy('newest')}>
                <Text style={[styles.sortChipText, sortBy === 'newest' && { color: '#000' }]}>{t('guestbook.sort_newest')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} /> : (
            sortedComments.length > 0 ? sortedComments.map((item) => (
              <CommentCard key={item.id} item={item} colors={colors} isRTL={isRTL} onDelete={handleDelete} />
            )) : (
              <View style={styles.emptyState}><Smile color="rgba(255,255,255,0.2)" size={60} /><Text style={styles.emptyText}>{t('guestbook.empty_state')}</Text></View>
            )
          )}
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, marginBottom: 20 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },
  scrollContent: { paddingHorizontal: 20 },
  formCard: { padding: 20, borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, marginBottom: 30 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { flexDirection: 'row', marginBottom: 15 },
  inputIcon: { width: 40, justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 15, paddingHorizontal: 15, paddingVertical: 12, fontSize: 15 },
  textArea: { height: 100, textAlignVertical: 'top' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 5 },
  ratingLabel: { fontSize: 15, fontWeight: '500' },
  stars: { flexDirection: 'row', gap: 5 },
  submitButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, borderRadius: 15, gap: 10 },
  submitText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  listSection: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sortOptions: { flexDirection: 'row', gap: 8 },
  sortChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sortChipText: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' },
  commentCard: { padding: 15, borderRadius: 20, marginBottom: 15, position: 'relative' },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userName: { fontSize: 15, fontWeight: 'bold' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dateText: { fontSize: 11 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(251, 191, 36, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  ratingValue: { color: '#fbbf24', fontSize: 12, fontWeight: 'bold' },
  messageText: { fontSize: 14, lineHeight: 22 },
  deleteButton: { position: 'absolute', bottom: 10, right: 15 },
  emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { color: 'white', marginTop: 15, fontSize: 14 },
});

