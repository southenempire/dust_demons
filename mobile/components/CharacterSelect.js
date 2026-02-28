import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Animated } from 'react-native';
import { retroStyles } from '../styles';

const CHARACTERS = [
    { id: 'hunter', name: 'YIELD HUNTER', image: require('../assets/ship_hunter.png'), weapon: 'Jup-Beam x2', ability: 'SOL_RENT_RECLAIMER', perk: 'Detects hidden SOL rent locked in dormant accounts. +10% yield on reclaimed rent.' },
    { id: 'lord', name: 'DEMON LORD', image: require('../assets/ship_lord.png'), weapon: 'Void Railgun', ability: 'HACKATHON_OVERRIDE', perk: 'Instantly burns rugpull tokens. 2x XP multiplier for any verified burn.' },
    { id: 'collector', name: 'DUST COLLECTOR', image: require('../assets/ship_collector.png'), weapon: 'Vacuum 3000', perk: 'Automatically sweeps tokens worth < 0.01 SOL. Infinite scanning range.' },
    { id: 'prophet', name: 'MARKET PROPHET', image: require('../assets/ship_prophet.png'), weapon: 'Crystal Glitch', ability: 'PRECOGNITION', perk: 'Shows Jupiter Price API v3 delta before swap. 100% swap slip protection.' },
];

const MAPS = [
    { id: 'GRAVEYARD', name: 'THE GRAVEYARD', colors: ['#000', '#2d004d'] },
    { id: 'CORE', name: 'THE CORE', colors: ['#000', '#004d1a'] },
    { id: 'VOID', name: 'THE VOID', colors: ['#000', '#111'] },
];

export const CharacterSelect = ({ onSelect }) => {
    const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
    const [selectedMap, setSelectedMap] = useState(MAPS[0]);

    return (
        <View style={styles.container}>
            <Text style={[retroStyles.pixelTextBold, { fontSize: 16 }]}>PREPARE MISSION</Text>

            <View style={styles.previewContainer}>
                <Image source={selectedChar.image} style={styles.previewImage} resizeMode="contain" />
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>{selectedChar.name}</Text>
                    <View style={styles.abilityBadge}>
                        <Text style={styles.abilityLabel}>{selectedChar.ability || 'CORE_SYSTEM'}</Text>
                    </View>
                    <Text style={styles.subStatsText}>{selectedChar.weapon}</Text>
                    <View style={styles.perkBox}>
                        <Text style={styles.perkText}>{selectedChar.perk}</Text>
                    </View>
                </View>
            </View>

            <Text style={styles.sectionLabel}>CHOOSE HUNTER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {CHARACTERS.map((char) => (
                    <TouchableOpacity
                        key={char.id}
                        onPress={() => setSelectedChar(char)}
                        style={[styles.charCard, selectedChar.id === char.id && styles.selectedCard]}
                    >
                        <Image source={char.image} style={styles.cardImage} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>CHOOSE DIMENSION</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {MAPS.map((map) => (
                    <TouchableOpacity
                        key={map.id}
                        onPress={() => setSelectedMap(map)}
                        style={[styles.mapCard, selectedMap.id === map.id && styles.selectedMapCard]}
                    >
                        <View style={[styles.mapOrb, { backgroundColor: map.colors[1] }]} />
                        <Text style={[styles.mapName, selectedMap.id === map.id && { color: '#f0f', textShadowRadius: 10 }]}>{map.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[retroStyles.pixelButton, { marginTop: 20 }]}
                onPress={() => onSelect(selectedChar, selectedMap)}
            >
                <Text style={retroStyles.pixelButtonText}>INITIALIZE MISSION</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        width: '100%',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: 40,
        backgroundColor: 'transparent',
        padding: 20,
        width: '100%',
    },
    previewImage: {
        width: 180,
        height: 180,
        marginBottom: 20,
    },
    statsContainer: {
        alignItems: 'center',
    },
    statsText: {
        color: '#fff',
        fontFamily: 'PressStart2P',
        fontSize: 14,
        marginBottom: 10,
    },
    subStatsText: {
        color: '#0f0',
        fontFamily: 'PressStart2P',
        fontSize: 10,
        marginTop: 5,
    },
    sectionLabel: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#666',
        marginTop: 15,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    carousel: {
        maxHeight: 100,
    },
    charCard: {
        marginHorizontal: 15,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedCard: {
        transform: [{ scale: 1.2 }],
    },
    cardImage: {
        width: 70,
        height: 70,
    },
    mapCard: {
        marginHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
    },
    mapOrb: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    mapName: {
        fontFamily: 'PressStart2P',
        fontSize: 6,
        color: '#666',
        textAlign: 'center',
    },
    selectedMapCard: {
        transform: [{ scale: 1.2 }],
    },
    abilityBadge: {
        backgroundColor: '#f0f2',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#f0f',
        marginTop: 5,
        borderRadius: 2,
    },
    abilityLabel: {
        color: '#f0f',
        fontFamily: 'PressStart2P',
        fontSize: 8,
    },
    perkBox: {
        marginTop: 15,
        borderLeftWidth: 2,
        borderLeftColor: '#0f0',
        paddingLeft: 10,
        width: '100%',
    },
    perkText: {
        color: '#666',
        fontFamily: 'PressStart2P',
        fontSize: 7,
        lineHeight: 12,
    },
});
