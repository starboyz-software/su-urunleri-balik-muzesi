import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Modal, NativeModules, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import UnityView from '@azesmway/react-native-unity';
import { ArrowLeft, RefreshCw, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ARScreen({ route, navigation }: any) {
  const { fish } = route.params;
  const unityRef = useRef<UnityView>(null);
  const hasSpawned = useRef(false);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [unityTarget, setUnityTarget] = useState('NativeBridge');

  const sendFishToUnity = useCallback(() => {
    // 9-FISH SYNCED MAPPING (Old mapping updated for new IDs if needed)
    // Map the new string IDs to what Unity expects (fish_01, etc.)
    const fishMap: { [key: string]: string } = {
      'alabalik': 'fish_01',
      'benekli_siraz': 'fish_02',
      'biyikli': 'fish_03',
      'bizir': 'fish_04',
      'caner': 'fish_05',
      'elazig_sirazi': 'fish_06',
      'gumus': 'fish_07',
      'kefal': 'fish_08',
      'kizilkanat': 'fish_09',
      'kupeli': 'fish_10',
      'sabut': 'fish_11',
      'sazan': 'fish_12',
      'sazan_aynali': 'fish_13',
      'tas_isiran': 'fish_14',
      'yayin': 'fish_15',
      'yilan': 'fish_16'
    };

    const targetID = fishMap[fish.id] || fish.id;
    const targets = [unityTarget, 'NativeBridge', 'Game Manager', 'Native Bridge', 'FishSpawner'];

    targets.forEach(target => {
      const bridge = NativeModules.UnityBridge;
      if (bridge && bridge.postMessage) {
        console.log(`[ARScreen] Spawning Fish via Global Bridge on ${target}: ${targetID}`);
        bridge.postMessage(target, 'OnReceiveFishID', targetID);
      } else {
        console.log(`[ARScreen] Spawning Fish via Ref Fallback on ${target}: ${targetID}`);
        unityRef.current?.postMessage(target, 'OnReceiveFishID', targetID);
      }
    });
  }, [fish.id, unityTarget]);

  const onUnityMessage = useCallback((handler: any) => {
    const message = handler.nativeEvent.message;
    console.log('[ARScreen] Message from Unity:', message);
    
    if (message && message.startsWith('Identity:')) {
      const actualName = message.split(':')[1];
      console.log(`[ARScreen] Unity Identified as: ${actualName}. Updating target.`);
      setUnityTarget(actualName);
    }

    if (message === 'Ready' || message === 'ready') {
      console.log('[ARScreen] Unity is Ready! Triggering auto-spawn...');
      if (!hasSpawned.current) {
        sendFishToUnity();
        hasSpawned.current = true;
      }
    }
  }, [sendFishToUnity]);

  const handleZoomIn = () => {
    const targets = [unityTarget, 'NativeBridge', 'Game Manager', 'Native Bridge', 'FishSpawner'];
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
    const targets = [unityTarget, 'NativeBridge', 'Game Manager', 'Native Bridge', 'FishSpawner'];
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
    const targets = [unityTarget, 'NativeBridge', 'Game Manager', 'Native Bridge', 'FishSpawner'];
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

  useEffect(() => {
    const timer = setTimeout(() => setShowUI(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <UnityView
        ref={unityRef}
        style={StyleSheet.absoluteFill}
        onUnityMessage={onUnityMessage}
        onReady={() => {
          console.log('[ARScreen] Unity View Ready');
        }}
      />

      <View 
        style={StyleSheet.absoluteFill} 
        {...panResponder.panHandlers} 
        pointerEvents="auto"
      />

      {showUI && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={styles.modalOverlay} pointerEvents="box-none">
            <View style={[styles.topBar, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
              >
                <ArrowLeft color="white" size={24} />
                <Text style={styles.backText}>{t('common.back')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.rightControls, { top: '30%' }]} pointerEvents="box-none">
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

            <View style={[styles.bottomInfo, { paddingBottom: insets.bottom + 20 }]} pointerEvents="box-none">
              <View style={styles.infoCard}>
                <Text style={styles.fishName}>{t(fish.nameKey)}</Text>
                <Text style={styles.fishTag}>{t(fish.tagKey)}</Text>
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
  topBar: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  backText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  rightControls: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  controlGroupVertical: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
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
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fishName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fishTag: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
});
