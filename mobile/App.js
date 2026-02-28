import { Buffer } from 'buffer';
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar, Image, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { Ghost } from 'lucide-react-native';
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
import { fetchWalletAssets, burnToken } from './utils/solana';

SplashScreen.preventAutoHideAsync();

const APP_STATE = {
  HOME: 'HOME',
  CHARACTER_SELECT: 'CHARACTER_SELECT',
  GAMEPLAY: 'GAMEPLAY',
  RESULT: 'RESULT',
};

const DEBUG_MODE = true; // Set to true for rapid UI testing (Web/Simulator)

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
    if (DEBUG_MODE) {
      setWallet({
        accounts: [{ address: 'DEBUG_WALLET_ADDRESS_123456789' }],
        identity: { name: 'Dust Demons (MOCK)' }
      });
      return;
    }

    if (typeof transact === 'undefined') {
      alert("Solana MWA not found. This feature requires a Development Build, not Expo Go.");
      return;
    }
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
      alert('Wallet connection failed: ' + e.message);
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
            {/* ABORT BUTTON - Restored to subtle bottom position */}
            <TouchableOpacity
              style={[retroStyles.pixelButton, { position: 'absolute', bottom: 10, alignSelf: 'center', width: 80, padding: 8, opacity: 0.3, zIndex: 1 }]}
              onPress={() => setAppState(APP_STATE.HOME)}
            >
              <Text style={[retroStyles.pixelButtonText, { fontSize: 8 }]}>ABORT</Text>
            </TouchableOpacity>
            <ExorcismModal
              visible={modalVisible}
              token={selectedEnemy}
              onCancel={() => setModalVisible(false)}
              onBurn={async () => {
                await burnToken(wallet, selectedEnemy);
                setModalVisible(false);
                setAppState(APP_STATE.RESULT);
              }}
            />
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
          <View style={styles.dashboardContainer}>
            <View style={styles.header}>
              <View>
                <Text style={styles.dashboardTitle}>UPLINK_DASHBOARD_v4.2</Text>
                <Text style={styles.statusSubtext}>LOCATION: SECTOR_SOL_7</Text>
              </View>
              <View style={styles.batteryIndicator}>
                <View style={[styles.batteryFill, { width: '85%' }]} />
              </View>
            </View>

            <View style={styles.mainDisplay}>
              <Image
                source={require('./assets/ship_hunter_final.png')}
                style={styles.heroShipSplash}
              />
              <Animated.View style={[styles.uplinkPulse, { transform: [{ scale: pulseAnim }] }]}>
                <Text style={styles.uplinkText}>[ WAITING FOR CONNECTION ]</Text>
              </Animated.View>
            </View>

            <View style={styles.actionPanel}>
              {wallet ? (
                <View style={{ width: '100%', alignItems: 'center' }}>
                  <View style={styles.walletInfo}>
                    <Text style={styles.walletLabel}>PILOT_IDENTIFIED</Text>
                    <Text style={styles.walletAddress}>
                      {wallet.accounts[0].address.slice(0, 16)}...
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[retroStyles.pixelButton, styles.primaryButton]}
                    onPress={startMissionFlow}
                  >
                    <Text style={retroStyles.pixelButtonText}>INITIALIZE_MISSION</Text>
                  </TouchableOpacity>
                  {DEBUG_MODE && (
                    <TouchableOpacity
                      style={{ marginTop: 20 }}
                      onPress={() => setWallet(null)}
                    >
                      <Text style={styles.debugDisconnect}>[ DISCONNECT_DEBUG ]</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <TouchableOpacity style={[retroStyles.pixelButton, styles.primaryButton]} onPress={connectWallet}>
                  <Text style={retroStyles.pixelButtonText}>{DEBUG_MODE ? 'OVERRIDE_AUTH (DEBUG)' : 'ESTABLISH_UPLINK'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footerDash}>
              <Text style={styles.footerText}>SOL*P9 MONOLITH HACKATHON // EXECUTABLE_0x83AF</Text>
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
      </SafeAreaView>
    </CRTOverlay>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    flex: 1,
    padding: 20,
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 10,
  },
  dashboardTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#0f0',
  },
  statusSubtext: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#666',
    marginTop: 5,
  },
  batteryIndicator: {
    width: 40,
    height: 15,
    borderWidth: 1,
    borderColor: '#333',
    padding: 2,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#0f0',
  },
  mainDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroShipSplash: {
    width: 200,
    height: 200,
    marginBottom: 40,
    opacity: 0.9,
    borderRadius: 100, // Circular mask for splash
    backgroundColor: '#000',
  },
  uplinkPulse: {
    alignItems: 'center',
  },
  uplinkText: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#f0f',
    textShadowColor: 'rgba(255, 0, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  actionPanel: {
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#1a1a1a',
    borderColor: '#0f0',
  },
  walletInfo: {
    backgroundColor: '#050505',
    borderWidth: 1,
    borderColor: '#111',
    padding: 15,
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  walletLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#666',
    marginBottom: 5,
  },
  walletAddress: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#fff',
  },
  debugDisconnect: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#333',
  },
  footerDash: {
    borderTopWidth: 1,
    borderTopColor: '#222',
    paddingTop: 10,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'PressStart2P',
    fontSize: 6,
    color: '#444',
  }
});
