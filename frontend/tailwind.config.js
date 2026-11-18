/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        birla: {
          crimson: '#A02225',
          darkRed: '#7F1D1D',
          lightRed: '#FEE2E2',
          blue: '#0087CF',
          navy: '#0C4A6E',
          sky: '#E0F2FE',
          gold: '#FFC961',
          orange: '#E46F2E'
        }
      }
    },
  },
  plugins: [],
}
