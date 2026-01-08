import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: W, height: H } = Dimensions.get('window');
const IS_SMALL = H < 740;
const IS_TINY = H < 680;

const BG = require('../assets/background1.png');
const ON1 = require('../assets/onboard1.png');
const ON2 = require('../assets/onboard2.png');
const ON3 = require('../assets/onboard3.png');
const ON4 = require('../assets/onboard4.png');

type Slide = {
  key: string;
  title: string;
  subtitle: string;
  image: any;
};

export default function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(0)).current;

  const slides: Slide[] = useMemo(
    () => [
      {
        key: '1',
        title: 'Discover Hobart',
        subtitle:
          "Real places, small stories, and\nlegends linked to the city’s history.\nFind locations on the map and see\nwhat they hide.",
        image: ON1,
      },
      {
        key: '2',
        title: 'Read the Stories',
        subtitle:
          'Each location includes a short note\nand a local legend.\nOpen the card to learn what\nhappened there.',
        image: ON2,
      },
      {
        key: '3',
        title: 'Solve The Crossword',
        subtitle:
          'Every story has a connected\ncrossword.\nSolve it to earn tickets toward\nunlocking more places.',
        image: ON3,
      },
      {
        key: '4',
        title: 'Unlock New Secrets',
        subtitle:
          'Tickets open hidden locations and\nextra puzzles.\nExplore the city step by step.',
        image: ON4,
      },
    ],
    []
  );

  const isLast = index === slides.length - 1;
  const buttonLabel = isLast ? 'Begin' : 'Next';
  const bottomGap = Math.max(insets.bottom, 0) + 40;
  const titleSize = IS_TINY ? 22 : IS_SMALL ? 24 : 26;
  const subSize = IS_TINY ? 14 : IS_SMALL ? 16 : 18;
  const subLine = IS_TINY ? 18 : 20;

  const imgHeight = Math.min(
    IS_TINY ? 300 : IS_SMALL ? 360 : 420,
    H * (IS_TINY ? 0.38 : 0.44)
  );

  const imageBottomPad = IS_TINY ? 92 : IS_SMALL ? 106 : 120;

  const runAppear = useCallback(() => {
    fade.setValue(0);
    rise.setValue(10);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, rise]);

  useEffect(() => {
    runAppear();
  }, [index, runAppear]);

  const goNext = useCallback(() => {
    if (!isLast) {
      const next = index + 1;
      listRef.current?.scrollToOffset({ offset: next * W, animated: true });
      setIndex(next);
    } else {
      navigation.replace('MainTabs');
    }
  }, [index, isLast, navigation]);

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        renderItem={({ item }) => {
          const isSmallerImage = item.key === '2' || item.key === '3';
          const slideImgHeight = isSmallerImage ? imgHeight * 0.78 : imgHeight;

          return (
            <View style={[styles.slide, { width: W }]}>
              <Animated.View
                style={[
                  styles.content,
                  {
                    opacity: fade,
                    transform: [{ translateY: rise }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.textBlock,
                    { paddingTop: Math.max(insets.top, 18) + (IS_TINY ? 44 : 56) },
                  ]}
                >
                  <Text style={[styles.title, { fontSize: titleSize }]}>{item.title}</Text>
                  <Text style={[styles.subtitle, { fontSize: subSize, lineHeight: subLine }]}>
                    {item.subtitle}
                  </Text>
                </View>

                <View style={[styles.imageBlock, { paddingBottom: imageBottomPad }]}>
                  <Image
                    source={item.image}
                    style={[styles.illustration, { height: slideImgHeight }]}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            </View>
          );
        }}
      />

      <View style={[styles.bottomArea, { paddingBottom: bottomGap }]}>
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.nextBtn, pressed && styles.nextBtnPressed]}
        >
          <View style={styles.nextInner}>
            <Text style={styles.nextText}>{buttonLabel}</Text>

            <View style={styles.divider} />

            <View style={styles.arrowBox}>
              <Text style={styles.arrow}>→</Text>
            </View>
          </View>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },

  slide: { flex: 1 },

  content: { flex: 1 },

  textBlock: {
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  imageBlock: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  illustration: {
    width: '100%',
  },

  bottomArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },

  nextBtn: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 2 },
    }),
  },
  nextBtnPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96,
  },
  nextInner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 34,
    paddingLeft: 16,
  },
  nextText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '600',
    paddingRight: 12,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  arrowBox: {
    width: 36,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: '#111',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -1,
  },
});
