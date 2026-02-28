import 'react-native-get-random-values';
const { Buffer } = require('buffer');

// Global polyfills MUST come before any other imports
global.Buffer = Buffer;
if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

if (typeof global.process === 'undefined') {
    global.process = require('process');
}
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
    window.process = global.process;
}

// Now we can import React/Expo modules
const { registerRootComponent } = require('expo');
const App = require('./App').default;

registerRootComponent(App);

