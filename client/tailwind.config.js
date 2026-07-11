/** @type {import('tailwindcss').Config} */
export default {
  // Only include Tailwind classes that are actually used in the build
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // WishDay brand palette
        primary: {
          DEFAULT: '#7C3AED', // purple
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        accent: {
          DEFAULT: '#F59E0B', // golden amber (birthday candles)
          light: '#FCD34D',
          dark: '#D97706',
        },
        rose: {
          gift: '#EC4899', // pink for gift highlights
        },
        surface: '#FFFFFF',
        background: '#FAF9FF', // very light lavender-white
      },
      fontFamily: {
        // System font stack — fast, readable, no external dependency
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(124,58,237,0.15)',
      },
    },
  },
  plugins: [],
};
