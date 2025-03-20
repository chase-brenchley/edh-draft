/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mtg': {
          'white': '#F8F8F8',
          'blue': '#0E68AB',
          'black': '#1A1A1A',
          'red': '#D32029',
          'green': '#00733E',
          'colorless': '#C4C4C4',
        }
      },
      animation: {
        'card-flip': 'flip 0.6s ease-in-out',
        'pack-open': 'packOpen 0.8s ease-out',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        packOpen: {
          '0%': { transform: 'scale(0.1) rotate(0deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(360deg)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
} 