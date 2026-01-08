import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  Animated,
  Easing,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/background.png');
const GUIDE = require('../assets/guide3.png');
const LOCK = require('../assets/lock.png');

const IMG_BLOSSOM = require('../assets/blossom.png');
const IMG_BUFFALO = require('../assets/buffalo.png');
const IMG_CITRUS = require('../assets/citrus.png');
const IMG_COIN = require('../assets/coin_gate.png');
const IMG_FALCON = require('../assets/falcon_chapel.png');
const IMG_CASCADES = require('../assets/cascades_factory.png');
const IMG_SALAMANCA = require('../assets/salamanca.png');
const IMG_GAOL = require('../assets/gaol_ruins.png');

const { width: W, height: H } = Dimensions.get('window');

const IS_TINY = H < 700;
const IS_NARROW = W < 360;

const TABBAR_VISUAL_H = 78;

const STORAGE_KEYS = {
  INTRO: 'tickets_intro_seen_v1',
  TICKETS_BALANCE: 'tickets_balance_v1',
  UNLOCKED_MAP: 'tickets_unlocked_v1',
  STORIES_UNLOCKED: 'stories_unlocked_v1',
};

type ExchangeType = 'crossword_extra' | 'story';

type ExchangeItem = {
  key: string;
  type: ExchangeType;
  storyId?: string;
  crosswordKey?: string;
  title: string;
  subtitle: string;
  cost: number;
  image: any;
};

