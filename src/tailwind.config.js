/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        header: ["Work Sans", "sans-serif"],
      },
      colors: {
        'fii-bg': '#F4EFE8',
        'fii-purple': '#9b8ec7',
        'fii-navy': '#1a1a2e',
        'fii-green-activ': '#22c55e', 
      }
    },
  },
  plugins: [],
}