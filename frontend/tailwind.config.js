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
        brand: {
          blue: '#0076CE',
          blueLight: '#E0F2FE',
          blueHover: '#0062AD',
          navy: '#0B192C',
          gold: '#FFC107',
          yellow: '#FFD700',
          yellowLight: '#FFF9E6',
          crimson: '#9E1B22',
          slate: '#0F172A',
          charcoal: '#0B0F17',
        },
        birla: {
          crimson: '#9E1B22',
          darkRed: '#7A141A',
          lightRed: '#FEE2E2',
          blue: '#0076CE',
          navy: '#0C4A6E',
          sky: '#E0F2FE',
          gold: '#FFB800',
          orange: '#F97316'
        }
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'glow-blue': '0 0 20px -3px rgba(0, 118, 206, 0.35)',
        'glow-gold': '0 0 20px -3px rgba(255, 193, 7, 0.35)',
      }
    },
  },
  plugins: [],
}
