import React, { useMemo } from 'react';
import { Image, StyleSheet, View, Dimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';

import StoriesScreen from '../screens/StoriesScreen';
import StoriesListScreen from '../screens/StoriesListScreen';
import CrosswordScreen from '../screens/CrosswordScreen';
import TicketsScreen from '../screens/TicketsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const I_STORIES_OFF = require('../assets/tab_map_off.png');
const I_STORIES_ON = require('../assets/tab_map_on.png');
const I_LIST_OFF = require('../assets/tab_list_off.png');
const I_LIST_ON = require('../assets/tab_list_on.png');
const I_XW_OFF = require('../assets/tab_cross_off.png');
const I_XW_ON = require('../assets/tab_cross_on.png');
const I_TICKETS_OFF = require('../assets/tab_tickets_off.png');
const I_TICKETS_ON = require('../assets/tab_tickets_on.png');
const I_SETTINGS_OFF = require('../assets/tab_settings_off.png');
const I_SETTINGS_ON = require('../assets/tab_settings_on.png');

const { height: H } = Dimensions.get('window');
const IS_TINY = H < 700;

const TAB_RAISE_IOS = 20;
const TAB_RAISE_ANDROID_EXTRA = 30;

export default function MainTabs() {
  const tabBarHeight = useMemo(() => (IS_TINY ? 60 : 64), []);

  const bottomOffset =
    Platform.OS === 'android'
      ? TAB_RAISE_IOS + TAB_RAISE_ANDROID_EXTRA
      : TAB_RAISE_IOS;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          bottom: bottomOffset,

          marginHorizontal: 40,
          marginLeft: 80,
          marginRight: 70,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 12,
        },
        tabBarBackground: () => <View style={styles.tabBg} />,
      }}
    >
      <Tab.Screen
        name="Stories"
        component={StoriesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} onSrc={I_STORIES_ON} offSrc={I_STORIES_OFF} />
          ),
        }}
      />
      <Tab.Screen
        name="StoriesList"
        component={StoriesListScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} onSrc={I_LIST_ON} offSrc={I_LIST_OFF} />
          ),
        }}
      />
      <Tab.Screen
        name="Crossword"
        component={CrosswordScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} onSrc={I_XW_ON} offSrc={I_XW_OFF} />
          ),
        }}
      />
      <Tab.Screen
        name="Tickets"
        component={TicketsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} onSrc={I_TICKETS_ON} offSrc={I_TICKETS_OFF} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} onSrc={I_SETTINGS_ON} offSrc={I_SETTINGS_OFF} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ focused, onSrc, offSrc }: any) {
  return <Image source={focused ? onSrc : offSrc} style={styles.icon} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  tabBg: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: '#1E6B3B',
    borderWidth: 2,
    borderColor: '#D9C07A',
  },
  icon: {
    width: IS_TINY ? 22 : 24,
    height: IS_TINY ? 22 : 24,
  },
});
