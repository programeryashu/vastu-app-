import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CompassScreen from './src/screens/CompassScreen';
import DirectionGuideScreen from './src/screens/DirectionGuideScreen';
import DirectionDetailScreen from './src/screens/DirectionDetailScreen';
import VastuGuideScreen from './src/screens/VastuGuideScreen';
import VastuGuideDetailScreen from './src/screens/VastuGuideDetailScreen';
import MoreScreen from './src/screens/MoreScreen';
import AboutScreen from './src/screens/AboutScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import PlacementDetailScreen from './src/screens/PlacementDetailScreen';
import RemediesScreen from './src/screens/RemediesScreen';
import RemedyDetailScreen from './src/screens/RemedyDetailScreen';
import PlaceThingsScreen from './src/screens/PlaceThingsScreen';
import VastuEntriesScreen from './src/screens/VastuEntriesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Colors ──
const COLORS = {
  background: '#FAF8F5',
  surface: '#FFFFFF',
  text: '#2D2418',
  textSecondary: '#7A6F63',
  accent: '#C9A96E',
  border: '#E8E2DA',
  primary: '#5D4E37',
  success: '#4A7C59',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#F0EBE5',
};

// ── Shared Stack Options ──
const stackScreenOptions = {
  headerStyle: { backgroundColor: COLORS.background },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  headerShadowVisible: false,
  headerBackTitle: 'Back',
  contentStyle: { backgroundColor: COLORS.background },
};

// ── Explore Stack (Directions + Guide + Database) ──
function ExploreStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ExploreMain" component={VastuGuideScreen} options={{ title: 'Explore Vastu' }} />
      <Stack.Screen name="VastuGuideDetail" component={VastuGuideDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="DirectionList" component={DirectionGuideScreen} options={{ title: 'Directions' }} />
      <Stack.Screen name="DirectionDetail" component={DirectionDetailScreen} options={{ title: 'Direction' }} />
      <Stack.Screen name="PlacementDetail" component={PlacementDetailScreen} options={{ title: 'Placement' }} />
      <Stack.Screen name="RemedyDetail" component={RemedyDetailScreen} options={{ title: 'Remedy' }} />
      <Stack.Screen name="VastuEntries" component={VastuEntriesScreen} options={{ title: 'Database' }} />
    </Stack.Navigator>
  );
}

// ── Remedies Stack ──
function RemediesStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="RemediesList" component={RemediesScreen} options={{ title: 'Remedies' }} />
      <Stack.Screen name="RemedyDetail" component={RemedyDetailScreen} options={{ title: 'Remedy' }} />
      <Stack.Screen name="PlaceThingsMain" component={PlaceThingsScreen} options={{ title: 'Place Things' }} />
      <Stack.Screen name="VastuGuideDetail" component={VastuGuideDetailScreen} options={{ title: 'Details' }} />
      <Stack.Screen name="PlacementDetail" component={PlacementDetailScreen} options={{ title: 'Placement' }} />
    </Stack.Navigator>
  );
}

// ── More Stack ──
function MoreStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ title: 'More' }} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Vastu' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}

// ── Tab Icons ──
function TabIcon({ route, focused, color, size }) {
  const icons = {
    Home: focused ? 'home' : 'home-outline',
    Compass: focused ? 'compass' : 'compass-outline',
    Explore: focused ? 'compass' : 'compass-outline',
    Remedies: focused ? 'medical' : 'medical-outline',
    More: focused ? 'menu' : 'menu-outline',
  };
  return <Ionicons name={icons[route.name]} size={size} color={color} />;
}

// ── Bottom Tabs (5 mobile-friendly tabs) ──
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: (props) => <TabIcon route={route} {...props} />,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#A69B90',
        tabBarStyle: {
          backgroundColor: COLORS.tabBarBg,
          borderTopColor: COLORS.tabBarBorder,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          // Add subtle shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerStyle: { backgroundColor: COLORS.background, shadowColor: 'transparent' },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home', headerShown: false }}
      />
      <Tab.Screen
        name="Compass"
        component={CompassScreen}
        options={{ title: 'Compass' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{ headerShown: false, title: 'Explore' }}
      />
      <Tab.Screen
        name="Remedies"
        component={RemediesStack}
        options={{ headerShown: false, title: 'Remedies' }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ headerShown: false, title: 'More' }}
      />
    </Tab.Navigator>
  );
}

// ── App ──
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainTabs />
          <StatusBar style="dark" barStyle="dark-content" />
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}