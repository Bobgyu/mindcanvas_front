/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-green': '#3a9d1f',
        'primary-green-hover': '#3fc41a',
        'primary-green-active': '#338a1a',
        'background-green': '#a3ec66',
        'light-green': '#dff5cd',
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
