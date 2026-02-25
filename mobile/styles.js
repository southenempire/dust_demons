import { StyleSheet } from 'react-native';

export const retroStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    crtOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(18, 16, 16, 0.1)',
        zIndex: 10,
        pointerEvents: 'none',
    },
    pixelText: {
        color: '#0f0',
        fontSize: 14,
        fontFamily: 'PressStart2P',
        textShadowColor: 'rgba(0, 255, 0, 0.75)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 24,
    },
    pixelTextBold: {
        color: '#fff',
        fontSize: 20,
        fontFamily: 'PressStart2P',
        textAlign: 'center',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    mainPanel: {
        width: '100%',
        backgroundColor: '#111',
        borderWidth: 2,
        borderColor: '#333',
        padding: 30,
        borderRadius: 4,
    },
    pixelButton: {
        backgroundColor: '#5b21b6',
        borderWidth: 3,
        borderColor: '#8b5cf6',
        padding: 20,
        marginTop: 20,
        width: '100%',
        alignItems: 'center',
        // Creating a "jagged" look with border radius
        borderRadius: 2,
    },
    pixelButtonText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'PressStart2P',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
});
