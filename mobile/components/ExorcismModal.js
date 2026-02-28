import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { retroStyles } from '../styles';
import { Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { ImpactText } from './ImpactText';

export const ExorcismModal = ({ visible, token, onBurn, onCancel }) => {
    const [isBurning, setIsBurning] = React.useState(false);

    React.useEffect(() => {
        if (visible) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setIsBurning(false);
        }
    }, [visible]);

    const handleBurn = async () => {
        setIsBurning(true);
        await onBurn();
        setIsBurning(false);
    };

    if (!token) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                {visible && !isBurning && <ImpactText text="TARGET LOCKED" color="#f00" />}
                {isBurning && <ImpactText text="EXORCISING..." color="#ff0" />}

                <View style={styles.modal}>
                    <Text style={[retroStyles.pixelTextBold, { color: isBurning ? '#ff0' : '#f00' }]}>
                        {isBurning ? 'CHANNELING SOL' : 'DEMON DETECTED'}
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.tokenTitle}>{token.tokenName}</Text>
                        <Text style={styles.tokenAmount}>{token.amount} TOKENS</Text>
                        <Text style={styles.solValue}>RECLAIMING ~0.002 SOL</Text>
                    </View>

                    {!isBurning ? (
                        <>
                            <Text style={[styles.cautionText]}>
                                PURGE THIS FILTH FROM THE MONOLITH?
                            </Text>

                            <TouchableOpacity style={[retroStyles.pixelButton, styles.burnButton]} onPress={handleBurn}>
                                <Flame color="#fff" size={20} style={{ marginRight: 10 }} />
                                <Text style={retroStyles.pixelButtonText}>EXORCISE (BURN)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
                                <Text style={styles.cancelText}>SPARE DEMON</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={{ padding: 20 }}>
                            <Text style={[retroStyles.pixelText, { fontSize: 8, color: '#aaa', textAlign: 'center' }]}>
                                COMMUNICATING WITH BLOCKCHAIN...
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: 20,
    },
    modal: {
        backgroundColor: '#111',
        borderWidth: 4,
        borderColor: '#f00',
        padding: 30,
        alignItems: 'center',
    },
    infoBox: {
        marginVertical: 30,
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        width: '100%',
        padding: 20,
        borderWidth: 1,
        borderColor: '#333',
    },
    tokenTitle: {
        fontFamily: 'PressStart2P',
        fontSize: 20,
        color: '#0f0',
        marginBottom: 10,
    },
    tokenAmount: {
        fontFamily: 'PressStart2P',
        fontSize: 10,
        color: '#aaa',
    },
    solValue: {
        fontFamily: 'PressStart2P',
        fontSize: 10,
        color: '#8b5cf6',
        marginTop: 10,
    },
    cautionText: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 20,
    },
    burnButton: {
        backgroundColor: '#b91c1c',
        borderColor: '#ef4444',
        flexDirection: 'row',
    },
    cancelLink: {
        marginTop: 20,
    },
    cancelText: {
        fontFamily: 'PressStart2P',
        fontSize: 8,
        color: '#444',
        textDecorationLine: 'underline',
    }
});
