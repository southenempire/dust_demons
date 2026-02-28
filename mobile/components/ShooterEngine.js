import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Text, Image } from 'react-native';
import { Ghost } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ImpactText } from './ImpactText';

const { width, height } = Dimensions.get('window');

export const ShooterEngine = ({ onKill, character, assets = [], onScoreUpdate }) => {
    const [enemies, setEnemies] = useState([]);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [lastHitTime, setLastHitTime] = useState(0);
    const [vortexCharge, setVortexCharge] = useState(0);
    const [isGlitching, setIsGlitching] = useState(false);
    const [announcement, setAnnouncement] = useState(null);
    const [particles, setParticles] = useState([]);
    const [floatingTexts, setFloatingTexts] = useState([]);
    const [loot, setLoot] = useState([]);

    // Ship horizontal position
    const shipX = useRef(new Animated.Value(width / 2 - 60)).current;

    useEffect(() => {
        onScoreUpdate?.(score);
    }, [score]);

    // Handle screen press for movement
    const handleScreenPress = (event) => {
        // Use pageX as fallback for locationX which is sometimes undefined on web
        const { locationX, pageX } = event.nativeEvent;
        const targetX = locationX !== undefined ? locationX : pageX;

        if (targetX !== undefined) {
            Animated.spring(shipX, {
                toValue: Math.max(0, Math.min(width - 120, targetX - 60)),
                useNativeDriver: false, // Safer for web environment
                friction: 7,
                tension: 40,
            }).start();
        }
    };

    // Spawn an enemy every 2 seconds
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
        const startX = Math.random() * (width - 100);
        const duration = 5000 + Math.random() * 3000;

        const animValue = new Animated.Value(0);
        const asset = assets[Math.floor(Math.random() * assets.length)];
        const isBoss = asset.amount > 5 || Math.random() > 0.8;

        const newEnemy = {
            id,
            animValue,
            startX,
            tokenName: asset.tokenName,
            isBoss,
            health: isBoss ? 5 : 1,
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

    const triggerJuice = (isKill = false) => {
        flashAnim.setValue(1);
        Animated.timing(flashAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start();

        if (isKill) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    };

    const triggerGlitch = () => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
    };

    const triggerLoot = (x, y) => {
        const id = Math.random().toString(36).substr(2, 9);
        const anim = new Animated.ValueXY({ x, y });
        setLoot(prev => [...prev, { id, anim }]);

        Animated.timing(anim, {
            toValue: { x: 50, y: 50 },
            duration: 800,
            useNativeDriver: true,
        }).start(() => {
            setLoot(prev => prev.filter(l => l.id !== id));
        });
    };

    const triggerFloatingText = (x, y, text, color = '#ff0') => {
        const id = Math.random().toString(36).substr(2, 9);
        setFloatingTexts(prev => [...prev, { id, x, y, text, color }]);
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
        }, 1000);
    };

    const triggerParticles = (x, y, color = '#f0f') => {
        const newParticles = Array.from({ length: 8 }).map(() => ({
            id: Math.random().toString(36).substr(2, 9),
            anim: new Animated.ValueXY({ x, y }),
        }));
        setParticles(prev => [...prev, ...newParticles]);

        newParticles.forEach(p => {
            Animated.timing(p.anim, {
                toValue: {
                    x: x + (Math.random() - 0.5) * 150,
                    y: y + (Math.random() - 0.5) * 150
                },
                duration: 600,
                useNativeDriver: true,
            }).start(() => {
                setParticles(prev => prev.filter(part => part.id !== p.id));
            });
        });
    };

    const useVortex = () => {
        if (vortexCharge < 100) return;
        triggerGlitch();
        setScore(prev => prev + (enemies.length * 500));
        setEnemies([]);
        setVortexCharge(0);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleShoot = (enemy) => {
        const hitX = enemy.startX + 20;
        const hitY = height * 0.5;

        if (enemy.health > 1) {
            setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, health: e.health - 1 } : e));
            triggerJuice(false);
            triggerParticles(hitX, hitY, '#f00');
            triggerFloatingText(hitX, hitY, 'HIT!', '#ff0');
            setVortexCharge(prev => Math.min(prev + 5, 100));
            return;
        }

        const now = Date.now();
        let newCombo = now - lastHitTime < 1000 ? combo + 1 : 1;
        setCombo(newCombo);
        setLastHitTime(now);

        if (newCombo >= 3) triggerFloatingText(width / 2, height / 2, `COMBO X${newCombo}!`, '#f0f');
        if (enemy.isBoss) triggerFloatingText(hitX, hitY, 'BOSS DEFEATED!', '#f00');

        triggerJuice(true);
        triggerParticles(hitX, hitY, enemy.isBoss ? '#f00' : '#8b5cf6');
        triggerLoot(hitX, hitY);

        const multiplier = Math.min(newCombo, 10);
        setScore(prev => prev + (100 * multiplier));
        setVortexCharge(prev => Math.min(prev + (enemy.isBoss ? 20 : 10), 100));
        removeEnemy(enemy.id);
        onKill(enemy);
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            style={[styles.fullScreenTouch, StyleSheet.absoluteFill]}
            onPress={handleScreenPress}
        >
            <View style={[styles.container, isGlitching && styles.glitchEffect]}>
                <Animated.View style={[styles.muzzleFlash, { opacity: flashAnim }]} pointerEvents="none" />

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
                    <Text style={[styles.hudText, { color: '#8b5cf6' }]}>PILOT: {character?.name}</Text>
                </View>

                {enemies.map((enemy) => {
                    const translateY = enemy.animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-100, height + 100],
                    });

                    return (
                        <Animated.View
                            key={enemy.id}
                            style={[styles.enemy, { transform: [{ translateY }], left: enemy.startX }]}
                        >
                            <TouchableOpacity onPress={() => handleShoot(enemy)} activeOpacity={0.5}>
                                <View style={styles.enemyContent}>
                                    <Image
                                        source={enemy.isBoss ? require('../assets/boss_demon.png') : require('../assets/demon_enemy_final.png')}
                                        style={enemy.isBoss ? { width: 80, height: 80 } : { width: 40, height: 40 }}
                                    />
                                    <View style={styles.tokenLabel}>
                                        <Text style={styles.tokenText}>{enemy.tokenName}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}

                {particles.map(p => (
                    <Animated.View key={p.id} style={[styles.particle, { transform: p.anim.getTranslateTransform() }]} />
                ))}

                {loot.map(l => (
                    <Animated.View key={l.id} style={[styles.loot, { transform: l.anim.getTranslateTransform() }]}>
                        <Text style={{ fontSize: 10 }}>🟡</Text>
                    </Animated.View>
                ))}

                {floatingTexts.map(ft => (
                    <View key={ft.id} style={{ position: 'absolute', left: ft.x, top: ft.y - 40 }}>
                        <ImpactText text={ft.text} color={ft.color} size={14} />
                    </View>
                ))}

                {/* HERO SHIP */}
                <Animated.View style={[
                    styles.shipContainer,
                    { transform: [{ translateX: shipX }], zIndex: 10 }
                ]}>
                    <Image
                        source={character?.image || require('../assets/ship_hunter_final.png')}
                        style={[
                            styles.heroShip,
                            character?.id === 'prophet' && { transform: [{ rotate: '90deg' }] },
                            character?.id === 'collector' && { transform: [{ rotate: '180deg' }] }
                        ]}
                        resizeMode="contain"
                    />
                </Animated.View>

            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    fullScreenTouch: {
        flex: 1,
        width: '100%',
    },
    container: {
        flex: 1,
        width: '100%',
        alignSelf: 'stretch',
    },
    muzzleFlash: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        zIndex: 100,
    },
    hud: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 40,
        zIndex: 50,
    },
    hudText: {
        fontFamily: 'PressStart2P',
        fontSize: 10, // Restored to 10
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 2,
    },
    vortexBtn: {
        backgroundColor: '#333',
        padding: 8,
        borderWidth: 2,
        borderColor: '#666',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
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
    shipContainer: {
        position: 'absolute',
        bottom: 50,
        width: 110, // Slightly smaller than image to force-clip edges
        height: 110,
        alignItems: 'center',
        justifyContent: 'center',
        left: 0,
        borderRadius: 55,
        overflow: 'hidden',
        backgroundColor: '#000', // Solid blend
    },
    heroShip: {
        width: 120,
        height: 120,
        borderRadius: 60, // Specific image clip
    },
    particle: {
        position: 'absolute',
        width: 4,
        height: 4,
        backgroundColor: '#f0f',
        borderRadius: 2,
    },
    loot: {
        position: 'absolute',
        zIndex: 50,
    },
    enemy: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40, // Clip enemy black box
        overflow: 'hidden',
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
        fontSize: 10, // Increased from 8
        textShadowColor: 'rgba(0,0,0,0.9)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});
