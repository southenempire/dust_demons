import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Skull, Zap, Ghost } from 'lucide-react-native';

export const GAME_MAPS = {
    GRAVEYARD: {
        id: 'GRAVEYARD',
        name: 'THE GRAVEYARD',
        colors: ['#000', '#2d004d'],
        icon: <Skull color="rgba(255,255,255,0.1)" size={200} />,
        overlayColor: 'rgba(91, 33, 182, 0.1)',
    },
    CORE: {
        id: 'CORE',
        name: 'THE CORE',
        colors: ['#000', '#004d1a'],
        icon: <Zap color="rgba(0,255,0,0.1)" size={200} />,
        overlayColor: 'rgba(0, 255, 0, 0.05)',
    },
    VOID: {
        id: 'VOID',
        name: 'THE VOID',
        colors: ['#000', '#111'],
        icon: <Ghost color="rgba(255,0,255,0.1)" size={200} />,
        overlayColor: 'rgba(255, 0, 255, 0.05)',
    }
};

export const GameMap = ({ mapId, children }) => {
    const activeMap = GAME_MAPS[mapId] || GAME_MAPS.GRAVEYARD;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={activeMap.colors}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.iconOverlay}>
                {activeMap.icon}
            </View>

            <View style={[styles.colorOverlay, { backgroundColor: activeMap.overlayColor }]} />

            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    iconOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.5,
    },
    colorOverlay: {
        ...StyleSheet.absoluteFillObject,
    }
});
