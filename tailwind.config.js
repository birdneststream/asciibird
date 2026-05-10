import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/style.scss",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    forms,
  ],
}
