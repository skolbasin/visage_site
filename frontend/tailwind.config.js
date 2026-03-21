/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: '#FFD700',
        dark: '#111111',
        darkgray: '#1E1E1E',
      },
    },
  },
  plugins: [],
}