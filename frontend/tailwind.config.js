/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        teal: {
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #115e59 100%)',
        'card-gradient': 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-sm': 'bounce 1s infinite',
      },
      boxShadow: {
        'teal': '0 4px 24px rgba(13, 148, 136, 0.25)',
        'teal-lg': '0 8px 40px rgba(13, 148, 136, 0.35)',
      }
    },
  },
  plugins: [],
};
