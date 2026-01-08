import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
  Image,
  Dimensions,
  Animated,
  Easing,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = require('../assets/background.png');
const RESET_ICON = require('../assets/reset.png');

const { width: W, height: H } = Dimensions.get('window');
const IS_TINY = H < 700;
const IS_SMALL = H < 780;

const CARD_W = Math.min(W - 52, 520);

const SETTINGS_KEYS = {
  VIBRATION: 'settings_vibration_v1',
  NOTIFICATIONS: 'settings_notifications_v1',
};

const RESET_KEYS: string[] = [
  'tickets_intro_seen_v1',
  'tickets_balance_v1',
  'tickets_unlocked_v1',
  'stories_unlocked_v1',
  'crossword_progress_v1',
  'crossword_completed_v1',
  'places_favorites_v1',
  'app_onboarding_seen_v1',
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [vibrationOn, setVibrationOn] = useState(true);
  const [notificationsOn, setNotificationsOn] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const UI = useMemo(() => {
    const titleSize = IS_TINY ? 20 : 22;
    const rowText = IS_TINY ? 18 : 20;
    const pad = IS_TINY ? 18 : 20;
    const rowH = IS_TINY ? 58 : 64;

    const contentW = CARD_W;
    const radius = IS_TINY ? 24 : 26;

    return { titleSize, rowText, pad, rowH, contentW, radius };
  }, []);

  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(16)).current;
  const cardScale = useRef(new Animated.Value(0.98)).current;

  const r1 = useRef(new Animated.Value(0)).current;
  const r2 = useRef(new Animated.Value(0)).current;
  const r3 = useRef(new Animated.Value(0)).current;

  const playEnter = useCallback(() => {
    cardFade.setValue(0);
    cardSlide.setValue(16);
    cardScale.setValue(0.98);

    r1.setValue(0);
    r2.setValue(0);
    r3.setValue(0);

    Animated.parallel([
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardSlide, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(90, [
      Animated.timing(r1, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(r2, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(r3, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardFade, cardSlide, cardScale, r1, r2, r3]);

  const loadSettings = useCallback(async () => {
    try {
      const [vRaw, nRaw] = await Promise.all([
        AsyncStorage.getItem(SETTINGS_KEYS.VIBRATION),
        AsyncStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS),
      ]);

      setVibrationOn(vRaw === null ? true : vRaw === '1');
      setNotificationsOn(nRaw === null ? true : nRaw === '1');
    } catch {
    }
  }, []);

  useEffect(() => {
    loadSettings();
    playEnter();
  }, [loadSettings, playEnter]);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      playEnter();
    }, [loadSettings, playEnter])
  );

  const persistSetting = useCallback(async (key: string, v: boolean) => {
    try {
      await AsyncStorage.setItem(key, v ? '1' : '0');
    } catch {}
  }, []);

  const onToggleVibration = useCallback(
    async (v: boolean) => {
      setVibrationOn(v);
      await persistSetting(SETTINGS_KEYS.VIBRATION, v);
    },
    [persistSetting]
  );

  const onToggleNotifications = useCallback(
    async (v: boolean) => {
      setNotificationsOn(v);
      await persistSetting(SETTINGS_KEYS.NOTIFICATIONS, v);
    },
    [persistSetting]
  );

  const onResetPress = useCallback(() => setConfirmOpen(true), []);

  const onConfirmReset = useCallback(async () => {
    setConfirmOpen(false);
    try {
      await AsyncStorage.multiRemove(RESET_KEYS);
      setToast('Progress cleared');
      setTimeout(() => setToast(null), 1400);
    } catch {
      setToast('Error');
      setTimeout(() => setToast(null), 1400);
    }
  }, []);

  const TOP_PAD = Math.max(insets.top, 10) + (IS_TINY ? 14 : 18) + 50;
  const rowAnim = (v: Animated.Value, i: number) => ({
    opacity: v,
    transform: [
      {
        translateY: v.interpolate({
          inputRange: [0, 1],
          outputRange: [10 + i * 2, 0],
        }),
      },
    ],
  });

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
        <View style={styles.dim} />

        <View style={styles.center}>
          <View style={{ height: TOP_PAD }} />

          <Animated.View
            style={{
              opacity: cardFade,
              transform: [{ translateY: cardSlide }, { scale: cardScale }],
            }}
          >
            <View style={[styles.card, { width: UI.contentW, padding: UI.pad, borderRadius: UI.radius }]}>
              <Text style={[styles.title, { fontSize: UI.titleSize }]}>Settings</Text>
              <Animated.View style={rowAnim(r1, 0)}>
                <View style={[styles.row, { height: UI.rowH }]}>
                  <Text style={[styles.rowText, { fontSize: UI.rowText }]}>Vibration</Text>
                  <View style={styles.rightSlot}>
                    <Switch
                      value={vibrationOn}
                      onValueChange={onToggleVibration}
                      thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
                      trackColor={{
                        false: 'rgba(255,255,255,0.18)',
                        true: 'rgba(255,255,255,0.34)',
                      }}
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View style={[rowAnim(r2, 1), { marginTop: 12 }]}>
                <View style={[styles.row, { height: UI.rowH }]}>
                  <Text style={[styles.rowText, { fontSize: UI.rowText }]}>Notifications</Text>

                  <View style={styles.rightSlot}>
                    <Switch
                      value={notificationsOn}
                      onValueChange={onToggleNotifications}
                      thumbColor={Platform.OS === 'android' ? '#ffffff' : undefined}
                      trackColor={{
                        false: 'rgba(255,255,255,0.18)',
                        true: 'rgba(255,255,255,0.34)',
                      }}
                    />
                  </View>
                </View>
              </Animated.View>

              <Animated.View style={[rowAnim(r3, 2), { marginTop: 12 }]}>
                <Pressable
                  onPress={onResetPress}
                  style={({ pressed }) => [styles.row, { height: UI.rowH }, pressed && { opacity: 0.88 }]}
                >
                  <Text style={[styles.rowText, { fontSize: UI.rowText }]}>Reset Progress</Text>

                  <View style={styles.rightSlot}>
                    <View style={styles.resetIconWrap}>
                      <Image source={RESET_ICON} style={styles.resetIcon} resizeMode="contain" />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </View>

        <Modal
          visible={confirmOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={{
                transform: [
                  {
                    scale: confirmOpen
                      ? cardFade.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] })
                      : 1,
                  },
                ],
              }}
            >
              <View style={[styles.dialog, { width: Math.min(W - 48, 360) }]}>
                <Text style={styles.dialogText}>
                  Are you certain you want to reset?
                  {'\n'}This action will delete all progress.
                </Text>
              </View>

              <View style={styles.dialogBtns}>
                <Pressable style={[styles.dialogBtn, styles.btnConfirm]} onPress={onConfirmReset}>
                  <Text style={styles.btnConfirmText}>Confirm</Text>
                </Pressable>

                <Pressable style={[styles.dialogBtn, styles.btnCancel]} onPress={() => setConfirmOpen(false)}>
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {!!toast && (
          <View style={styles.toastWrap} pointerEvents="none">
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#07181A' },
  bg: { flex: 1 },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },

  center: {
    flex: 1,
    alignItems: 'center',
  },

  card: {
    backgroundColor: 'rgba(27, 93, 50, 0.74)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  title: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 14,
  },

  row: {
    borderRadius: 18,
    paddingHorizontal: IS_TINY ? 16 : 18,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: { color: '#fff', fontWeight: '900' },
  rightSlot: {
    marginLeft: 'auto',
    minWidth: 86,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  resetIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetIcon: { width: 28, height: 28 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  dialog: {
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(27, 93, 50, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  dialogText: {
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    fontSize: IS_TINY ? 13 : 14,
    lineHeight: IS_TINY ? 18 : 20,
    textAlign: 'center',
  },

  dialogBtns: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 18,
    justifyContent: 'center',
  },
  dialogBtn: {
    minWidth: 118,
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnConfirm: { backgroundColor: 'rgba(89, 255, 147, 0.90)' },
  btnConfirmText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },
  btnCancel: { backgroundColor: 'rgba(255, 96, 96, 0.88)' },
  btnCancelText: { color: '#0f1a12', fontWeight: '900', fontSize: 13 },

  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120,
    alignItems: 'center',
  },
  toast: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  toastText: { color: 'rgba(255,255,255,0.92)', fontWeight: '800' },
});
