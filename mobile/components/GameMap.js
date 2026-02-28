import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Skull, Zap, Ghost } from 'lucide-react-native';

export const GAME_MAPS = {
    GRAVEYARD: {
        id: 'GRAVEYARD',
        name: 'THE GRAVEYARD',
        colors: ['#000', '#000'], // Unified black base
        bgImage: require('../assets/top_down_graveyard_bg_final.png'),
        overlayColor: 'transparent',
    },
    CORE: {
        id: 'CORE',
        name: 'THE CORE',
        colors: ['#000', '#000'], // Unified black base
        bgImage: require('../assets/top_down_core_bg_final.png'),
        overlayColor: 'transparent',
    },
    VOID: {
        id: 'VOID',
        name: 'THE VOID',
        colors: ['#000', '#000'], // Unified black base
        bgImage: require('../assets/top_down_void_bg_final.png'),
        overlayColor: 'transparent',
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

            {activeMap.bgImage && (
                <Image
                    source={activeMap.bgImage}
                    style={[StyleSheet.absoluteFill, { opacity: 0.9, width: '100%', height: '100%' }]}
                    resizeMode="cover"
                />
            )}

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
