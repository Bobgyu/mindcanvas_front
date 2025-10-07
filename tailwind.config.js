/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': 'rgb(39, 192, 141)',
        'primary-green-hover': 'rgb(35, 173, 127)',
        'primary-green-active': 'rgb(32, 154, 113)',
        'background-green': '#30E8AB',
        'light-green': '#CEF4E7',
      },
      width: {
        '29rem': '29rem',
      },
      height: {
        '58rem': '58rem',
      }
    },
  },
  plugins: [],
}
