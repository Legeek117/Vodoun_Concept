/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rouge-rituel': '#8E2420',
        'or': '#B8860B',
        'noir': '#1A1410',
        'ivoire': '#F4F0E6',
        'indigo-dan': '#1C4A66',
        'vert-sakpata': '#20603C',
        'brun': '#4A3120',
        'sable': '#D2B98E',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'source-sans': ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
