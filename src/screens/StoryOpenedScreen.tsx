import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Easing,
  Share,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { stories, StoryPin, SHARE_ICON, LOCK } from '../data/stories';

const BG = require('../assets/background.png');

const STORAGE_KEYS = {
  STORIES_UNLOCKED: 'stories_unlocked_v1',
};

type MainTabParamList = {
  Stories: undefined;
  StoriesList: undefined;
  Crossword: { id?: string } | undefined;
  Tickets: undefined;
  Settings: undefined;
};

type RootStackParamList = {
  Loader: undefined;
  Onboarding: undefined;

  MainTabs:
    | {
        screen?: keyof MainTabParamList;
        params?: any;
      }
    | undefined;

  StoryOpened: { id: string };
};

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_SMALL = H < 780;

export default function StoryOpenedScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'StoryOpened'>>();

  const [storiesUnlocked, setStoriesUnlocked] = useState<Record<string, true>>({});

  const item: StoryPin | undefined = useMemo(
    () => stories.find((s) => s.id === route.params.id),
    [route.params.id]
  );

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(12)).current;

  const loadUnlocked = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STORIES_UNLOCKED);
      if (!raw) {
        setStoriesUnlocked({});
        return;
      }
      const parsed = JSON.parse(raw) as Record<string, true>;
      setStoriesUnlocked(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setStoriesUnlocked({});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(12);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, slide]);

  const unlockedByTickets = useMemo(() => {
    if (!item) return false;
    return !!storiesUnlocked[item.id];
  }, [storiesUnlocked, item]);

  const locked = useMemo(() => {
    if (!item) return true;
    if (!item.locked) return false;
    return !unlockedByTickets;
  }, [item, unlockedByTickets]);

  const onShare = useCallback(async () => {
    if (!item) return;
    if (locked) return;
    try {
      await Share.share({ message: `${item.title}\n${item.coordsText}` });
    } catch {
  
    }
  }, [item, locked]);

  const goToCrossword = useCallback(() => {
    if (!item) return;
    if (locked) return;

    nav.navigate('MainTabs', {
      screen: 'Crossword',
      params: { id: item.id },
    });
  }, [nav, item, locked]);

  if (!item) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 20 }]}>
        <Text style={{ color: '#fff' }}>Not found</Text>
      </View>
    );
  }

  const TOP_PAD = insets.top + (IS_TINY ? 6 : 10) + 50;
  const BOTTOM_PAD = insets.bottom + (IS_TINY ? 10 : 14);

  const THUMB = IS_TINY ? 68 : IS_SMALL ? 74 : 80;
  const TITLE_SIZE = IS_TINY ? 13 : 14;
  const DESC_SIZE = IS_TINY ? 11 : 12;
  const LINE_H = IS_TINY ? 16 : 18;

  const DESC_MAX = Math.round(H * (IS_TINY ? 0.48 : IS_SMALL ? 0.52 : 0.56));

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        <View style={styles.content}>
          <View style={{ height: TOP_PAD }} />

          <Animated.View style={{ opacity: fade, transform: [{ translateY: slide }] }}>
            <View style={[styles.card, locked ? styles.cardLocked : styles.cardOpen]}>
              <View style={styles.topRow}>
                <View style={[styles.thumbWrap, { width: THUMB, height: THUMB }]}>
                  <Image source={item.image} style={styles.thumb} resizeMode="cover" />
                  {locked && (
                    <View style={styles.lockBadge}>
                      <Image source={LOCK} style={styles.lockIcon} resizeMode="contain" />
                    </View>
                  )}
                </View>

                <View style={styles.topText}>
                  <Text style={[styles.title, { fontSize: TITLE_SIZE }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.coords} numberOfLines={1}>
                    {item.coordsText}
                  </Text>
                </View>

                <Pressable
                  style={[styles.shareBtn, locked && styles.shareBtnDisabled]}
                  onPress={onShare}
                  disabled={locked}
                  hitSlop={10}
                >
                  <Image source={SHARE_ICON} style={styles.shareIcon} resizeMode="contain" />
                </Pressable>
              </View>

        
              <View style={[styles.descBox, { maxHeight: DESC_MAX }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={[styles.desc, { fontSize: DESC_SIZE, lineHeight: LINE_H }]}>
                    {item.description}
                  </Text>
                </ScrollView>
              </View>
              <View style={[styles.bottomRow, { marginTop: IS_TINY ? 10 : 12 }]}>
                <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
                  <Text style={[styles.backText, { fontSize: IS_TINY ? 12 : 13 }]}>Back</Text>
                </Pressable>

                <Pressable
                  style={[styles.crossBtn, locked && styles.crossBtnDisabled]}
                  onPress={goToCrossword}
                  disabled={locked}
                >
                  <Text
                    style={[
                      styles.crossText,
                      { fontSize: IS_TINY ? 12 : 13 },
                      locked && styles.crossTextDisabled,
                    ]}
                  >
                    To Crossword
                  </Text>
                </Pressable>
              </View>

              {locked && (
                <Text style={[styles.lockHint, { marginTop: IS_TINY ? 8 : 10 }]}>
                  This location is locked. Unlock it in the Tickets section.
                </Text>
              )}
            </View>
          </Animated.View>

          <View style={{ height: BOTTOM_PAD }} />
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07181A' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },

  content: { flex: 1, paddingHorizontal: 16 },

  card: {
    width: W - 32,
    borderRadius: 18,
    padding: 12,
    borderWidth: 2,
  },
  cardOpen: {
    backgroundColor: 'rgba(18, 75, 46, 0.92)',
    borderColor: 'rgba(214, 255, 184, 0.55)',
  },
  cardLocked: {
    backgroundColor: 'rgba(87, 26, 26, 0.92)',
    borderColor: 'rgba(255, 210, 210, 0.35)',
  },

  topRow: { flexDirection: 'row', alignItems: 'center' },

  thumbWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    marginRight: 12,
  },
  thumb: { width: '100%', height: '100%' },

  lockBadge: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { width: 13, height: 13 },

  topText: { flex: 1, paddingRight: 8 },
  title: { color: '#fff', fontWeight: '900' },
  coords: { color: 'rgba(255,255,255,0.86)', fontSize: 11, marginTop: 2 },

  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnDisabled: { opacity: 0.55 },
  shareIcon: { width: 18, height: 18 },

  descBox: {
    marginTop: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  desc: { color: 'rgba(255,255,255,0.92)' },

  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  backBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#0f1a12', fontWeight: '900' },

  crossBtn: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossBtnDisabled: { opacity: 0.55 },
  crossText: { color: 'rgba(255,255,255,0.95)', fontWeight: '900' },
  crossTextDisabled: { color: 'rgba(255,255,255,0.78)' },

  lockHint: { color: 'rgba(255,255,255,0.90)', fontSize: 11, lineHeight: 16 },
});
