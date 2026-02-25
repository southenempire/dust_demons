import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DustParticles = () => {
    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {[...Array(15)].map((_, i) => {
                const size = Math.random() * 4 + 2;
                const left = `${Math.random() * 100}%`;
                const top = `${Math.random() * 100}%`;
                const opacity = Math.random() * 0.5 + 0.1;
                const color = Math.random() > 0.5 ? '#0f0' : '#8b5cf6';
                return (
                    <View
                        key={i}
                        style={{
                            position: 'absolute',
                            width: size,
                            height: size,
                            backgroundColor: color,
                            left,
                            top,
                            opacity,
                            borderRadius: 2,
                            shadowColor: color,
                            shadowRadius: 5,
                            shadowOpacity: 1,
                        }}
                    />
                );
            })}
        </View>
    );
};

export const CRTOverlay = ({ children }) => {
    const flickerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const flicker = Animated.loop(
            Animated.sequence([
                Animated.timing(flickerAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(flickerAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(flickerAnim, {
                    toValue: 0.9,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ])
        );
        flicker.start();

        return () => flicker.stop();
    }, []);

    return (
        <View style={styles.container}>
            {children}

            <DustParticles />

            {/* Scanlines layer */}
            <View style={styles.scanlines} pointerEvents="none">
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={styles.scanline} />
                ))}
            </View>

            {/* Flicker layer */}
            <Animated.View
                style={[
                    styles.flicker,
                    {
                        opacity: flickerAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.03, 0.08]
                        })
                    }
                ]}
                pointerEvents="none"
            />

            {/* Vignette effect */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={styles.vignette}
                pointerEvents="none"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    scanlines: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 100,
        opacity: 0.15,
    },
    scanline: {
        height: 1,
        backgroundColor: '#000',
        marginBottom: 4,
    },
    flicker: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#fff',
        zIndex: 101,
    },
    vignette: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 102,
    },
});
