// jest.setup.js - Extend jest matchers and silence warnings

// Silence console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
    if (args[0]?.includes?.('NativeWind') || args[0]?.includes?.('className')) return;
    originalWarn.apply(console, args);
};

console.error = (...args) => {
    if (args[0]?.includes?.('Warning:') || args[0]?.includes?.('className')) return;
    originalError.apply(console, args);
};
