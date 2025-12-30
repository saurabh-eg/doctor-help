/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./contexts/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Primary Blue
                primary: {
                    DEFAULT: "#2563eb",
                    dark: "#1d4ed8",
                    light: "#eff6ff",
                    muted: "#dbeafe",
                },
                // Success Green
                success: {
                    DEFAULT: "#10b981",
                    light: "#ecfdf5",
                },
                // Warning Amber
                warning: {
                    DEFAULT: "#f59e0b",
                    light: "#fffbeb",
                },
                // Error Red
                error: {
                    DEFAULT: "#ef4444",
                    light: "#fef2f2",
                },
                // Secondary
                secondary: "#34d399",
                accent: "#f9f506",
            },
            fontFamily: {
                display: ["Lexend", "sans-serif"],
                body: ["Inter", "sans-serif"],
            },
            fontSize: {
                // Ensure minimum readable sizes
                'xs': ['12px', { lineHeight: '16px' }],
                'sm': ['14px', { lineHeight: '20px' }],
                'base': ['15px', { lineHeight: '22px' }],
                'lg': ['18px', { lineHeight: '26px' }],
                'xl': ['20px', { lineHeight: '28px' }],
                '2xl': ['24px', { lineHeight: '32px' }],
                '3xl': ['32px', { lineHeight: '40px' }],
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '20px',
                '2xl': '24px',
            },
            spacing: {
                '18': '72px',
                '22': '88px',
            },
        },
    },
    plugins: [],
}
