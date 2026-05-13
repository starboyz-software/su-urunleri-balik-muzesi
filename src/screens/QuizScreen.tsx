import { 
  Trophy, X, Check, RefreshCw, ChevronLeft, Timer, Brain, Star, Award
} from 'lucide-react-native';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform, Vibration } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { ALL_FISH_DATA } from '../data/fishData';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type Question = {
  id: number;
  type: 'image' | 'species' | 'category' | 'tag';
  question: string;
  options: string[];
  correctAnswer: string;
  image?: any;
};

export default function QuizScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const generateQuestions = useCallback(() => {
    const shuffled = [...ALL_FISH_DATA].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10); // Increase to 10 questions

    const newQuestions: Question[] = selected.map((fish, index) => {
      const types: Question['type'][] = ['image', 'species', 'category', 'tag'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const otherFish = ALL_FISH_DATA.filter(f => f.id !== fish.id);
      let options: string[] = [];
      let question = '';
      let correctAnswer = '';

      switch (type) {
        case 'image':
          question = t('quiz.question_image');
          correctAnswer = t(fish.nameKey);
          options = otherFish.sort(() => 0.5 - Math.random()).slice(0, 3).map(f => t(f.nameKey));
          break;
        case 'species':
          question = t('quiz.question_species', { species: fish.species });
          correctAnswer = t(fish.nameKey);
          options = otherFish.sort(() => 0.5 - Math.random()).slice(0, 3).map(f => t(f.nameKey));
          break;
        case 'category':
          question = `${t(fish.nameKey)} hangi kategoriye aittir?`;
          correctAnswer = t(`categories.cat_${fish.category.toLowerCase()}`);
          const catKeys = ['cat_endemic', 'cat_economic', 'cat_predator', 'cat_protected'];
          options = catKeys.filter(k => t(`categories.${k}`) !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3).map(k => t(`categories.${k}`));
          break;
        case 'tag':
          question = `"${t(fish.tagKey)}" etiketi hangi balığa aittir?`;
          correctAnswer = t(fish.nameKey);
          options = otherFish.sort(() => 0.5 - Math.random()).slice(0, 3).map(f => t(f.nameKey));
          break;
      }

      options = [...options, correctAnswer].sort(() => 0.5 - Math.random());

      return {
        id: index,
        type,
        question,
        options,
        correctAnswer,
        image: fish.image
      };
    });

    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
    setTimeLeft(15);
  }, [t]);

  useEffect(() => {
    generateQuestions();
  }, [generateQuestions]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedOption(null);
        setTimeLeft(15);
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      });
    } else {
      setShowResult(true);
    }
  }, [currentQuestionIndex, questions.length, fadeAnim]);

  useEffect(() => {
    if (!showResult && !selectedOption && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !selectedOption) {
      handleOptionPress('TIMEOUT_EXPIRED');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, showResult, selectedOption]);

  const handleOptionPress = useCallback((option: string) => {
    if (selectedOption) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedOption(option);
    const correct = option === questions[currentQuestionIndex].correctAnswer;
    
    if (correct) {
      setScore(prev => prev + 10);
      if (Platform.OS !== 'web') Vibration.vibrate(50);
    } else {
      if (Platform.OS !== 'web') Vibration.vibrate(200);
    }

    setTimeout(nextQuestion, 1500);
  }, [currentQuestionIndex, questions, selectedOption, nextQuestion]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  if (questions.length === 0) return null;

  if (showResult) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={[colors.primary, colors.background]} style={StyleSheet.absoluteFill} />
        <View style={styles.resultContainer}>
          <View style={styles.trophyWrapper}>
            <Trophy color={colors.accent} size={100} />
            <Animated.View style={styles.starsContainer}>
              <Star color="#fbbf24" size={24} fill="#fbbf24" style={{ position: 'absolute', top: -10, left: -20 }} />
              <Star color="#fbbf24" size={20} fill="#fbbf24" style={{ position: 'absolute', top: -30, right: -10 }} />
            </Animated.View>
          </View>
          
          <Text style={[styles.resultTitle, { color: colors.white }]}>{t('quiz.result_title')}</Text>
          <View style={styles.finalScoreBadge}>
            <Text style={styles.finalScoreLabel}>TOPLAM PUAN</Text>
            <Text style={styles.finalScoreValue}>{score}</Text>
          </View>
          
          <Text style={[styles.resultText, { color: colors.white }]}>
            {score >= 80 ? t('quiz.result_excellent') : score >= 50 ? t('quiz.result_good') : t('quiz.result_bad')}
          </Text>

          <View style={styles.resultActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]} onPress={generateQuestions}>
              <RefreshCw color={colors.white} size={20} style={{ marginRight: 10 }} />
              <Text style={styles.actionButtonText}>{t('quiz.retry')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 15 }]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.actionButtonText}>{t('quiz.back_home')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={[colors.primary, colors.background]} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color={colors.white} size={28} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Brain color={colors.accent} size={20} style={{ marginRight: 8 }} />
          <Text style={styles.headerTitle}>Bilgi Yarışı</Text>
        </View>
        <View style={[styles.timerBadge, { borderColor: timeLeft <= 5 ? '#ef4444' : 'rgba(255,255,255,0.3)' }]}>
          <Timer color={timeLeft <= 5 ? '#ef4444' : 'white'} size={16} style={{ marginRight: 5 }} />
          <Text style={[styles.timerText, { color: timeLeft <= 5 ? '#ef4444' : 'white' }]}>{timeLeft}s</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`, backgroundColor: colors.accent }]} />
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={[styles.questionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.questionHeader}>
            <View style={[styles.qBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.qBadgeText, { color: colors.secondary }]}>SORU {currentQuestionIndex + 1}/10</Text>
            </View>
            <View style={styles.scoreLive}>
              <Award color={colors.accent} size={16} style={{ marginRight: 4 }} />
              <Text style={[styles.scoreLiveText, { color: colors.textSecondary }]}>{score} Puan</Text>
            </View>
          </View>

          <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>
          
          {(currentQuestion.type === 'image' || currentQuestion.type === 'species') && (
            <View style={styles.imageWrapper}>
              <Image source={currentQuestion.image} style={styles.questionImage} contentFit="contain" transition={500} />
            </View>
          )}

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === option;
              const isCorrectOption = option === currentQuestion.correctAnswer;
              
              let backgroundColor = colors.background;
              let borderColor = colors.border;
              let textColor = colors.text;

              if (selectedOption) {
                if (isCorrectOption) {
                  backgroundColor = '#22c55e20';
                  borderColor = '#22c55e';
                  textColor = '#22c55e';
                } else if (isSelected) {
                  backgroundColor = '#ef444420';
                  borderColor = '#ef4444';
                  textColor = '#ef4444';
                } else {
                  backgroundColor = colors.background;
                  borderColor = colors.border;
                  textColor = colors.textSecondary;
                }
              }

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.optionButton, { backgroundColor, borderColor, transform: [{ scale: isSelected ? 0.98 : 1 }] }]}
                  onPress={() => handleOptionPress(option)}
                  disabled={!!selectedOption}
                >
                  <Text style={[styles.optionText, { color: textColor }]}>{option}</Text>
                  {selectedOption && isCorrectOption && <Check color="#22c55e" size={20} />}
                  {selectedOption && isSelected && !isCorrectOption && <X color="#ef4444" size={20} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center' },
  backButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  timerBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  timerText: { fontSize: 14, fontWeight: 'bold' },
  progressContainer: { 
    height: 4, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    marginHorizontal: 30, 
    borderRadius: 2, 
    marginBottom: 20 
  },
  progressBar: { height: '100%', borderRadius: 2 },
  content: { flex: 1, paddingHorizontal: 20 },
  questionCard: { 
    padding: 20, 
    borderRadius: 30, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20,
    elevation: 5
  },
  questionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  qBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  qBadgeText: { fontSize: 12, fontWeight: 'bold' },
  scoreLive: { flexDirection: 'row', alignItems: 'center' },
  scoreLiveText: { fontSize: 13, fontWeight: '600' },
  questionText: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, lineHeight: 28 },
  imageWrapper: { 
    width: '100%', 
    height: 160, 
    backgroundColor: 'rgba(0,0,0,0.03)', 
    borderRadius: 20, 
    marginBottom: 20, 
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
  },
  questionImage: { width: '80%', height: '80%' },
  optionsContainer: { gap: 10 },
  optionButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    borderWidth: 1.5 
  },
  optionText: { fontSize: 16, fontWeight: '600' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  trophyWrapper: { marginBottom: 30 },
  starsContainer: { ...StyleSheet.absoluteFillObject },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  finalScoreBadge: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    paddingHorizontal: 40, 
    paddingVertical: 20, 
    borderRadius: 25, 
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  finalScoreLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold', letterSpacing: 2 },
  finalScoreValue: { color: 'white', fontSize: 48, fontWeight: 'bold' },
  resultText: { fontSize: 18, textAlign: 'center', marginBottom: 40, lineHeight: 26 },
  resultActions: { width: '100%' },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderRadius: 20, 
    width: '100%', 
    justifyContent: 'center' 
  },
  actionButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
