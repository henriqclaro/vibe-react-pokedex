/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { theme } from './src/styles/theme';
import { TemporadasScreen } from './src/screens/TemporadasScreen';
import { PesquisaScreen } from './src/screens/PesquisaScreen';
import { TiposScreen } from './src/screens/TiposScreen';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ route, focused }) => {
  let icon = '';
  if (route.name === 'Temporadas') {
    icon = '🗺️';
  } else if (route.name === 'Pesquisa') {
    icon = '🔍';
  } else if (route.name === 'Tipos') {
    icon = '⚡';
  }

  return (
    <Text style={[styles.tabIcon, focused ? styles.iconFocused : styles.iconUnfocused]}>
      {icon}
    </Text>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={theme.colors.cardBackground} />
        <Tab.Navigator
          id="MainTabs"
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused }) => <TabBarIcon route={route} focused={focused} />,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabLabel,
            tabBarItemStyle: styles.tabBarItem,
          })}
        >
          <Tab.Screen 
            name="Temporadas" 
            component={TemporadasScreen} 
            options={{ title: 'Temporadas' }}
          />
          <Tab.Screen 
            name="Pesquisa" 
            component={PesquisaScreen} 
            options={{ title: 'Pesquisa' }}
          />
          <Tab.Screen 
            name="Tipos" 
            component={TiposScreen} 
            options={{ title: 'Tipos' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabIcon: {
    fontSize: 20,
  },
  iconFocused: {
    opacity: 1,
  },
  iconUnfocused: {
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
