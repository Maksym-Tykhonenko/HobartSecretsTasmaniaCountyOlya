import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Loader'>;

const BG = require('../assets/background.png');
const LOGO = require('../assets/logo.png');

const LOADER_HTML = `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .loader {
        width: 100px;
        height: 100px;
        border: 8px solid #ffcc00;
        border-radius: 50%;
        border-top-color: transparent;
        position: relative;
        animation: loaderAnimation 1.5s linear infinite;
        box-sizing: border-box;
      }

      .loader::before,
      .loader::after {
        content: '';
        position: absolute;
        height: 20px;
        width: 20px;
        left: 50%;
        top: 50%;
        background-color: #ffcc00;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }

      .loader::before {
        animation: loaderAnimationBefore 1s linear infinite;
      }

      .loader::after {
        animation: loaderAnimationAfter 1s linear infinite;
      }

      @keyframes loaderAnimation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes loaderAnimationBefore {
        0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      @keyframes loaderAnimationAfter {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="loader"></div>
    </div>
  </body>
</html>
`;

export default function LoaderScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 5000);

    return () => clearTimeout(t);
  }, [navigation]);

  const bottomOffset = Math.max(insets.bottom, 12) + 16;

  return (
    <ImageBackground source={BG} style={styles.bg} resizeMode="cover">
      <View style={styles.logoWrap}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </View>

      <View style={[styles.loaderWrap, { paddingBottom: bottomOffset }]}>
        <View style={styles.webBox}>
          <WebView
            originWhitelist={['*']}
            source={{ html: LOADER_HTML }}
            style={styles.web}
            containerStyle={styles.web}
            javaScriptEnabled
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bounces={false}
            overScrollMode="never"
            automaticallyAdjustContentInsets={false}
            setBuiltInZoomControls={false}
            backgroundColor="transparent"
            {...(Platform.OS === 'android'
              ? { androidLayerType: 'hardware' as const }
              : null)}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },

  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -40 }],
  },
  logo: {
    width: 220,
    height: 220,
  },

  loaderWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  webBox: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
  },
  web: {
    width: 140,
    height: 140,
    backgroundColor: 'transparent',
  },
});
