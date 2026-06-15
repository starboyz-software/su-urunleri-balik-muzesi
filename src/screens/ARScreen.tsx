import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Modal, NativeModules, PanResponder, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UnityView from '@azesmway/react-native-unity';
import { ArrowLeft, RefreshCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Droplet, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ARScreen({ route, navigation }: any) {
  const { fish } = route.params;
  const unityRef = useRef<UnityView>(null);
  const hasSpawned = useRef(false);
  const spawnAttempts = useRef(0);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [unityTarget, setUnityTarget] = useState('NativeBridge');
  const [isInfoExpanded, setIsInfoExpanded] = useState(true);

  // Animated values
  const cardSlide = useRef(new Animated.Value(-200)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const sendFishToUnity = useCallback(() => {
    const fishMap: { [key: string]: string } = {
      'lufer': 'fish_01',
      'cipura': 'fish_02',
      'kefal': 'fish_03',
      'gun_baligi': 'fish_04',
      'kum_mercani': 'fish_05',
      'levrek': 'fish_06',
      'yazili_hani': 'fish_07',
      'sarikuyruk_istavrit': 'fish_08',
      'kupes': 'fish_09',
    };

    const targetID = fishMap[fish.id] || fish.id;
    const targets = [unityTarget, 'NativeBridge', '[TEST] Fish Spawner', 'Game Manager', 'Native Bridge', 'FishSpawner'];

    console.log(`[ARScreen] ===== SENDING FISH ID: ${fish.id} -> ${targetID} (attempt ${spawnAttempts.current + 1}) =====`);

    targets.forEach(target => {
      const bridge = NativeModules.UnityBridge;
      if (bridge && bridge.postMessage) {
        bridge.postMessage(target, 'OnReceiveFishID', targetID);
      } else {
        unityRef.current?.postMessage(target, 'OnReceiveFishID', targetID);
      }
    });

    spawnAttempts.current += 1;
  }, [fish.id, unityTarget]);

  // FALLBACK: If Unity never sends "Ready", auto-spawn after a single delay
  useEffect(() => {
    const spawnTimer = setTimeout(() => {
      if (!hasSpawned.current) {
        console.log('[ARScreen] FALLBACK: Unity did not send Ready. Spawning fish once...');
        sendFishToUnity();
        hasSpawned.current = true;
      }
    }, 3000);

    return () => clearTimeout(spawnTimer);
  }, []); // Empty deps — run only once on mount

  const onUnityMessage = useCallback((handler: any) => {
    const message = handler.nativeEvent.message;
    console.log('[ARScreen] Message from Unity:', message);
    
    if (message && message.startsWith('Identity:')) {
      const actualName = message.split(':')[1];
      setUnityTarget(actualName);
    }

    if (message === 'Ready' || message === 'ready') {
      if (!hasSpawned.current) {
        sendFishToUnity();
        hasSpawned.current = true;
      }
    }
  }, [sendFishToUnity]);

  const handleZoomIn = () => {
    const targets = [unityTarget, 'NativeBridge', '[TEST] Fish Spawner', 'Game Manager', 'Native Bridge', 'FishSpawner'];
    targets.forEach(target => {
      const bridge = NativeModules.UnityBridge;
      if (bridge && bridge.postMessage) {
        bridge.postMessage(target, 'OnScaleChange', 'increase');
      } else {
        unityRef.current?.postMessage(target, 'OnScaleChange', 'increase');
      }
    });
  };

  const handleZoomOut = () => {
    const targets = [unityTarget, 'NativeBridge', '[TEST] Fish Spawner', 'Game Manager', 'Native Bridge', 'FishSpawner'];
    targets.forEach(target => {
      const bridge = NativeModules.UnityBridge;
      if (bridge && bridge.postMessage) {
        bridge.postMessage(target, 'OnScaleChange', 'decrease');
      } else {
        unityRef.current?.postMessage(target, 'OnScaleChange', 'decrease');
      }
    });
  };

  const lastDx = useRef(0);

  const handleDragRotate = useCallback((deltaX: number) => {
    const targets = [unityTarget, 'NativeBridge', '[TEST] Fish Spawner', 'Game Manager', 'Native Bridge', 'FishSpawner'];
    targets.forEach(target => {
      const bridge = NativeModules.UnityBridge;
      if (bridge && bridge.postMessage) {
        bridge.postMessage(target, 'OnDragRotate', deltaX.toString());
      } else {
        unityRef.current?.postMessage(target, 'OnDragRotate', deltaX.toString());
      }
    });
  }, [unityTarget]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastDx.current = 0;
      },
      onPanResponderMove: (evt, gestureState) => {
        const deltaX = gestureState.dx - lastDx.current;
        lastDx.current = gestureState.dx;
        handleDragRotate(deltaX / 5);
      },
      onPanResponderRelease: () => {
        lastDx.current = 0;
      },
    })
  ).current;

  const [showUI, setShowUI] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleInfoCard = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsInfoExpanded(!isInfoExpanded);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUI(true);
      // Animate info card entrance
      Animated.parallel([
        Animated.spring(cardSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get fun fact for current fish
  const funFactKey = `ar.fun_fact_${fish.id}`;
  const funFact = t(funFactKey);
  const hasFunFact = funFact !== funFactKey;

  // Category emoji mapping
  const categoryEmoji: { [key: string]: string } = {
    'Economic': '💰',
    'River': '🏞️',
    'Predator': '🦈',
    'Endemic': '🌟',
    'Protected': '🛡️',
  };

  return (
    <View style={styles.container}>
      <UnityView
        ref={unityRef}
        style={StyleSheet.absoluteFill}
        onUnityMessage={onUnityMessage}
      />

      {showUI && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Transparent backdrop that captures drag events to rotate the fish */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="auto"
            {...panResponder.panHandlers}
          />

          <View style={styles.modalOverlay} pointerEvents="box-none">
            {/* === TOP: Back Button + Info Card === */}
            <Animated.View 
              style={[
                styles.topSection, 
                { 
                  paddingTop: insets.top + 8,
                  transform: [{ translateY: cardSlide }],
                  opacity: cardOpacity,
                }
              ]} 
              pointerEvents="box-none"
            >
              {/* Back Button Row */}
              <View style={styles.topBarRow} pointerEvents="box-none">
                <TouchableOpacity 
                  style={styles.backButton} 
                  onPress={() => navigation.goBack()}
                >
                  <ArrowLeft color="white" size={22} />
                  <Text style={styles.backText}>{t('common.back')}</Text>
                </TouchableOpacity>
              </View>

              {/* Fish Info Card */}
              <View style={styles.infoCardWrapper}>
                <LinearGradient
                  colors={['rgba(0, 180, 255, 0.85)', 'rgba(100, 50, 255, 0.85)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoCardGradient}
                >
                  {/* Header row: Fish name + toggle */}
                  <TouchableOpacity 
                    style={styles.infoCardHeader} 
                    onPress={toggleInfoCard}
                    activeOpacity={0.8}
                  >
                    <View style={styles.fishNameRow}>
                      <Text style={styles.fishEmoji}>🐟</Text>
                      <View style={styles.fishNameCol}>
                        <Text style={styles.infoFishName} numberOfLines={1}>
                          {t(fish.nameKey)}
                        </Text>
                        <Text style={styles.infoSpecies}>{fish.species}</Text>
                      </View>
                    </View>
                    <View style={styles.toggleButton}>
                      {isInfoExpanded ? (
                        <ChevronUp color="rgba(255,255,255,0.9)" size={20} />
                      ) : (
                        <ChevronDown color="rgba(255,255,255,0.9)" size={20} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Expandable details */}
                  {isInfoExpanded && (
                    <View style={styles.infoCardBody}>
                      {/* Tags Row */}
                      <View style={styles.tagsRow}>
                        <View style={styles.tagPill}>
                          <Text style={styles.tagPillText}>
                            {categoryEmoji[fish.category] || '🐠'} {t(fish.tagKey)}
                          </Text>
                        </View>
                        {fish.category === 'Endemic' && (
                          <View style={[styles.tagPill, styles.tagPillSpecial]}>
                            <Text style={styles.tagPillText}>🌟 Nadir Tür</Text>
                          </View>
                        )}
                      </View>

                      {/* Fun Fact Box */}
                      {hasFunFact && (
                        <View style={styles.funFactBox}>
                          <View style={styles.funFactHeader}>
                            <Sparkles color="#FFD700" size={16} />
                            <Text style={styles.funFactTitle}>{t('ar.fun_fact_label')}</Text>
                          </View>
                          <Text style={styles.funFactText}>{funFact}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </LinearGradient>
              </View>
            </Animated.View>

            {/* === RIGHT: Zoom Controls === */}
            <View style={[styles.rightControls, { top: '40%' }]} pointerEvents="box-none">
              {isSidebarCollapsed ? (
                <TouchableOpacity style={styles.expandButton} onPress={toggleSidebar}>
                  <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
              ) : (
                <View style={styles.controlGroupVertical}>
                  <TouchableOpacity style={styles.collapseToggle} onPress={toggleSidebar}>
                    <ChevronRight color="white" size={20} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
                    <ZoomIn color="white" size={24} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
                    <ZoomOut color="white" size={24} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* === BOTTOM: Minimal Fish Name === */}
            <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 16 }]} pointerEvents="box-none">
              <View style={styles.bottomBadge}>
                <Droplet color="rgba(255,255,255,0.8)" size={14} />
                <Text style={styles.bottomBadgeText}>AR Görüntüleyici</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  modalOverlay: {
    flex: 1,
  },
  // === TOP SECTION ===
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  topBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
  },
  backText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
  },
  // === INFO CARD ===
  infoCardWrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  infoCardGradient: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fishNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fishEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  fishNameCol: {
    flex: 1,
  },
  infoFishName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  infoSpecies: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 1,
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // === CARD BODY ===
  infoCardBody: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tagPillSpecial: {
    backgroundColor: 'rgba(255, 215, 0, 0.25)',
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  tagPillText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  // === FUN FACT ===
  funFactBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  funFactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  funFactTitle: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: 'bold',
  },
  funFactText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  // === RIGHT CONTROLS ===
  rightControls: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    alignItems: 'center',
  },
  controlGroupVertical: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  expandButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  collapseToggle: {
    width: 40,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  // === BOTTOM ===
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
});

