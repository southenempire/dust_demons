import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Share } from 'react-native';
import { retroStyles } from '../styles';
import { Twitter, Share2, Award } from 'lucide-react-native';

export const ExorcismResult = ({ token, score, onDone }) => {
    const shareResults = async () => {
        try {
            await Share.share({
                message: `I just exorcised ${token?.amount} $${token?.tokenName} demons from my wallet! 🔥 Final score: ${score}. Purge your filth on @DustDemons #SolanaMonolith #SolanaMobile`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.certificate}>
                <Award color="#ff0" size={60} style={{ marginBottom: 20 }} />
                <Text style={[retroStyles.pixelTextBold, { color: '#ff0', fontSize: 16 }]}>CERTIFICATE OF EXORCISM</Text>

                <View style={styles.divider} />

                <Text style={styles.certText}>THIS CERTIFIES THAT THE MONOLITH HAS BEEN PURGED OF:</Text>
                <Text style={styles.tokenText}>{token?.amount} $${token?.tokenName}</Text>

                <View style={styles.statsRow}>
                    <Text style={styles.statLabel}>PURGE SCORE:</Text>
                    <Text style={styles.statValue}>{score}</Text>
                </View>

                <Image
                    source={require('../assets/logo-bright.svg')}
                    style={{ width: 40, height: 40, marginTop: 30, opacity: 0.8 }}
                />
                <Text style={styles.footerText}>DUST DEMON HUNTERS • 2026</Text>
            </View>

            <TouchableOpacity style={[retroStyles.pixelButton, styles.twitterButton]} onPress={shareResults}>
                <Twitter color="#fff" size={20} style={{ marginRight: 10 }} />
                <Text style={retroStyles.pixelButtonText}>FLEX ON X</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[retroStyles.pixelButton, { marginTop: 10 }]} onPress={onDone}>
                <Text style={retroStyles.pixelButtonText}>RETURN TO BASE</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#000',
    },
    certificate: {
        backgroundColor: '#111',
        borderWidth: 4,
        borderColor: '#ff0',
        padding: 30,
        alignItems: 'center',
        marginBottom: 40,
    },
    divider: {
        height: 2,
        backgroundColor: '#333',
        width: '100%',
        marginVertical: 20,
    },
    certText: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#aaa',
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 20,
    },
    tokenText: {
        fontFamily: 'PressStart2P',
        fontSize: 22,
        color: '#0f0',
        marginBottom: 30,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#0a0a0a',
        padding: 10,
    },
    statLabel: {
        fontFamily: 'PressStart2P',
        fontSize: 10,
        color: '#666',
    },
    statValue: {
        fontFamily: 'PressStart2P',
        fontSize: 10,
        color: '#ff0',
    },
    footerText: {
        fontFamily: 'PressStart2P',
        fontSize: 6,
        color: '#333',
        marginTop: 10,
    },
    twitterButton: {
        backgroundColor: '#1d9bf0',
        borderColor: '#38bdf8',
        flexDirection: 'row',
    }
});
