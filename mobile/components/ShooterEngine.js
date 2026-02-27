import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Text, Image } from 'react-native';
import { Ghost, Crosshair } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export const ShooterEngine = ({ onKill, character, assets = [], onScoreUpdate }) => {
    const [enemies, setEnemies] = useState([]);
    const [score, setScore] = useState(0);

    useEffect(() => {
        onScoreUpdate?.(score);
    }, [score]);
    const [combo, setCombo] = useState(0);
    const [lastHitTime, setLastHitTime] = useState(0);
    const [vortexCharge, setVortexCharge] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [announcement, setAnnouncement] = useState(null);

    // Spawn an enemy every 3 seconds
    useEffect(() => {
        if (assets.length === 0) return;
        const spawnInterval = setInterval(() => {
            spawnEnemy();
        }, 2000);

        return () => clearInterval(spawnInterval);
    }, [assets]);

    const spawnEnemy = () => {
        if (assets.length === 0) return;
        const id = Math.random().toString(36).substr(2, 9);
        const startX = Math.random() * (width - 100); // Adjusted width for potentially larger bosses
        const startY = -100; // Adjusted startY for potentially larger bosses
        const duration = 5000 + Math.random() * 3000;

        const animValue = new Animated.Value(0);
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const isBoss = asset.amount > 5 || Math.random() > 0.8; // Boss logic

        const newEnemy = {
            id,
            animValue,
            startX,
            tokenName: asset.tokenName,
            amount: asset.amount,
            mint: asset.mint,
            isBoss,
            health: isBoss ? 5 : 1, // Bosses have more health
        };

        setEnemies(prev => [...prev, newEnemy]);

        Animated.timing(animValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                removeEnemy(id);
            }
        });
    };

    const removeEnemy = (id) => {
        setEnemies(prev => prev.filter(e => e.id !== id));
    };

    const flashAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

    const triggerJuice = (isKill = false) => {
        // Flash
        flashAnim.setValue(1);
        Animated.timing(flashAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();

        // Shake
        if (isKill) {
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: { x: 10, y: 10 }, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: { x: -10, y: -10 }, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: { x: 10, y: -10 }, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: { x: 0, y: 0 }, duration: 50, useNativeDriver: true }),
            ]).start();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const triggerGlitch = () => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
    };

    const useVortex = () => {
        if (vortexCharge < 100) return;
        triggerGlitch();
        setScore(prev => prev + (enemies.length * 500)); // Bonus for clearing enemies
        setEnemies([]); // Clear all enemies
        setVortexCharge(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleShoot = (enemy) => {
        if (enemy.health > 1) {
            // Hit a Boss, reduce health but don't remove yet
            setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, health: e.health - 1 } : e));
            triggerJuice(false); // Small bump for hitting a boss
            setVortexCharge(prev => Math.min(prev + 5, 100)); // Charge vortex for boss hits
            return;
        }

        const now = Date.now();
        let newCombo = combo;
        if (now - lastHitTime < 1000) {
            newCombo = combo + 1;
        } else {
            newCombo = 1;
        }

        setCombo(newCombo);
        setLastHitTime(now);

        // Announcer logic
        if (newCombo === 3) setAnnouncement('TRIPLE KILL!');
        else if (newCombo === 5) setAnnouncement('DOMINATING!');
        else if (newCombo === 10) setAnnouncement('UNSTOPPABLE!');
        else setAnnouncement(null);

        triggerJuice(true);
        const multiplier = Math.min(newCombo, 10);
        setScore(prev => prev + (100 * multiplier));
        setVortexCharge(prev => Math.min(prev + (enemy.isBoss ? 20 : 10), 100)); // Charge vortex for regular kills, more for bosses
        removeEnemy(enemy.id);
        onKill(enemy);
    };

    return (
        <Animated.View style={[
            styles.container,
            { transform: shakeAnim.getTranslateTransform() },
            isGlitching && styles.glitchEffect // Apply glitch effect
        ]}>
            {announcement && <ImpactText text={announcement} color="#ff0" size={18} />}
            <Animated.View
                style={[
                    styles.muzzleFlash,
                    { opacity: flashAnim }
                ]}
                pointerEvents="none"
            />
            <View style={styles.hud}>
                <View>
                    <Text style={styles.hudText}>SCORE: {score.toString().padStart(6, '0')}</Text>
                    {combo > 1 && (
                        <Text style={[styles.hudText, { color: '#ff0', marginTop: 5, fontSize: 8 }]}>COMBO X{combo}!</Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={useVortex}
                    style={[styles.vortexBtn, vortexCharge >= 100 && styles.vortexActive]}
                    disabled={vortexCharge < 100}
                >
                    <Text style={styles.vortexText}>VORTEX: {vortexCharge}%</Text>
                    <View style={[styles.vortexProgressBar, { width: `${vortexCharge}%` }]} />
                </TouchableOpacity>
                <Text style={[styles.hudText, { color: '#8b5cf6' }]}>HUNTER: {character?.name}</Text>
            </View>

            {enemies.map((enemy) => {
                const translateY = enemy.animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, height + 100], // Adjusted for larger enemies
                });

                const translateX = enemy.animValue.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [enemy.startX, enemy.startX + 20, enemy.startX - 20],
                });

                return (
                    <Animated.View
                        key={enemy.id}
                        style={[
                            styles.enemy,
                            { transform: [{ translateY }, { translateX }] },
                        ]}
                    >
                        <TouchableOpacity onPress={() => handleShoot(enemy)} activeOpacity={0.5}>
                            <View style={styles.enemyContent}>
                                <Ghost color="#a855f7" size={40} />
                                <View style={styles.tokenLabel}>
                                    <Text style={styles.tokenText}>{enemy.tokenName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                );
            })}

            <View style={styles.crosshairContainer} pointerEvents="none">
                <Crosshair color="rgba(255, 0, 0, 0.3)" size={60} />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    muzzleFlash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 100,
    },
    vortexBtn: {
        backgroundColor: '#333',
        padding: 8,
        borderWidth: 2,
        borderColor: '#666',
        borderRadius: 2,
    },
    vortexActive: {
        backgroundColor: '#8b5cf6',
        borderColor: '#ff0',
    },
    vortexText: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#fff',
        zIndex: 2,
    },
    vortexProgressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 0, 0.3)',
        zIndex: 1,
    },
    glitchEffect: {
        backgroundColor: 'rgba(255, 0, 255, 0.2)',
    },
    enemy: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        zIndex: 10,
    },
    hudText: {
        fontFamily: 'PressStart2P',
        fontSize: 10,
        color: '#fff',
    },
    enemy: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    enemyContent: {
        alignItems: 'center',
    },
    tokenLabel: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 4,
        marginTop: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    tokenText: {
        color: '#0f0',
        fontFamily: 'PressStart2P',
        fontSize: 8,
    },
    crosshairContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
