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
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/background.png');
const GUIDE = require('../assets/guide3.png');
const LOCK = require('../assets/lock.png');
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

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;

type RouteParams = { id?: string } | undefined;

type CrosswordItem = {
  key: string;
  kind: 'main' | 'extra';
  storyId?: string;
  title: string;
  question: string;
  answer: string;
  image: any;
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const STORAGE_KEYS = {
  INTRO: 'crossword_intro_seen_v2',
  SOLVED: 'crossword_solved_v2',
  TICKETS_BALANCE: 'tickets_balance_v1',
  UNLOCKED_MAP: 'tickets_unlocked_v1',
};

const TICKETS_PER_CORRECT = 5;
const TABBAR_VISUAL_H = 78;

type ConfettiPiece = {
  id: string;
  x: number;
  w: number;
  h: number;
  drift: number;
  spinDeg: number;
  delay: number;
  color: string;
};

const CONFETTI_COUNT = 64;
const CONFETTI_COLORS = [
  'rgba(255,255,255,0.95)',
  'rgba(255,214,67,0.95)',
  'rgba(72,214,117,0.95)',
  'rgba(130,220,255,0.95)',
  'rgba(255,120,180,0.92)',
];

export default function CrosswordScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute() as { params?: RouteParams };
  const storyId = route?.params?.id ? String(route.params.id) : undefined;

  const items: CrosswordItem[] = useMemo(
    () => [
      {
        key: 'main_1',
        storyId: '1',
        kind: 'main',
        title: 'Blossom Shrine',
        question: 'Which flower was said to glow when answers carried great meaning?',
        answer: 'LOTUS',
        image: IMG_BLOSSOM,
      },
      {
        key: 'main_2',
        storyId: '2',
        kind: 'main',
        title: 'Buffalo Ridge Lookout',
        question: 'What did the three guardian buffalo spirits form together?',
        answer: 'HERD',
        image: IMG_BUFFALO,
      },
      {
        key: 'main_3',
        storyId: '3',
        kind: 'main',
        title: 'Citrus Vault',
        question: 'Which citrus scent lingers on the hill even in winter?',
        answer: 'LIMES',
        image: IMG_CITRUS,
      },
      {
        key: 'main_4',
        storyId: '4',
        kind: 'main',
        title: 'Emperor’s Coin Gate',
        question: 'What mysterious golden object did locals find near the crossroads?',
        answer: 'TOKEN',
        image: IMG_COIN,
      },
      {
        key: 'main_5',
        storyId: '5',
        kind: 'main',
        title: 'Falcon Sun Chapel',
        question: 'Which bird led the lost traveler to the hidden spring?',
        answer: 'FALCON',
        image: IMG_FALCON,
      },
      {
        key: 'main_6',
        storyId: '6',
        kind: 'main',
        title: 'Old Wharf Docks',
        question: 'What historic waterfront area once hosted whaling ships and traders?',
        answer: 'WHARF',
        image: IMG_WHARF,
      },
      {
        key: 'main_7',
        storyId: '7',
        kind: 'main',
        title: 'Battery Point Steps',
        question: 'What sandstone path leads into one of Hobart’s oldest districts?',
        answer: 'STEPS',
        image: IMG_STEPS,
      },
      {
        key: 'main_8',
        storyId: '8',
        kind: 'main',
        title: 'Cascades Female Factory',
        question: 'Who were the primary prisoners held in this historic Tasmanian site?',
        answer: 'WOMEN',
        image: IMG_CASCADES,
      },
      {
        key: 'main_9',
        storyId: '9',
        kind: 'main',
        title: 'Salamanca Warehouses',
        question: 'What wooden containers stored goods in the old sandstone warehouses?',
        answer: 'CRATE',
        image: IMG_SALAMANCA,
      },
      {
        key: 'main_10',
        storyId: '10',
        kind: 'main',
        title: 'Hobart Gaol Ruins',
        question: 'What remains of the early 1821 prison still stand today?',
        answer: 'WALLS',
        image: IMG_GAOL,
      },
      {
        key: 'extra_1',
        kind: 'extra',
        title: 'Blossom Shrine — Extra',
        question: 'What was Saya believed to be, able to read hidden truths from flowers?',
        answer: 'ORACLE',
        image: IMG_BLOSSOM,
      },
      {
        key: 'extra_2',
        kind: 'extra',
        title: 'Buffalo Ridge — Extra',
        question: 'What supernatural beings were said to guard the underground spring?',
        answer: 'SPIRIT',
        image: IMG_BUFFALO,
      },
      {
        key: 'extra_3',
        kind: 'extra',
        title: 'Citrus Vault — Extra',
        question: 'What secret creation did the Green Maker produce for sailors?',
        answer: 'BREW',
        image: IMG_CITRUS,
      },
      {
        key: 'extra_4',
        kind: 'extra',
        title: 'Emperor’s Coin Gate — Extra',
        question: 'Which mythical guardian was believed to leave golden signs at night?',
        answer: 'DRAGON',
        image: IMG_COIN,
      },
      {
        key: 'extra_5',
        kind: 'extra',
        title: 'Falcon Sun Chapel — Extra',
        question: 'What did the traveler discover after following the falcon’s flight?',
        answer: 'SOURCE',
        image: IMG_FALCON,
      },
    ],
    []
  );

  const mainItems = useMemo(() => items.filter((i) => i.kind === 'main'), [items]);
  const extraItems = useMemo(() => items.filter((i) => i.kind === 'extra'), [items]);

  const [introSeen, setIntroSeen] = useState(false);
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [unlockedMap, setUnlockedMap] = useState<Record<string, true>>({});

  const [mode, setMode] = useState<'list' | 'play'>('list');
  const [active, setActive] = useState<CrosswordItem | null>(null);
  const [typed, setTyped] = useState('');
  const [flash, setFlash] = useState<'idle' | 'good' | 'bad'>('idle');
  const [showWin, setShowWin] = useState(false);

  const isMountedRef = useRef(true);
  const lastAutoOpenedStoryIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const listFade = useRef(new Animated.Value(0)).current;
  const listSlide = useRef(new Animated.Value(12)).current;

  const playFade = useRef(new Animated.Value(0)).current;
  const playSlide = useRef(new Animated.Value(12)).current;
  const playScale = useRef(new Animated.Value(0.985)).current;

  const shake = useRef(new Animated.Value(0)).current;

  const winFade = useRef(new Animated.Value(0)).current;
  const winScale = useRef(new Animated.Value(0.985)).current;

  const confettiOpacity = useRef(new Animated.Value(0)).current;
  const confettiProgress = useRef(new Animated.Value(0)).current;

  const safeTop = Math.max(insets.top, 10);
  const safeBottom = Math.max(insets.bottom, 0);

  const EXTRA_STATUSBAR = 20;
  const EXTRA_SCROLL = 30;

  const topPad = safeTop + EXTRA_STATUSBAR + (IS_TINY ? 10 : 14);
  const bottomPad = safeBottom + TABBAR_VISUAL_H + (IS_TINY ? 14 : 18) + EXTRA_SCROLL;

  const maxCardW = 460;
  const sidePad = IS_TINY ? 12 : 16;
  const cardW = Math.min(W - sidePad * 2, maxCardW);

  const availableH = H - topPad - bottomPad;
  const cardMaxH = Math.max(360, Math.min(availableH, H * 0.84));

  const shakeX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  const playListIn = useCallback(() => {
    listFade.setValue(0);
    listSlide.setValue(12);
    Animated.parallel([
      Animated.timing(listFade, { toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(listSlide, { toValue: 0, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [listFade, listSlide]);

  const playPuzzleIn = useCallback(() => {
    playFade.setValue(0);
    playSlide.setValue(12);
    playScale.setValue(0.985);
    Animated.parallel([
      Animated.timing(playFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(playSlide, { toValue: 0, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(playScale, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [playFade, playSlide, playScale]);

  const doShake = useCallback(() => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shake]);

  const showWinModal = useCallback(() => {
    setShowWin(true);
    winFade.setValue(0);
    winScale.setValue(0.985);
    Animated.parallel([
      Animated.timing(winFade, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(winScale, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [winFade, winScale]);

  const hideWinModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(winFade, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(winScale, { toValue: 0.985, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => {
      requestAnimationFrame(() => {
        if (isMountedRef.current) setShowWin(false);
      });
    });
  }, [winFade, winScale]);

  const confettiPieces: ConfettiPiece[] = useMemo(() => {
    return Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const t = i / Math.max(1, CONFETTI_COUNT - 1);
      const x = Math.round(10 + (W - 20) * t);
      const w = 4 + (i % 4);
      const h = 7 + (i % 5);
      const drift = ((i % 7) - 3) * 18;
      const spinDeg = (i % 2 === 0 ? 1 : -1) * (140 + (i % 6) * 30);
      const delay = (i % 10) * 14;
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      return { id: `cf_${i}`, x, w, h, drift, spinDeg, delay, color };
    });
  }, []);

  const fireConfetti = useCallback(() => {
    confettiOpacity.stopAnimation();
    confettiProgress.stopAnimation();

    confettiOpacity.setValue(0);
    confettiProgress.setValue(0);

    Animated.sequence([
      Animated.timing(confettiOpacity, { toValue: 1, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(confettiProgress, { toValue: 1, duration: 1150, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(confettiOpacity, { toValue: 0, duration: 260, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [confettiOpacity, confettiProgress]);

  const addTickets = useCallback(async (delta: number) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TICKETS_BALANCE);
      const prev = raw ? Number(raw) : 0;
      const safePrev = Number.isFinite(prev) ? prev : 0;
      const next = Math.max(0, Math.floor(safePrev + delta));
      await AsyncStorage.setItem(STORAGE_KEYS.TICKETS_BALANCE, String(next));
    } catch {}
  }, []);

  const loadPersisted = useCallback(async () => {
    try {
      const [introRaw, solvedRaw, unlockedRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.INTRO),
        AsyncStorage.getItem(STORAGE_KEYS.SOLVED),
        AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED_MAP),
      ]);

      setIntroSeen(introRaw === '1');

      if (solvedRaw) {
        const parsed = JSON.parse(solvedRaw) as Record<string, true>;
        if (parsed && typeof parsed === 'object') setSolved(parsed);
        else setSolved({});
      } else {
        setSolved({});
      }

      if (unlockedRaw) {
        const parsedUnlock = JSON.parse(unlockedRaw) as Record<string, true>;
        if (parsedUnlock && typeof parsedUnlock === 'object') setUnlockedMap(parsedUnlock);
        else setUnlockedMap({});
      } else {
        setUnlockedMap({});
      }
    } catch {}
  }, []);

  const persistIntro = useCallback(async (v: boolean) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INTRO, v ? '1' : '0');
    } catch {}
  }, []);

  const persistSolved = useCallback(async (v: Record<string, true>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SOLVED, JSON.stringify(v));
    } catch {}
  }, []);

  useEffect(() => {
    loadPersisted();
    playListIn();
  }, [loadPersisted, playListIn]);

  const openPuzzle = useCallback(
    (it: CrosswordItem) => {
      setActive(it);
      setTyped('');
      setFlash('idle');
      setShowWin(false);
      setMode('play');
      playPuzzleIn();
    },
    [playPuzzleIn]
  );

  useFocusEffect(
    useCallback(() => {
      loadPersisted();

      setMode('list');
      setActive(null);
      setTyped('');
      setFlash('idle');
      setShowWin(false);
      playListIn();

      if (!storyId) return;

      if (lastAutoOpenedStoryIdRef.current === storyId) return;
      lastAutoOpenedStoryIdRef.current = storyId;

      const found = mainItems.find((m) => m.storyId === storyId);
      if (found) {
        const t = setTimeout(() => {
          if (isMountedRef.current) openPuzzle(found);
        }, 60);
        return () => clearTimeout(t);
      }
    }, [loadPersisted, playListIn, storyId, mainItems, openPuzzle])
  );

  const onGotIt = useCallback(async () => {
    setIntroSeen(true);
    await persistIntro(true);
  }, [persistIntro]);

  const isExtraUnlockedByTickets = useCallback(
    (extraKey: string) => {
      const storageKey = `xw_${extraKey}`;
      return !!unlockedMap[storageKey];
    },
    [unlockedMap]
  );

  const backToList = useCallback(() => {
    setMode('list');
    setActive(null);
    setTyped('');
    setFlash('idle');
    setShowWin(false);
    playListIn();
  }, [playListIn]);

  const onPressLetter = useCallback(
    async (ch: string) => {
      if (!active) return;
      if (showWin) return;
      if (typed.length >= active.answer.length) return;

      const next = (typed + ch).toUpperCase();
      setTyped(next);

      if (next.length === active.answer.length) {
        const ok = next === active.answer;

        if (ok) {
          setFlash('good');
          fireConfetti();

          const nextSolved: Record<string, true> = { ...solved, [active.key]: true as true };
          setSolved(nextSolved);
          await persistSolved(nextSolved);

          await addTickets(TICKETS_PER_CORRECT);

          setTimeout(() => {
            if (isMountedRef.current) showWinModal();
          }, 260);
        } else {
          setFlash('bad');
          doShake();
          setTimeout(() => {
            if (!isMountedRef.current) return;
            setFlash('idle');
            setTyped('');
          }, 520);
        }
      }
    },
    [active, showWin, typed, solved, persistSolved, addTickets, showWinModal, doShake, fireConfetti]
  );

  const onBackspace = useCallback(() => {
    if (!active) return;
    if (showWin) return;
    if (typed.length === 0) return;
    setFlash('idle');
    setTyped((prev) => prev.slice(0, -1));
  }, [active, showWin, typed.length]);

  const nextPuzzle = useCallback(() => {
    if (!active) return;

    const pool = active.kind === 'main' ? mainItems : extraItems;
    const idx = pool.findIndex((p) => p.key === active.key);
    const nxt = pool[idx + 1] || pool[0];

    hideWinModal();
    setTimeout(() => {
      if (isMountedRef.current) openPuzzle(nxt);
    }, 90);
  }, [active, mainItems, extraItems, hideWinModal, openPuzzle]);

  const keyboardCols = 7;
  const keyGap = IS_TINY ? 6 : 8;
  const panelPad = IS_TINY ? 10 : 14;

  const keySize = Math.floor((cardW - panelPad * 2 - (keyboardCols - 1) * keyGap) / keyboardCols);
  const keyH = Math.max(IS_TINY ? 32 : 34, Math.min(IS_TINY ? 42 : 46, keySize));

  const slotsCount = active?.answer.length ?? 0;

  const slotBg =
    flash === 'good'
      ? 'rgba(72, 214, 117, 0.68)'
      : flash === 'bad'
      ? 'rgba(225, 83, 83, 0.85)'
      : 'rgba(255,255,255,0.14)';

  const confettiY = confettiProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, H * 0.78],
  });

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        {mode === 'list' && (
          <Animated.View style={{ flex: 1, opacity: listFade, transform: [{ translateY: listSlide }] }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: topPad,
                paddingBottom: bottomPad,
                paddingHorizontal: sidePad,
                alignItems: 'center',
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={[styles.listCard, { width: cardW }]}>
                <Text style={styles.listTitle}>Crossword</Text>

                {mainItems.map((it) => {
                  const isSolved = !!solved[it.key];
                  return (
                    <Pressable key={it.key} style={[styles.row, isSolved && styles.rowSolved]} onPress={() => openPuzzle(it)}>
                      <Image source={it.image} style={styles.rowImg} resizeMode="cover" />

                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {it.title}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {isSolved ? 'Solved' : 'Ready'}
                        </Text>
                      </View>

                      <View style={styles.solveBtn}>
                        <Text style={styles.solveText}>{isSolved ? 'Open' : 'Solve'}</Text>
                      </View>
                    </Pressable>
                  );
                })}

                {extraItems.map((it) => {
                  const isSolved = !!solved[it.key];
                  const unlockedByTickets = isExtraUnlockedByTickets(it.key);
                  const locked = !unlockedByTickets && !isSolved;

                  return (
                    <Pressable
                      key={it.key}
                      style={[styles.row, locked && styles.rowLocked, isSolved && styles.rowSolved]}
                      onPress={() => {
                        if (!locked) openPuzzle(it);
                      }}
                    >
                      <Image source={it.image} style={[styles.rowImg, locked && { opacity: 0.65 }]} resizeMode="cover" />

                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {it.title}
                        </Text>
                        <Text style={styles.rowSub} numberOfLines={1}>
                          {isSolved ? 'Solved' : locked ? 'Locked (Tickets)' : 'Ready'}
                        </Text>
                      </View>

                      {locked ? (
                        <View style={styles.lockPill}>
                          <Image source={LOCK} style={styles.lockSmall} resizeMode="contain" />
                        </View>
                      ) : (
                        <View style={styles.solveBtn}>
                          <Text style={styles.solveText}>{isSolved ? 'Open' : 'Solve'}</Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {!introSeen && (
              <View style={styles.introOverlay} pointerEvents="auto">
                <View style={[styles.introCard, { width: Math.min(W - 34, 460) }]}>
                  <View style={styles.introLeft}>
                    <Image source={GUIDE} style={styles.introGuide} resizeMode="contain" />
                  </View>

                  <View style={styles.introRight}>
                    <Text style={styles.introText}>
                      Solve crosswords to earn tickets. Extra crosswords can be unlocked in Tickets.
                    </Text>

                    <Pressable style={styles.introBtn} onPress={onGotIt}>
                      <Text style={styles.introBtnText}>Got It</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {mode === 'play' && active && (
          <Animated.View style={{ flex: 1 }}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingTop: topPad,
                paddingBottom: bottomPad,
                paddingHorizontal: sidePad,
                alignItems: 'center',
                flexGrow: 1,
                justifyContent: 'flex-start',
              }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View
                style={[
                  styles.playCard,
                  {
                    width: cardW,
                    maxHeight: cardMaxH,
                    opacity: playFade,
                    transform: [{ translateY: playSlide }, { scale: playScale }, { translateX: shakeX }],
                    marginBottom: 14,
                  },
                ]}
              >
                <View style={styles.playTop}>
                  <Image
                    source={active.image}
                    style={[styles.topImg, { width: IS_TINY ? 86 : 110, height: IS_TINY ? 86 : 110 }]}
                    resizeMode="cover"
                  />
                  <Text style={styles.playTitle} numberOfLines={1}>
                    {active.title}
                  </Text>
                  <Text style={styles.playQ}>{active.question}</Text>
                </View>

                <View style={[styles.slotsRow, { marginTop: IS_TINY ? 10 : 12 }]}>
                  {Array.from({ length: slotsCount }).map((_, idx) => {
                    const ch = typed[idx] ?? '';
                    return (
                      <View key={`${active.key}_s_${idx}`} style={[styles.slot, { backgroundColor: slotBg }]}>
                        <Text style={styles.slotText}>{ch}</Text>
                      </View>
                    );
                  })}
                </View>

                <View style={[styles.kbWrap, { marginTop: IS_TINY ? 10 : 12, paddingHorizontal: panelPad }]}>
                  <View style={[styles.kbGrid, { columnGap: keyGap, rowGap: keyGap }]}>
                    {ALPHABET.map((letter) => (
                      <Pressable
                        key={letter}
                        style={[styles.keyBtn, { width: keySize, height: keyH }]}
                        onPress={() => onPressLetter(letter)}
                      >
                        <Text style={styles.keyText}>{letter}</Text>
                      </Pressable>
                    ))}

                    <Pressable
                      style={[styles.keyBtn, styles.keyBack, { width: keySize * 2 + keyGap, height: keyH }]}
                      onPress={onBackspace}
                    >
                      <Text style={styles.keyText}>⌫</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.bottomBarSingle, { marginTop: IS_TINY ? 10 : 12 }]}>
                  <Pressable style={styles.navBtn} onPress={backToList} hitSlop={8}>
                    <Text style={styles.navBtnText}>‹</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </ScrollView>
          </Animated.View>
        )}

        {showWin && active && (
          <View style={styles.winOverlay} pointerEvents="auto">
            <Animated.View style={[styles.winCard, { width: cardW, opacity: winFade, transform: [{ scale: winScale }] }]}>
              <Image source={GUIDE} style={styles.winGuide} resizeMode="contain" />

              <Text style={styles.winTitle}>Well done!</Text>
              <Text style={styles.winText}>
                You’ve received +{TICKETS_PER_CORRECT} tickets.{'\n'}Now you can unlock new content in Tickets.
              </Text>

              <View style={styles.winWordRow}>
                {active.answer.split('').map((ch, i) => (
                  <View key={`${active.key}_w_${i}`} style={styles.winWordCell}>
                    <Text style={styles.winWordText}>{ch}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.winBtns}>
                <Pressable style={styles.winBtnGhost} onPress={hideWinModal}>
                  <Text style={styles.winBtnGhostText}>Close</Text>
                </Pressable>

                <Pressable style={styles.winBtnMain} onPress={nextPuzzle}>
                  <Text style={styles.winBtnMainText}>Next</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        )}

        <Animated.View pointerEvents="none" style={[styles.confettiLayer, { opacity: confettiOpacity }]}>
          {confettiPieces.map((p) => {
            const driftX = confettiProgress.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
            const spin = confettiProgress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.spinDeg}deg`] });
            const y = Animated.add(confettiY, new Animated.Value(p.delay * 0.3));

            return (
              <Animated.View
                key={p.id}
                style={[
                  styles.confettiPiece,
                  {
                    left: p.x,
                    width: p.w,
                    height: p.h,
                    backgroundColor: p.color,
                    transform: [{ translateY: y }, { translateX: driftX }, { rotate: spin }],
                  },
                ]}
              />
            );
          })}
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07181A' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },

  confettiLayer: { ...StyleSheet.absoluteFillObject, zIndex: 9999, elevation: 9999 },
  confettiPiece: {
    position: 'absolute',
    top: 0,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    opacity: 0.95,
  },

  listCard: {
    borderRadius: 22,
    padding: IS_TINY ? 12 : 14,
    backgroundColor: 'rgba(27, 93, 50, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  listTitle: {
    color: 'rgba(255,255,255,0.98)',
    fontSize: IS_TINY ? 18 : 20,
    fontWeight: '900',
    marginBottom: 10,
  },

  row: {
    height: IS_TINY ? 54 : 58,
    borderRadius: 16,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rowLocked: { backgroundColor: 'rgba(120, 22, 22, 0.38)' },
  rowSolved: { borderColor: 'rgba(160, 255, 190, 0.47)' },

  rowImg: { width: 40, height: 40, borderRadius: 12, marginRight: 10 },
  rowTitle: { color: '#fff', fontWeight: '900', fontSize: IS_TINY ? 13 : 14 },
  rowSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 2 },

  solveBtn: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  solveText: { color: '#0f1a12', fontWeight: '900', fontSize: 12 },

  lockPill: {
    width: 40,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockSmall: { width: 16, height: 16 },

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
  introLeft: { width: IS_TINY ? 92 : 102, alignItems: 'center', justifyContent: 'center', paddingRight: 10 },
  introGuide: { width: '100%', height: IS_TINY ? 96 : 104 },
  introRight: { flex: 1, justifyContent: 'center' },
  introText: { color: 'rgba(255,255,255,0.95)', fontSize: IS_TINY ? 13 : 14, lineHeight: IS_TINY ? 18 : 20 },
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

  playCard: {
    borderRadius: 26,
    padding: IS_TINY ? 12 : 14,
    backgroundColor: 'rgba(27, 93, 50, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  playTop: { alignItems: 'center' },
  topImg: { borderRadius: 18, marginBottom: 10 },
  playTitle: { color: '#fff', fontWeight: '900', fontSize: IS_TINY ? 16 : 18 },
  playQ: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.92)',
    fontSize: IS_TINY ? 13 : 14,
    lineHeight: IS_TINY ? 18 : 20,
    textAlign: 'center',
  },

  slotsRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10 },
  slot: {
    width: IS_TINY ? 36 : 38,
    height: IS_TINY ? 36 : 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  kbWrap: {
    borderRadius: 18,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  kbGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  keyBtn: { borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.90)', alignItems: 'center', justifyContent: 'center' },
  keyBack: { backgroundColor: 'rgba(255,255,255,0.75)' },
  keyText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },

  bottomBarSingle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { color: 'rgba(255,255,255,0.95)', fontSize: 22, fontWeight: '900' },

  winOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    zIndex: 5000,
    elevation: 5000,
  },
  winCard: {
    borderRadius: 22,
    padding: IS_TINY ? 12 : 14,
    backgroundColor: 'rgba(27, 93, 50, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
  },
  winGuide: { width: IS_TINY ? 86 : 96, height: IS_TINY ? 86 : 96, marginBottom: 10 },
  winTitle: { color: '#fff', fontWeight: '900', fontSize: IS_TINY ? 18 : 20 },
  winText: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontSize: IS_TINY ? 13 : 14,
    lineHeight: IS_TINY ? 18 : 20,
  },
  winWordRow: { marginTop: 12, flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  winWordCell: {
    width: IS_TINY ? 34 : 36,
    height: IS_TINY ? 34 : 36,
    borderRadius: 10,
    backgroundColor: 'rgba(72, 214, 117, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winWordText: { color: '#0f1a12', fontWeight: '900', fontSize: 15 },
  winBtns: { marginTop: 14, flexDirection: 'row', gap: 12 },
  winBtnGhost: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winBtnGhostText: { color: 'rgba(255,255,255,0.95)', fontWeight: '900', fontSize: 13 },
  winBtnMain: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winBtnMainText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },
});
