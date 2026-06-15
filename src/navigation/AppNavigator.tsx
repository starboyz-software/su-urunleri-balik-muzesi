import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanScreen from '../screens/ScanScreen';
import AboutScreen from '../screens/AboutScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import FishDetailScreen from '../screens/FishDetailScreen';
import MarineFishesScreen from '../screens/MarineFishesScreen';
import ARScreen from '../screens/ARScreen';
import QuizScreen from '../screens/QuizScreen';
import GlobalMapScreen from '../screens/GlobalMapScreen';
import GuestbookScreen from '../screens/GuestbookScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="History" component={HistoryScreen} />
      <ProfileStack.Screen name="Favorites" component={FavoritesScreen} />
      <ProfileStack.Screen name="FishDetail" component={FishDetailScreen} />
      <ProfileStack.Screen name="AR" component={ARScreen} />
    </ProfileStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen 
        name="FishDetail" 
        component={FishDetailScreen} 
        options={{ tabBarStyle: { display: 'none' } } as any} 
      />
      <Stack.Screen 
        name="AR" 
        component={ARScreen} 
        options={{ tabBarStyle: { display: 'none' } } as any} 
      />
      <Stack.Screen name="Marine" component={MarineFishesScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
      <Stack.Screen name="GlobalMap" component={GlobalMapScreen} />
      <Stack.Screen name="Guestbook" component={GuestbookScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen 
          name="Scan" 
          component={ScanScreen} 
          options={{ tabBarStyle: { display: 'none' } }}
        />
        <Tab.Screen name="Profile" component={ProfileStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
