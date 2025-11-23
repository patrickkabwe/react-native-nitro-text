import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PlainTextScreen } from './screens/PlainTextScreen';
import { HtmlScreen } from './screens/HtmlScreen';
import { PerformanceScreen } from './screens/PerformanceScreen';

const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#6c757d',
      }}
    >
      <Tab.Screen
        name="PlainText"
        component={PlainTextScreen}
        options={{
          tabBarLabel: 'PlainText',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>📄</Text>
          ),
        }}
      />
      <Tab.Screen
        name="HTML"
        component={HtmlScreen}
        options={{
          tabBarLabel: 'HTML',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🌐</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Performance"
        component={PerformanceScreen}
        options={{
          tabBarLabel: 'Performance',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>⚡</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <MyTabs />
    </NavigationContainer>
  );
}
