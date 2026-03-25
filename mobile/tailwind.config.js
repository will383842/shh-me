/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#DCFB4E',
        dark: '#111111',
        'card-dark': '#1A1A1A',
        'border-dark': '#2A2A2A',
      },
      fontFamily: {
        display: ['Baloo2_600SemiBold'],
        'display-bold': ['Baloo2_700Bold'],
        'display-extra': ['Baloo2_800ExtraBold'],
        body: ['DMSans_400Regular'],
        'body-medium': ['DMSans_500Medium'],
        'body-semibold': ['DMSans_600SemiBold'],
        'body-bold': ['DMSans_700Bold'],
      },
    },
  },
  plugins: [],
};
