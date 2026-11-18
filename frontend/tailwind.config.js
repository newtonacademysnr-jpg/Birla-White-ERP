/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      colors: {
        cream: {
          50: '#FFFEFA',
          100: '#FAF6E8',
          200: '#F5ECCB',
          300: '#EFE0AA',
          400: '#E6CF7E',
          500: '#D9B94C',
          base: '#FAF6E8',
          card: '#FFFDF7',
          border: '#EEDFB8',
          light: '#FFFDF9',
        },
        birlaRed: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#9E1B22', // Official Aditya Birla Crimson Red
          900: '#7F1318',
          950: '#4C090D',
        },
        gold: {
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          warm: '#FFC107'
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(127, 19, 24, 0.04), 0 2px 6px -1px rgba(127, 19, 24, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(127, 19, 24, 0.08), 0 8px 10px -6px rgba(127, 19, 24, 0.04)',
        'glow-red': '0 0 20px -3px rgba(158, 27, 34, 0.3)',
        'glow-cream': '0 0 20px -3px rgba(250, 246, 232, 0.5)',
      }
    },
  },
  plugins: [],
}
