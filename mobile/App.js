import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator, Animated } from 'react-native';
import { Ghost, Crosshair } from 'lucide-react-native';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { useFonts, PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import * as SplashScreen from 'expo-splash-screen';
import { retroStyles } from './styles';
import { CRTOverlay } from './components/CRTOverlay';
import { CharacterSelect } from './components/CharacterSelect';
import { ShooterEngine } from './components/ShooterEngine';
import { GameMap } from './components/GameMap';
import { ExorcismModal } from './components/ExorcismModal';
import { ExorcismResult } from './components/ExorcismResult';
import { fetchWalletAssets } from './utils/solana';

SplashScreen.preventAutoHideAsync();

const APP_STATE = {
  HOME: 'HOME',
  CHARACTER_SELECT: 'CHARACTER_SELECT',
  GAMEPLAY: 'GAMEPLAY',
  RESULT: 'RESULT',
};

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [assets, setAssets] = useState([]);
  const [appState, setAppState] = useState(APP_STATE.HOME);
  const [character, setCharacter] = useState(null);
  const [activeMap, setActiveMap] = useState(null);
  const [selectedEnemy, setSelectedEnemy] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [gameScore, setGameScore] = useState(0);

  const [fontsLoaded] = useFonts({
    'PressStart2P': PressStart2P_400Regular,
  });

  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();

      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver: true }),
          Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [fontsLoaded]);

  const connectWallet = useCallback(async () => {
    try {
      const result = await transact(async (wallet) => {
        const authorizeResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Dust Demons',
            uri: 'https://dustdemons.xyz',
            icon: 'favicon.ico',
          },
        });
        return authorizeResult;
      });
      setWallet(result);
    } catch (e) {
      console.error('Connection failed', e);
    }
  }, []);

  const startMissionFlow = async () => {
    if (!wallet) return;
    setLoadingAssets(true);
    const fetchedAssets = await fetchWalletAssets(wallet.accounts[0].address);
    setAssets(fetchedAssets);
    setLoadingAssets(false);
    setAppState(APP_STATE.CHARACTER_SELECT);
  };

  if (!fontsLoaded) {
    return (
      <View style={[retroStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator color="#5b21b6" size="large" />
      </View>
    );
  }

  const renderContent = () => {
    // LOADING STATE GUARD
    if (loadingAssets) {
      return (
        <View style={[retroStyles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator color="#5b21b6" size="large" />
          <Text style={[retroStyles.pixelText, { marginTop: 20 }]}>SCANNING MONOLITH...</Text>
        </View>
      );
    }

    switch (appState) {
      case APP_STATE.CHARACTER_SELECT:
        if (!wallet) {
          setAppState(APP_STATE.HOME);
          return null;
        }
        return (
          <CharacterSelect onSelect={(char, map) => {
            setCharacter(char);
            setActiveMap(map);
            setAppState(APP_STATE.GAMEPLAY);
          }} />
        );

      case APP_STATE.GAMEPLAY:
        // DEFENSIVE GUARDS: Ensure we have necessary data before rendering engine
        if (!wallet || !character || !activeMap) {
          setAppState(APP_STATE.HOME);
          return null;
        }
        return (
          <GameMap mapId={activeMap.id}>
            <ShooterEngine
              character={character}
              assets={assets}
              onKill={(enemy) => {
                setSelectedEnemy(enemy);
                setModalVisible(true);
              }}
              onScoreUpdate={setGameScore}
            />
            <ExorcismModal
              visible={modalVisible}
              token={selectedEnemy}
              onCancel={() => setModalVisible(false)}
              onBurn={() => {
                setModalVisible(false);
                setAppState(APP_STATE.RESULT);
              }}
            />
            <TouchableOpacity
              style={[retroStyles.pixelButton, { position: 'absolute', bottom: 100, alignSelf: 'center', width: '60%', opacity: 0.7 }]}
              onPress={() => setAppState(APP_STATE.HOME)}
            >
              <Text style={retroStyles.pixelButtonText}>ABORT</Text>
            </TouchableOpacity>
          </GameMap>
        );

      case APP_STATE.RESULT:
        if (!selectedEnemy) {
          setAppState(APP_STATE.HOME);
          return null;
        }
        return (
          <ExorcismResult
            token={selectedEnemy}
            score={gameScore}
            onDone={() => setAppState(APP_STATE.HOME)}
          />
        );

      default: // APP_STATE.HOME
        return (
          <View style={{ flex: 1 }}>
            <View style={{ alignItems: 'center', marginBottom: 30, marginTop: 40 }}>
              <Image
                source={require('./assets/icon.png')}
                style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 20, borderWidth: 3, borderColor: '#5b21b6' }}
              />
              <Text style={retroStyles.pixelTextBold}>DUST DEMONS</Text>
              <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                <Ghost color="#a855f7" size={40} style={{ marginTop: 20 }} />
              </Animated.View>
            </View>

            <View style={retroStyles.mainPanel}>
              {wallet ? (
                <View style={{ width: '100%' }}>
                  <Text style={retroStyles.pixelText}>[ UPLINK ACTIVE ]</Text>
                  <Text style={[retroStyles.pixelText, { fontSize: 8, color: '#aaa', marginBottom: 20 }]}>
                    {wallet.accounts[0].address.slice(0, 12)}...{wallet.accounts[0].address.slice(-8)}
                  </Text>
                  <TouchableOpacity
                    style={retroStyles.pixelButton}
                    onPress={startMissionFlow}
                  >
                    <Text style={retroStyles.pixelButtonText}>START MISSION</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Animated.View style={{ width: '100%', transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity style={retroStyles.pixelButton} onPress={connectWallet}>
                    <Text style={retroStyles.pixelButtonText}>CONNECT WALLET</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <CRTOverlay>
      <SafeAreaView style={retroStyles.container}>
        <StatusBar barStyle="light-content" />
        {renderContent()}
        <View style={{ position: 'absolute', bottom: 40, alignItems: 'center', width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={[retroStyles.pixelText, { marginBottom: 0, fontSize: 8, color: '#666' }]}>
              SOL*P9 MONOLITH HACKATHON.EXE
            </Text>
            <Image source={require('./assets/logo-bright.png')} style={{ width: 16, height: 16, opacity: 0.5 }} />
          </View>
        </View>
      </SafeAreaView>
    </CRTOverlay>
  );
}
