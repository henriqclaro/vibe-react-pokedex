/* eslint-disable react/no-unstable-nested-components */
import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from './src/styles/theme';
import { SeasonsScreen } from './src/screens/SeasonsScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { TypesScreen } from './src/screens/TypesScreen';

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Tab configuration ───────────────────────────────────────────────────────
const TABS = [
  { name: 'Seasons', icon: '🗺️', label: 'Seasons' },
  { name: 'Search',  icon: '🔍', label: 'Search'  },
  { name: 'Types',   icon: '⚡', label: 'Types'   },
];

const TAB_COUNT     = TABS.length;
const TAB_BAR_HEIGHT = 64;
const PILL_WIDTH    = 56;

// ─── Single animated tab icon ─────────────────────────────────────────────────
interface TabItemProps {
  tab:       { name: string; icon: string; label: string };
  focused:   boolean;
  onPress:   () => void;
  onLongPress: () => void;
}

const TabItem = ({ tab, focused, onPress, onLongPress }: TabItemProps) => {
  const scaleAnim   = useRef(new Animated.Value(focused ? 1 : 0.85)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0.5)).current;
  const labelAnim   = useRef(new Animated.Value(focused ? 0 : 6)).current;
  const labelOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const pressScale  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 0.85,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(labelAnim, {
        toValue: focused ? 0 : 6,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: focused ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim, labelAnim, labelOpacity]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.82,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 3,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[tabItemStyles.container, { transform: [{ scale: pressScale }] }]}>
        {/* Icon */}
        <Animated.Text
          style={[
            tabItemStyles.icon,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {tab.icon}
        </Animated.Text>

        {/* Label — slides up & fades in when focused */}
        <Animated.Text
          style={[
            tabItemStyles.label,
            focused ? tabItemStyles.labelFocused : tabItemStyles.labelUnfocused,
            {
              opacity: labelOpacity,
              transform: [{ translateY: labelAnim }],
            },
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const tabItemStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  labelFocused: {
    color: theme.colors.primary,
  },
  labelUnfocused: {
    color: 'transparent',
  },
});

// ─── Animated pill indicator ──────────────────────────────────────────────────
const PillIndicator = ({ activeIndex }: { activeIndex: number }) => {
  const tabWidth = SCREEN_WIDTH / TAB_COUNT;
  const pillX    = useRef(new Animated.Value(activeIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2)).current;

  useEffect(() => {
    const targetX = activeIndex * tabWidth + (tabWidth - PILL_WIDTH) / 2;
    Animated.spring(pillX, {
      toValue: targetX,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, tabWidth, pillX]);

  return (
    <Animated.View
      style={[pillStyles.pill, { transform: [{ translateX: pillX }] }]}
      pointerEvents="none"
    />
  );
};

const pillStyles = StyleSheet.create({
  pill: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: PILL_WIDTH,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(227, 53, 13, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(227, 53, 13, 0.3)',
  },
});

// ─── Custom tab bar ───────────────────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets   = useSafeAreaInsets();
  const barAnim  = useRef(new Animated.Value(80)).current;

  // Slide the bar up on mount
  useEffect(() => {
    Animated.spring(barAnim, {
      toValue: 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [barAnim]);

  return (
    <Animated.View
      style={[
        tabBarStyles.container,
        {
          paddingBottom: insets.bottom || (Platform.OS === 'android' ? 8 : 0),
          transform: [{ translateY: barAnim }],
        },
      ]}
    >
      {/* Sliding pill indicator */}
      <PillIndicator activeIndex={state.index} />

      {/* Top highlight line */}
      <View style={tabBarStyles.topLine} />

      {/* Tab items */}
      <View style={tabBarStyles.row}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused     = state.index === index;
          const tab         = TABS[index];

          const onPress = () => {
            const event = navigation.emit({
              type:   'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              tab={tab}
              focused={focused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </Animated.View>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(28, 28, 34, 0.97)',
    borderTopWidth: 0,
    height: TAB_BAR_HEIGHT + 20, // extra room for safe area
    paddingTop: 0,
    // Upward shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
    position: 'relative',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    height: TAB_BAR_HEIGHT,
  },
});

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor="transparent" translucent />
        <Tab.Navigator
          id="MainTabs"
          tabBar={(props) => <CustomTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tab.Screen name="Seasons" component={SeasonsScreen} options={{ title: 'Seasons' }} />
          <Tab.Screen name="Search"  component={SearchScreen}  options={{ title: 'Search'  }} />
          <Tab.Screen name="Types"   component={TypesScreen}   options={{ title: 'Types'   }} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
