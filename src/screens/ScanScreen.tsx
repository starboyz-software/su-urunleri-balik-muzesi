import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { X, Zap, ZapOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { saveScanToHistory } from '../services/HistoryService';

import { useTranslation } from 'react-i18next';
import { ALL_FISH_DATA } from '../data/fishData';

export default function ScanScreen({ navigation }: any) {
  const isFocused = useIsFocused();
  const { t, i18n } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Sayfaya her girildiğinde izin durumunu kontrol et
  useEffect(() => {
    if (isFocused && (!permission || !permission.granted)) {
      requestPermission();
    }
  }, [isFocused]);

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permissionText}>{t('scan.permission_title')}</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={() => requestPermission()}
        >
          <Text style={styles.buttonText}>{t('scan.permission_button')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: any) => {
    if (scanned || !isFocused) return;
    setScanned(true);
    
    // Find fish by ID (The QR code should contain the fish ID like "fish_01")
    const fish = ALL_FISH_DATA.find(f => f.id === data);
    
    if (!fish) {
      Alert.alert(t('common.error'), t('scan.invalid_qr'), [
        { text: t('scan.ok'), onPress: () => setScanned(false) }
      ]);
      return;
    }

    // Send message to Unity (Assuming UnityView/UnityModule is used)
    // UnityModule.postMessage('NativeBridge', 'OnReceiveFishID', fish.id);

    await saveScanToHistory({
      name: t(fish.nameKey),
      image: fish.image
    });
    
    Alert.alert(
      t('scan.success_title'),
      t('scan.success_msg', { name: t(fish.nameKey) }),
      [
        { 
          text: t('scan.view_in_ar'), 
          onPress: () => {
            setScanned(false);
            // Navigate to Unity screen or trigger AR view
            navigation.navigate('FishDetail', { fish: fish, autoStartAR: true });
          } 
        },
        { text: t('scan.ok'), onPress: () => setScanned(false), style: 'cancel' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            enableTorch={torch}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          <View style={styles.overlay}>
            <View style={[styles.topContainer, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <X color={COLORS.white} size={24} />
              </TouchableOpacity>
              <Text style={[styles.title, isRTL ? { marginRight: 20, marginLeft: 0 } : { marginLeft: 20 }]}>{t('scan.title')}</Text>
            </View>

            <View style={styles.scanAreaContainer}>
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <Text style={styles.hintText}>{t('scan.hint')}</Text>
              <TouchableOpacity 
                style={styles.flashButton} 
                onPress={() => setTorch(!torch)}
              >
                <LinearGradient
                  colors={torch ? [COLORS.accent, '#FF4500'] : [COLORS.secondary, COLORS.primary]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.flashButtonText}>{torch ? t('scan.torch_off') : t('scan.torch_on')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { justifyContent: 'center', alignItems: 'center' },
  overlay: { 
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)', 
    justifyContent: 'space-between',
    paddingVertical: 50,
  },
  topContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 25,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  closeButton: { padding: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 15 },
  title: { color: COLORS.white, fontSize: 20, fontWeight: 'bold', marginLeft: 20 },
  scanAreaContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250 },
  corner: { position: 'absolute', width: 45, height: 45, borderColor: COLORS.secondary },
  topLeft: { top: 0, left: 0, borderTopWidth: 6, borderLeftWidth: 6, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderTopWidth: 6, borderRightWidth: 6, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 6, borderLeftWidth: 6, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 6, borderRightWidth: 6, borderBottomRightRadius: 20 },
  bottomContainer: { alignItems: 'center', paddingBottom: 40, paddingHorizontal: 20 },
  hintText: { color: COLORS.white, marginBottom: 25, fontSize: 15, opacity: 0.9, textAlign: 'center' },
  flashButton: { width: '80%', height: 60, borderRadius: 30, overflow: 'hidden' },
  gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  flashButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
  permissionText: { color: '#fff', fontSize: 18, marginBottom: 20, textAlign: 'center' },
  permissionButton: { backgroundColor: COLORS.secondary, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
