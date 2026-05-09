import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/style.scss",
  ],
  theme: {
    extend: {
      keyframes: {
        tooltip_show: {
          '0%': { visibility: 'hidden', opacity: '0' },
          '30%': { visibility: 'visible', opacity: '100' },
          '100%': { visibility: 'visible', opacity: '100' },
        },
      },
      animation: {
        tooltip_show: 'tooltip_show 1s ease forwards',
      },
    },
  },
  plugins: [
    forms,
  ],
}