type MainTabParamList = {
  Stories: undefined;
  StoriesList: undefined;
  Crossword: { id?: string; openExtraKey?: string } | undefined;
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

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [tickets, setTickets] = useState<number>(0);
  const [unlockedMap, setUnlockedMap] = useState<Record<string, true>>({});
  const [storiesUnlocked, setStoriesUnlocked] = useState<Record<string, true>>({});
  const [introSeen, setIntroSeen] = useState<boolean>(false);

  const [confirmItem, setConfirmItem] = useState<ExchangeItem | null>(null);
  const [successItem, setSuccessItem] = useState<ExchangeItem | null>(null);

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(10)).current;

  const cardW = useMemo(() => {
    const side = IS_NARROW ? 16 : 12;
    return Math.min(W - side * 2, 460);
  }, []);

  const UI = useMemo(() => {
    const headerPad = IS_TINY ? 12 : 14;
    const listPad = IS_TINY ? 12 : 14;

    const titleSize = IS_TINY ? 18 : 20;
    const balanceSize = 16;

    const itemPad = 10;
    const thumb = IS_TINY ? 52 : 56;

    const itemTitle = IS_TINY ? 13 : 14;
    const subSize = IS_TINY ? 10.8 : 11;
    const subLine = IS_TINY ? 14.5 : 15;

    const btnH = 32;
    const btnPadX = 12;
    const btnRadius = 12;
    const btnText = 11;

    const pillH = 24;
    const pillText = 11;

    return {
      headerPad,
      listPad,
      titleSize,
      balanceSize,
      itemPad,
      thumb,
      itemTitle,
      subSize,
      subLine,
      btnH,
      btnPadX,
      btnRadius,
      btnText,
      pillH,
      pillText,
    };
  }, []);

  const items: ExchangeItem[] = useMemo(
    () => [
      {
        key: 'story_8',
        type: 'story',
        storyId: '8',
        title: 'Cascades Female Factory',
        subtitle: 'Unlock this story using tickets. After unlocking, it will be available in Stories.',
        cost: 10,
        image: IMG_CASCADES,
      },
      {
        key: 'story_9',
        type: 'story',
        storyId: '9',
        title: 'Salamanca Warehouses',
        subtitle: 'Unlock this story using tickets. After unlocking, it will be available in Stories.',
        cost: 10,
        image: IMG_SALAMANCA,
      },
      {
        key: 'story_10',
        type: 'story',
        storyId: '10',
        title: 'Hobart Gaol Ruins',
        subtitle: 'Unlock this story using tickets. After unlocking, it will be available in Stories.',
        cost: 10,
        image: IMG_GAOL,
      },

      {
        key: 'xw_extra_1',
        type: 'crossword_extra',
        crosswordKey: 'extra_1',
        title: 'Blossom Shrine — Extra',
        subtitle: 'Unlock this extra crossword using tickets. After unlocking, it will be available in Crossword.',
        cost: 5,
        image: IMG_BLOSSOM,
      },
      {
        key: 'xw_extra_2',
        type: 'crossword_extra',
        crosswordKey: 'extra_2',
        title: 'Buffalo Ridge — Extra',
        subtitle: 'Unlock this extra crossword using tickets. After unlocking, it will be available in Crossword.',
        cost: 5,
        image: IMG_BUFFALO,
      },
      {
        key: 'xw_extra_3',
        type: 'crossword_extra',
        crosswordKey: 'extra_3',
        title: 'Citrus Vault — Extra',
        subtitle: 'Unlock this extra crossword using tickets. After unlocking, it will be available in Crossword.',
        cost: 5,
        image: IMG_CITRUS,
      },
      {
        key: 'xw_extra_4',
        type: 'crossword_extra',
        crosswordKey: 'extra_4',
        title: "Emperor’s Coin Gate — Extra",
        subtitle: 'Unlock this extra crossword using tickets. After unlocking, it will be available in Crossword.',
        cost: 5,
        image: IMG_COIN,
      },
      {
        key: 'xw_extra_5',
        type: 'crossword_extra',
        crosswordKey: 'extra_5',
        title: 'Falcon Sun Chapel — Extra',
        subtitle: 'Unlock this extra crossword using tickets. After unlocking, it will be available in Crossword.',
        cost: 5,
        image: IMG_FALCON,
      },
    ],
    []
  );

  const loadPersisted = useCallback(async () => {
    try {
      const [introRaw, balanceRaw, unlockedRaw, storiesRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INTRO),
        AsyncStorage.getItem(STORAGE_KEYS.TICKETS_BALANCE),
        AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_MAP),
        AsyncStorage.getItem(STORAGE_KEYS.STORIES_UNLOCKED),
      ]);

      setIntroSeen(introRaw === '1');

      const b = balanceRaw ? Number(balanceRaw) : 0;
      setTickets(Number.isFinite(b) ? b : 0);

      if (unlockedRaw) {
        const parsed = JSON.parse(unlockedRaw) as Record<string, true>;
        setUnlockedMap(parsed && typeof parsed === 'object' ? parsed : {});
      } else {
        setUnlockedMap({});
      }

      if (storiesRaw) {
        const parsed = JSON.parse(storiesRaw) as Record<string, true>;
        setStoriesUnlocked(parsed && typeof parsed === 'object' ? parsed : {});
      } else {
        setStoriesUnlocked({});
      }
    } catch {}
  }, []);

  const persistIntro = useCallback(async (v: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INTRO, v ? '1' : '0');
    } catch {}
  }, []);

  const persistBalance = useCallback(async (v: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TICKETS_BALANCE, String(Math.max(0, Math.floor(v))));
    } catch {}
  }, []);

  const persistUnlockedMap = useCallback(async (v: Record<string, true>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED_MAP, JSON.stringify(v));
    } catch {}
  }, []);

  const persistStoriesUnlocked = useCallback(async (v: Record<string, true>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.STORIES_UNLOCKED, JSON.stringify(v));
    } catch {}
  }, []);

  useEffect(() => {
    loadPersisted();

    fade.setValue(0);
    slide.setValue(10);
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [loadPersisted, fade, slide]);

  useFocusEffect(
    useCallback(() => {
      loadPersisted();
    }, [loadPersisted])
  );

  const onGotIt = useCallback(async () => {
    setIntroSeen(true);
    await persistIntro(true);
  }, [persistIntro]);

  const isItemUnlocked = useCallback(
    (it: ExchangeItem) => {
      if (it.type === 'crossword_extra') return !!unlockedMap[it.key];
      if (it.type === 'story' && it.storyId) return !!storiesUnlocked[it.storyId];
      return false;
    },
    [unlockedMap, storiesUnlocked]
  );

  const openUnlockedItem = useCallback(
    (it: ExchangeItem) => {
      if (!isItemUnlocked(it)) return;

      if (it.type === 'story' && it.storyId) {
        nav.navigate('StoryOpened', { id: it.storyId });
        return;
      }

      if (it.type === 'crossword_extra' && it.crosswordKey) {
        nav.navigate('MainTabs', {
          screen: 'Crossword',
          params: { openExtraKey: it.crosswordKey },
        });
      }
    },
    [nav, isItemUnlocked]
  );

  const onPressExchange = useCallback(
    (it: ExchangeItem) => {
      const unlockedNow = isItemUnlocked(it);

      if (unlockedNow) {
        openUnlockedItem(it);
        return;
      }

      if (tickets < it.cost) return;
      setConfirmItem(it);
    },
    [tickets, isItemUnlocked, openUnlockedItem]
  );

  const onConfirm = useCallback(async () => {
    if (!confirmItem) return;

    const it = confirmItem;
    setConfirmItem(null);

    if (isItemUnlocked(it)) return;
    if (tickets < it.cost) return;

    const nextBalance = tickets - it.cost;

    let nextUnlockedMap: Record<string, true> = unlockedMap;
    let nextStories: Record<string, true> = storiesUnlocked;

    if (it.type === 'crossword_extra') {
      nextUnlockedMap = { ...unlockedMap, [it.key]: true as true };
      setUnlockedMap(nextUnlockedMap);
    }

    if (it.type === 'story' && it.storyId) {
      nextStories = { ...storiesUnlocked, [it.storyId]: true as true };
      setStoriesUnlocked(nextStories);
    }

    setTickets(nextBalance);

    await Promise.all([
      persistBalance(nextBalance),
      persistUnlockedMap(nextUnlockedMap),
      persistStoriesUnlocked(nextStories),
    ]);

    setSuccessItem(it);
  }, [
    confirmItem,
    tickets,
    unlockedMap,
    storiesUnlocked,
    isItemUnlocked,
    persistBalance,
    persistUnlockedMap,
    persistStoriesUnlocked,
  ]);

  const TOP_PAD = Math.max(insets.top, 10) + (IS_TINY ? 8 : 10) + 20;
  const BOTTOM_PAD = Math.max(insets.bottom, 0) + TABBAR_VISUAL_H + (IS_TINY ? 14 : 18) + 30;

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: TOP_PAD,
              paddingBottom: BOTTOM_PAD,
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.headerCard, { width: cardW, padding: UI.headerPad }]}>
              <Text style={[styles.headerTitle, { fontSize: UI.titleSize }]}>Tickets</Text>

              <View style={styles.balanceRow}>
                <View style={styles.ticketIcon}>
                  <Text style={styles.ticketIconText}>🎟</Text>
                </View>

                <Text style={[styles.balanceText, { fontSize: UI.balanceSize }]}>x {tickets}</Text>

                <View style={{ flex: 1 }} />

                <View style={styles.rulesPill}>
                  <Text style={styles.rulesText}>+5 per crossword</Text>
                </View>
              </View>
            </View>

            <View style={[styles.listWrap, { width: cardW, padding: UI.listPad }]}>
              {items.map((it) => {
                const unlockedNow = isItemUnlocked(it);
                const enough = tickets >= it.cost;
                const disabled = !unlockedNow && !enough;

                const buttonLabel = unlockedNow
                  ? it.type === 'story'
                    ? 'Open story'
                    : 'Open crossword'
                  : `Exchange for ${it.cost}`;

                return (
                  <View
                    key={it.key}
                    style={[
                      styles.itemCard,
                      { padding: UI.itemPad },
                      unlockedNow && styles.itemUnlocked,
                    ]}
                  >
                    <View style={[styles.thumbWrap, { width: UI.thumb, height: UI.thumb }]}>
                      <Image source={it.image} style={styles.thumb} resizeMode="cover" />

                      {!unlockedNow && (
                        <View style={styles.lockBadge}>
                          <Image source={LOCK} style={styles.lockIcon} resizeMode="contain" />
                        </View>
                      )}
                    </View>

                    <View style={{ flex: 1, paddingRight: IS_TINY ? 8 : 10 }}>
                      <Text style={[styles.itemTitle, { fontSize: UI.itemTitle }]} numberOfLines={1}>
                        {it.title}
                      </Text>

                      <Text
                        style={[styles.itemSub, { fontSize: UI.subSize, lineHeight: UI.subLine }]}
                        numberOfLines={2}
                      >
                        {it.subtitle}
                      </Text>

                      <View style={[styles.metaRow, { marginTop: IS_TINY ? 8 : 8 }]}>
                        <View style={[styles.costPill, { height: UI.pillH }]}>
                          <Text style={[styles.costText, { fontSize: UI.pillText }]}>
                            {it.cost} 🎟
                          </Text>
                        </View>
                      </View>
                    </View>

                    <Pressable
                      style={[
                        styles.exchangeBtn,
                        {
                          height: UI.btnH,
                          paddingHorizontal: UI.btnPadX,
                          borderRadius: UI.btnRadius,
                          minWidth: IS_TINY ? 108 : 120,
                        },
                        disabled && styles.exchangeBtnDisabled,
                        unlockedNow && styles.exchangeBtnDone,
                      ]}
                      onPress={() => onPressExchange(it)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.exchangeText,
                          { fontSize: UI.btnText },
                          disabled && styles.exchangeTextDisabled,
                        ]}
                        numberOfLines={1}
                      >
                        {buttonLabel}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {!introSeen && (
            <View style={styles.introOverlay} pointerEvents="auto">
              <View style={[styles.introCard, { width: Math.min(W - 34, 420) }]}>
                <View style={styles.introLeft}>
                  <Image source={GUIDE} style={styles.introGuide} resizeMode="contain" />
                </View>

                <View style={styles.introRight}>
                  <Text style={styles.introText}>
                    Use your tickets to unlock new stories and extra crosswords. After exchange, the
                    content becomes available immediately.
                  </Text>

                  <Pressable style={styles.introBtn} onPress={onGotIt}>
                    <Text style={styles.introBtnText}>Got It</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          )}

          <Modal visible={!!confirmItem} transparent animationType="fade" onRequestClose={() => setConfirmItem(null)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { width: Math.min(W - 34, 420) }]}>
                <Text style={styles.modalTitle}>Confirm exchange</Text>

                <Text style={styles.modalText}>
                  Are you sure you want to use your tickets to unlock this item?
                </Text>

                <View style={styles.modalBtns}>
                  <Pressable style={[styles.modalBtn, styles.modalBtnOk]} onPress={onConfirm}>
                    <Text style={styles.modalBtnOkText}>Confirm</Text>
                  </Pressable>

                  <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={() => setConfirmItem(null)}>
                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>

          <Modal visible={!!successItem} transparent animationType="fade" onRequestClose={() => setSuccessItem(null)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { width: Math.min(W - 34, 420) }]}>
                <Text style={styles.modalTitle}>Success</Text>

                <Text style={styles.modalText}>{successItem?.title} has been unlocked.</Text>

                <Pressable
                  style={[styles.modalBtn, styles.modalBtnOk, { alignSelf: 'center', marginTop: 12 }]}
                  onPress={() => setSuccessItem(null)}
                >
                  <Text style={styles.modalBtnOkText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07181A' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },

  headerCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(27, 93, 50, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: 12,
  },
  headerTitle: {
    color: 'rgba(255,255,255,0.98)',
    fontWeight: '900',
    marginBottom: 10,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center' },
  ticketIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketIconText: { fontSize: 16 },
  balanceText: { marginLeft: 8, color: '#fff', fontWeight: '900' },

  rulesPill: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rulesText: { color: 'rgba(255,255,255,0.92)', fontWeight: '800', fontSize: 12 },

  listWrap: {
    borderRadius: 22,
    backgroundColor: 'rgba(27, 93, 50, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },

  itemCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemUnlocked: { borderColor: 'rgba(160, 255, 190, 0.45)' },

  thumbWrap: { borderRadius: 16, overflow: 'hidden', marginRight: 10 },
  thumb: { width: '100%', height: '100%' },

  lockBadge: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { width: 18, height: 18 },

  itemTitle: { color: '#fff', fontWeight: '900' },
  itemSub: { marginTop: 2, color: 'rgba(255,255,255,0.78)' },

  metaRow: { flexDirection: 'row', alignItems: 'center' },

  costPill: {
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  costText: { color: 'rgba(255,255,255,0.92)', fontWeight: '900' },

  exchangeBtn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exchangeBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.35)' },
  exchangeBtnDone: { backgroundColor: 'rgba(72, 214, 117, 0.78)' },

  exchangeText: { color: '#0f1a12', fontWeight: '900' },
  exchangeTextDisabled: { color: 'rgba(15, 26, 18, 0.55)' },

  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  introCard: {
    borderRadius: 22,
    padding: IS_TINY ? 12 : 14,
    flexDirection: 'row',
    backgroundColor: 'rgba(27, 93, 50, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  introLeft: {
    width: IS_TINY ? 92 : 102,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 10,
  },
  introGuide: { width: '100%', height: IS_TINY ? 96 : 104 },
  introRight: { flex: 1, justifyContent: 'center' },
  introText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: IS_TINY ? 13 : 14,
    lineHeight: IS_TINY ? 18 : 20,
  },
  introBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introBtnText: { color: '#0f1a12', fontWeight: '900', fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    borderRadius: 22,
    padding: IS_TINY ? 12 : 14,
    backgroundColor: 'rgba(27, 93, 50, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  modalTitle: {
    color: '#fff',
    fontWeight: '900',
    fontSize: IS_TINY ? 18 : 20,
    textAlign: 'center',
  },
  modalText: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontSize: IS_TINY ? 13 : 14,
    lineHeight: IS_TINY ? 18 : 20,
  },
  modalBtns: { marginTop: 14, flexDirection: 'row', gap: 12, justifyContent: 'center' },
  modalBtn: {
    height: 40,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnOk: { backgroundColor: 'rgba(72, 214, 117, 0.85)' },
  modalBtnOkText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },
  modalBtnCancel: {
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  modalBtnCancelText: { color: 'rgba(255,255,255,0.95)', fontWeight: '900', fontSize: 13 },
});
