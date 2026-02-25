import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Animated } from 'react-native';
import { retroStyles } from '../styles';

const CHARACTERS = [
    { id: 'lord', name: 'DEMON LORD', image: require('../assets/characters/achievement_demon_lord.png'), weapon: 'Void Railgun', perk: '2x Burn Speed' },
    { id: 'hunter', name: 'YIELD HUNTER', image: require('../assets/characters/achievement_yield_hunter.png'), weapon: 'Jup-Beam', perk: '+5% APY' },
    { id: 'collector', name: 'DUST COLLECTOR', image: require('../assets/characters/achievement_dust_collector.png'), weapon: 'Vacuum 3000', perk: 'Auto-Scan' },
    { id: 'prophet', name: 'MARKET PROPHET', image: require('../assets/characters/achievement_prophet.png'), weapon: 'Crystal Glitch', perk: 'Price Prediction' },
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
                <Image source={selectedChar.image} style={styles.previewImage} />
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>{selectedChar.name}</Text>
                    <Text style={styles.subStatsText}>{selectedChar.weapon} • {selectedChar.perk}</Text>
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
                        <View style={[styles.mapColorPreview, { backgroundColor: map.colors[1] }]} />
                        <Text style={styles.mapName}>{map.name.split(' ')[1] || map.name}</Text>
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
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewContainer: {
        alignItems: 'center',
        marginVertical: 40,
        backgroundColor: '#0a0a0a',
        borderWidth: 2,
        borderColor: '#5b21b6',
        padding: 20,
        width: '100%',
        borderRadius: 4,
    },
    previewImage: {
        width: 150,
        height: 150,
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
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: '#333',
        padding: 10,
        borderRadius: 4,
    },
    selectedCard: {
        borderColor: '#0f0',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
    },
    cardImage: {
        width: 60,
        height: 60,
    },
    mapCard: {
        marginHorizontal: 10,
        borderWidth: 2,
        borderColor: '#333',
        padding: 10,
        borderRadius: 4,
        width: 100,
        alignItems: 'center',
    },
    selectedMapCard: {
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
    },
    mapColorPreview: {
        width: '100%',
        height: 30,
        marginBottom: 10,
        borderRadius: 2,
    },
    mapName: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#fff',
    },
});
