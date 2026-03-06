import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen       from './src/screens/HomeScreen';
import ChatScreen       from './src/screens/ChatScreen';
import NudgesScreen     from './src/screens/NudgesScreen';
import EventsScreen     from './src/screens/EventsScreen';
import InsightsScreen   from './src/screens/InsightsScreen';

// Services
import { loadUser } from './src/services/storage';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── TAB ICONS (emoji fallback — replace with react-native-vector-icons) ──
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🫀', Chat: '💬', Nudges: '✦', Events: '📍', Insights: '📈'
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {icons[name]}
    </Text>
  );
}

// ── MAIN TAB NAVIGATOR ────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#C8A97E',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#10131C',
          borderTopColor: 'rgba(255,255,255,0.06)',
          paddingBottom: 8,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen} />
      <Tab.Screen name="Chat"     component={ChatScreen} />
      <Tab.Screen name="Nudges"   component={NudgesScreen} />
      <Tab.Screen name="Events"   component={EventsScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}

// ── ROOT NAVIGATOR ────────────────────────────────────────────────────────
export default function App() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    loadUser().then(user => setIsOnboarded(!!user?.onboarded));
  }, []);

  if (isOnboarded === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#080A10', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#C8A97E', fontSize: 32, fontStyle: 'italic' }}>pulse</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isOnboarded ? (
            <Stack.Screen name="Onboarding">
              {(props) => <OnboardingScreen {...props} onComplete={() => setIsOnboarded(true)} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
