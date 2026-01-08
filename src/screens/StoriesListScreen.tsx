import React, { useMemo, useRef, useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  Animated,
  Easing,
  Share,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/background.png');
const LOCK = require('../assets/lock.png');
const SHARE_ICON = require('../assets/divider.png');

const IMG_BLOSSOM = require('../assets/blossom.png');
const IMG_BUFFALO = require('../assets/buffalo.png');
const IMG_CITRUS = require('../assets/citrus.png');
const IMG_COIN = require('../assets/coin_gate.png');
const IMG_FALCON = require('../assets/falcon_chapel.png');
const IMG_WHARF = require('../assets/old_wharf.png');
const IMG_STEPS = require('../assets/battery_steps.png');
const IMG_CASCADES = require('../assets/cascades_factory.png');
const IMG_SALAMANCA = require('../assets/salamanca.png');
const IMG_GAOL = require('../assets/gaol_ruins.png');

type RootStackParamList = {
  StoriesList: undefined;
  StoryOpened: { id: string };
  Crossword: { id?: string };
};

type StoryPin = {
  id: string;
  title: string;
  coordsText: string;
  lat: number;
  lng: number;
  locked?: boolean;
  image: any;
};

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_SMALL = H < 760;

const LOCKED_STORY_IDS = new Set(['8', '9', '10']);
const STORAGE_UNLOCKED_STORIES = 'stories_unlocked_v1';

const baseStories: StoryPin[] = [
  { id: '1', title: 'Blossom Shrine', coordsText: '–42.8828, 147.3252', lat: -42.8828, lng: 147.3252, image: IMG_BLOSSOM },
  { id: '2', title: 'Buffalo Ridge Lookout', coordsText: '–42.8971, 147.3107', lat: -42.8971, lng: 147.3107, image: IMG_BUFFALO },
  { id: '3', title: 'Citrus Vault', coordsText: '–42.8763, 147.3331', lat: -42.8763, lng: 147.3331, image: IMG_CITRUS },
  { id: '4', title: "Emperor’s Coin Gate", coordsText: '–42.8820, 147.3278', lat: -42.882, lng: 147.3278, image: IMG_COIN },
  { id: '5', title: 'Falcon Sun Chapel', coordsText: '–42.8855, 147.3121', lat: -42.8855, lng: 147.3121, image: IMG_FALCON },
  { id: '6', title: 'Old Wharf Docks', coordsText: '–42.8810, 147.3320', lat: -42.881, lng: 147.332, image: IMG_WHARF },
  { id: '7', title: 'Battery Point Steps', coordsText: '–42.8875, 147.3312', lat: -42.8875, lng: 147.3312, image: IMG_STEPS },
  { id: '8', title: 'Cascades Female Factory', coordsText: '–42.8970, 147.3083', lat: -42.897, lng: 147.3083, image: IMG_CASCADES },
  { id: '9', title: 'Salamanca Warehouses', coordsText: '–42.8850, 147.3305', lat: -42.885, lng: 147.3305, image: IMG_SALAMANCA },
  { id: '10', title: 'Hobart Gaol Ruins', coordsText: '–42.8805, 147.3209', lat: -42.8805, lng: 147.3209, image: IMG_GAOL },
];

function sortStories(list: StoryPin[]) {
  return [...list].sort((a, b) => Number(a.id) - Number(b.id));
}

export default function StoriesListScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [unlockedMap, setUnlockedMap] = useState<Record<string, true>>({});

  const loadUnlocked = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_UNLOCKED_STORIES);
      if (!raw) {
        setUnlockedMap({});
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        setUnlockedMap(parsed as Record<string, true>);
      } else {
        setUnlockedMap({});
      }
    } catch {
      setUnlockedMap({});
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUnlocked();
    }, [loadUnlocked])
  );

  const data = useMemo(() => {
    const base = sortStories(baseStories);
    return base.map((s) => {
      const mustBuy = LOCKED_STORY_IDS.has(s.id);
      const isUnlocked = !!unlockedMap[s.id];
      const locked = mustBuy && !isUnlocked;
      return { ...s, locked };
    });
  }, [unlockedMap]);

  const screenFade = useRef(new Animated.Value(0)).current;
  const screenSlide = useRef(new Animated.Value(14)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    screenFade.setValue(0);
    screenSlide.setValue(14);
    listAnim.setValue(0);

    Animated.parallel([
      Animated.timing(screenFade, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(screenSlide, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [screenFade, screenSlide, listAnim]);

  const onShare = useCallback(async (pin: StoryPin) => {
    try {
      await Share.share({ message: `${pin.title}\n${pin.coordsText}` });
    } catch {}
  }, []);

  const CARD_H = IS_TINY ? 84 : IS_SMALL ? 92 : 98;
  const THUMB = IS_TINY ? 60 : IS_SMALL ? 66 : 72;

  const LIST_TOP_PAD = insets.top + (IS_TINY ? 6 : 10) + 30;
  const LIST_BOTTOM_PAD = insets.bottom + 82 + 50;

  const renderItem = ({ item, index }: { item: StoryPin; index: number }) => {
    const locked = !!item.locked;
    const itemTranslateY = listAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [10 + index * 2, 0],
    });
    const itemOpacity = listAnim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.7, 1],
    });

    return (
      <Animated.View style={{ opacity: itemOpacity, transform: [{ translateY: itemTranslateY }] }}>
        <Pressable
          style={[styles.card, { height: CARD_H }, locked ? styles.cardLocked : styles.cardOpen]}
          onPress={() => {
            if (!locked) nav.navigate('StoryOpened', { id: item.id });
          }}
        >
          <View style={[styles.thumbWrap, { width: THUMB, height: THUMB }, locked && styles.thumbWrapLocked]}>
            <Image source={item.image} style={styles.thumb} resizeMode="cover" />
            {locked && (
              <View style={styles.lockBadge}>
                <Image source={LOCK} style={styles.lockIcon} resizeMode="contain" />
              </View>
            )}
          </View>

          <View style={styles.mid}>
            <Text style={[styles.title, { fontSize: IS_TINY ? 13 : 14 }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.coords} numberOfLines={1}>
              {item.coordsText}
            </Text>
            <View style={styles.rowBottom}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{locked ? 'Locked' : 'Open'}</Text>
              </View>
              {locked && (
                <Text style={styles.lockSmallHint} numberOfLines={1}>
                  Unlock in Tickets
                </Text>
              )}
            </View>
          </View>

          <Pressable
            style={[styles.shareBtn, locked && styles.shareBtnDisabled]}
            onPress={() => onShare(item)}
            disabled={locked}
            hitSlop={10}
          >
            <Image source={SHARE_ICON} style={styles.shareIcon} resizeMode="contain" />
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  };

  const ListHeader = useMemo(() => {
    return (
      <View style={{ paddingTop: LIST_TOP_PAD, paddingHorizontal: 16, paddingBottom: 12 }}>
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenSlide }] }}>
          <Text style={[styles.header, { fontSize: IS_TINY ? 18 : 20 }]}>Stories</Text>
        </Animated.View>
      </View>
    );
  }, [LIST_TOP_PAD, screenFade, screenSlide]);

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        <FlatList
          data={data}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: LIST_BOTTOM_PAD,
            gap: IS_TINY ? 10 : 12,
          }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={8}
        />
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07181A' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },

  header: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '900',
    letterSpacing: 0.2,
  },

  card: {
    width: W - 32,
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
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

  thumbWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.25)',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  thumbWrapLocked: { borderColor: 'rgba(255,255,255,0.10)' },
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

  mid: { flex: 1, paddingRight: 8 },
  title: { color: '#fff', fontWeight: '900' },
  coords: { color: 'rgba(255,255,255,0.86)', fontSize: 11, marginTop: 2 },

  rowBottom: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  statusText: { color: 'rgba(255,255,255,0.95)', fontSize: 11, fontWeight: '800' },
  lockSmallHint: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '700' },

  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnDisabled: { opacity: 0.55 },
  shareIcon: { width: 18, height: 18 },
});
