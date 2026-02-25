import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';

export const ImpactText = ({ text, color = '#f00', size = 24 }) => {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scale, { toValue: 1.2, friction: 4, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: -50, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 800, delay: 600, useNativeDriver: true }),
        ]).start();
    }, [text]);

    return (
        <Animated.Text
            style={[
                styles.text,
                { color, fontSize: size, transform: [{ scale }, { translateY }], opacity }
            ]}
        >
            {text}
        </Animated.Text>
    );
};

const styles = StyleSheet.create({
    text: {
        fontFamily: 'PressStart2P',
        fontSize: 24,
        fontWeight: 'bold',
        position: 'absolute',
        top: '40%',
        width: '100%',
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 4, height: 4 },
        textShadowRadius: 1,
        zIndex: 1000,
    }
});
