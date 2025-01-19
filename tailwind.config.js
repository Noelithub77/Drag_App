/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
        serif: ['Epilogue', 'serif'],
      },
    },
  },
  plugins: [],
}