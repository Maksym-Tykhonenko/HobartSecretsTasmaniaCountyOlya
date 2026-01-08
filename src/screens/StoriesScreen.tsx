import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Animated,
  Easing,
  Share,
  Platform,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, type NavigationProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GUIDE = require('../assets/guide5.png');
const LOCK = require('../assets/lock.png');
const PIN_GREEN = require('../assets/pin_green.png');
const PIN_RED = require('../assets/pin_red.png');
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
  Loader: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  StoryOpened: { id: string };
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

const { height: H, width: W } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_SMALL = H < 760;

const LOCKED_STORY_IDS = new Set(['8', '9', '10']);
const STORAGE_UNLOCKED_STORIES = 'stories_unlocked_v1';

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const tabNav = useNavigation<NavigationProp<any>>();
  const mapRef = useRef<MapView>(null);

  const basePins: StoryPin[] = useMemo(
    () => [
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
    ],
    []
  );

  const initialRegion: Region = useMemo(
    () => ({
      latitude: -42.8848,
      longitude: 147.3252,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    }),
    []
  );

  const [showIntro, setShowIntro] = useState(true);
  const [selected, setSelected] = useState<StoryPin | null>(null);
  const [region, setRegion] = useState<Region>(initialRegion);
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

  const pins: StoryPin[] = useMemo(() => {
    return basePins.map((p) => {
      const mustBuy = LOCKED_STORY_IDS.has(p.id);
      const isUnlocked = !!unlockedMap[p.id];
      const locked = mustBuy && !isUnlocked;
      return { ...p, locked };
    });
  }, [basePins, unlockedMap]);

  const introAnim = useRef(new Animated.Value(0)).current;
  const introScale = useRef(new Animated.Value(0.98)).current;

  const cardAnim = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.98)).current;

  const topPad = Math.max(insets.top, 12) + 10;
  const bottomSafe = Math.max(insets.bottom, 0);

  const playIntroIn = useCallback(() => {
    introAnim.setValue(0);
    introScale.setValue(0.98);
    Animated.parallel([
      Animated.timing(introAnim, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(introScale, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [introAnim, introScale]);

  useEffect(() => {
    playIntroIn();
  }, [playIntroIn]);

  const playCardIn = useCallback(() => {
    cardAnim.setValue(0);
    cardScale.setValue(0.98);
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, [cardAnim, cardScale]);

  useEffect(() => {
    if (selected) playCardIn();
  }, [selected, playCardIn]);

  const closeCard = useCallback(() => {
    Animated.parallel([
      Animated.timing(cardAnim, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(cardScale, { toValue: 0.98, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => setSelected(null));
  }, [cardAnim, cardScale]);

  const onShare = useCallback(async (pin: StoryPin) => {
    try {
      await Share.share({ message: `${pin.title}\n${pin.coordsText}` });
    } catch {}
  }, []);

  const onOpen = useCallback(
    (pin: StoryPin) => {
      if (pin.locked) return;
      const parent = tabNav.getParent?.();
      const rootNav = parent as unknown as NavigationProp<RootStackParamList>;
      if (rootNav?.navigate) rootNav.navigate('StoryOpened', { id: pin.id });
    },
    [tabNav]
  );

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const zoomBy = useCallback(
    (mult: number) => {
      const next: Region = {
        ...region,
        latitudeDelta: clamp(region.latitudeDelta * mult, 0.01, 1.2),
        longitudeDelta: clamp(region.longitudeDelta * mult, 0.01, 1.2),
      };
      setRegion(next);
      mapRef.current?.animateToRegion(next, 220);
    },
    [region]
  );

  const centerMap = useCallback(() => {
    const target: Region = selected
      ? {
          latitude: selected.lat,
          longitude: selected.lng,
          latitudeDelta: clamp(region.latitudeDelta, 0.01, 1.2),
          longitudeDelta: clamp(region.longitudeDelta, 0.01, 1.2),
        }
      : initialRegion;

    setRegion(target);
    mapRef.current?.animateToRegion(target, 260);
  }, [selected, region.latitudeDelta, region.longitudeDelta, initialRegion]);

  const introTop = topPad + (IS_TINY ? 70 : 90);
  const cardTranslateY = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        customMapStyle={DARK_MAP}
        onPress={() => {
          if (selected) closeCard();
        }}
        onRegionChangeComplete={(r: Region) => setRegion(r)}
      >
        {pins.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            onPress={() => {
              setSelected(p);
              mapRef.current?.animateToRegion(
                {
                  latitude: p.lat,
                  longitude: p.lng,
                  latitudeDelta: clamp(region.latitudeDelta, 0.01, 1.2),
                  longitudeDelta: clamp(region.longitudeDelta, 0.01, 1.2),
                },
                220
              );
            }}
            image={p.locked ? (PIN_RED as any) : (PIN_GREEN as any)}
          />
        ))}
      </MapView>

      {showIntro && (
        <View style={styles.introOverlay} pointerEvents="auto">
          <Animated.View
            style={[
              styles.introCard,
              {
                top: introTop,
                opacity: introAnim,
                transform: [{ scale: introScale }],
              },
            ]}
          >
            <View style={styles.introAvatarSlot}>
              <Image source={GUIDE} style={styles.introAvatar} resizeMode="contain" />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Explore the city</Text>
              <Text style={styles.introText}>
                Tap pins to open location cards. Some stories require tickets and will unlock after purchase.
              </Text>

              <Pressable style={styles.introBtn} onPress={() => setShowIntro(false)}>
                <Text style={styles.introBtnText}>Got It</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}

      {!showIntro && selected && (
        <Animated.View
          style={[
            styles.topCard,
            selected.locked ? styles.topCardLocked : styles.topCardGreen,
            {
              top: topPad + 40,
              opacity: cardAnim,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}
        >
          <View style={styles.pinTopRow}>
            <View style={styles.locationImageWrap}>
              <Image source={selected.image} style={styles.locationImage} resizeMode="cover" />
              {selected.locked && (
                <View style={styles.lockBadgeSmall}>
                  <Image source={LOCK} style={styles.lockIconSmall} resizeMode="contain" />
                </View>
              )}
            </View>

            <View style={styles.pinTextBlock}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {selected.title}
              </Text>
              <Text style={styles.cardSub} numberOfLines={1}>
                {selected.coordsText}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  style={[styles.openBtn, selected.locked && styles.openBtnDisabled]}
                  onPress={() => onOpen(selected)}
                  disabled={!!selected.locked}
                >
                  <Text style={[styles.openBtnText, selected.locked && styles.openBtnTextDisabled]}>Open</Text>
                </Pressable>

                <Pressable
                  style={[styles.shareIconBtn, selected.locked && styles.shareIconBtnDisabled]}
                  onPress={() => onShare(selected)}
                  disabled={!!selected.locked}
                  hitSlop={10}
                >
                  <Image source={SHARE_ICON} style={styles.shareIcon} resizeMode="contain" />
                </Pressable>
              </View>
            </View>
          </View>

          {selected.locked && <Text style={styles.lockHint}>Locked. Unlock it in Tickets.</Text>}
        </Animated.View>
      )}

      {!showIntro && (
        <View style={[styles.mapControls, { bottom: bottomSafe + 84 }]}>
          <Pressable style={styles.ctrlBtn} onPress={() => zoomBy(0.78)}>
            <Text style={styles.ctrlText}>＋</Text>
          </Pressable>

          <Pressable style={styles.ctrlBtn} onPress={() => zoomBy(1.28)}>
            <Text style={styles.ctrlText}>－</Text>
          </Pressable>

          <Pressable style={styles.ctrlBtn} onPress={centerMap}>
            <Text style={styles.ctrlText}>◎</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const CARD_SIDE = 18;
const INTRO_RADIUS = 22;

const styles = StyleSheet.create({
  root: { flex: 1 },

  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'flex-start',
  },

  introCard: {
    position: 'absolute',
    left: CARD_SIDE,
    right: CARD_SIDE,
    borderRadius: INTRO_RADIUS,
    padding: IS_TINY ? 14 : 16,
    flexDirection: 'row',
    backgroundColor: 'rgba(27, 93, 50, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  introAvatarSlot: {
    width: IS_TINY ? 92 : 102,
    height: IS_TINY ? 92 : 102,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'visible',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
  },
  introAvatar: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.08 }],
  },

  introContent: { flex: 1, justifyContent: 'center' },
  introTitle: {
    color: 'rgba(255,255,255,0.98)',
    fontSize: IS_TINY ? 18 : 20,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  introText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: IS_TINY ? 14 : 15,
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

  topCard: {
    position: 'absolute',
    left: CARD_SIDE,
    right: CARD_SIDE,
    borderRadius: 18,
    padding: IS_SMALL ? 11 : 12,
    borderWidth: 1,
  },
  topCardGreen: {
    backgroundColor: 'rgba(27, 93, 50, 0.92)',
    borderColor: 'rgba(255,255,255,0.10)',
  },
  topCardLocked: {
    backgroundColor: 'rgba(120, 22, 22, 0.92)',
    borderColor: 'rgba(255,255,255,0.10)',
  },

  pinTopRow: { flexDirection: 'row', alignItems: 'center' },

  locationImageWrap: {
    width: IS_TINY ? 56 : 60,
    height: IS_TINY ? 56 : 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.20)',
    marginRight: 12,
    flexShrink: 0,
  },
  locationImage: { width: '100%', height: '100%' },

  lockBadgeSmall: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconSmall: { width: 12, height: 12 },

  pinTextBlock: { flex: 1, minWidth: 0 },

  cardTitle: { color: '#fff', fontSize: IS_TINY ? 14 : 15, fontWeight: '900' },
  cardSub: { color: 'rgba(255,255,255,0.90)', fontSize: 12, marginTop: 2 },

  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  openBtn: {
    height: 34,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 120,
    maxWidth: Math.min(240, W - 180),
  },
  openBtnText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },
  openBtnDisabled: { opacity: 0.55 },
  openBtnTextDisabled: { color: 'rgba(15,26,18,0.75)' },

  shareIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shareIconBtnDisabled: { opacity: 0.55 },
  shareIcon: { width: 18, height: 18 },

  lockHint: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    lineHeight: 16,
  },

  mapControls: {
    position: 'absolute',
    right: 14,
    gap: 10,
  },
  ctrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlText: { color: 'rgba(255,255,255,0.95)', fontSize: 18, fontWeight: '900' },
});

const DARK_MAP = [
  { elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#9fb4c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1e2a3a' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a3a52' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7f97ad' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#203347' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2b3b53' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a2332' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#b7cbe0' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1622' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6f889f' }] },
];
