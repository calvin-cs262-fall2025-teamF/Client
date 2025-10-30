// appnavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import JobTrackerScreen from '../screens/JobTrackerScreen';
import TargetCompaniesScreen from '../screens/TargetCompaniesScreen';
import ResumeScreen from '../screens/ResumeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'JobTracker') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Targets') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Resume') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        // Floating tab bar lifted from the very bottom
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          height: 65,
          paddingTop: 6,
          paddingBottom: 10,   // space above iPhone home indicator
          backgroundColor: 'white',
          borderRadius: 16,
          borderTopWidth: 0,
          elevation: 5,        // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOpacity: 0.05,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 8,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="JobTracker"
        component={JobTrackerScreen}
        options={{ tabBarLabel: 'Job Tracker' }}
      />
      <Tab.Screen
        name="Targets"
        component={TargetCompaniesScreen}
        options={{ tabBarLabel: 'Target Companies' }}
      />
      <Tab.Screen
        name="Resume"
        component={ResumeScreen}
        options={{ tabBarLabel: 'Resume' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
