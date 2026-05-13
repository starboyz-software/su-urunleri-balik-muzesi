import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { Home, User, ScanLine } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  // Check if any nested route in the stack should hide the tab bar
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  // If the stack navigator inside the tab has a focused route that sets tabBarStyle: { display: 'none' }
  // we should respect that.
  if (focusedOptions.tabBarStyle?.display === 'none') {
    return null;
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabBar}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Custom logic for the center "Scan" button
            if (route.name === 'Scan') {
              return (
                <TouchableOpacity
                  key={route.key}
                  onPress={onPress}
                  style={styles.scanButtonContainer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.secondary, COLORS.primary]}
                    style={styles.scanButton}
                  >
                    <ScanLine color={COLORS.white} size={28} />
                  </LinearGradient>
                </TouchableOpacity>
              );
            }

            const Icon = route.name === 'Home' ? Home : User;

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <Icon
                  color={isFocused ? COLORS.secondary : COLORS.textSecondary}
                  size={24}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(26, 31, 38, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  blurContainer: {
    flex: 1,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonContainer: {
    top: -5, // Ortalanmış görünüm için ayarlandı
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: COLORS.background,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButton: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
