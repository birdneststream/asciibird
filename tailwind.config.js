module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "./src/style.css"],
  darkMode: false,
  theme: {
    extend: {
      keyframes: {
        tooltip_show: {
          '0%' : { visibility: 'hidden', opacity: '0'},
          '75%' : { visibility: 'hidden', opacity: '0'},
          '100%' : { visibility: 'visible', opacity: '100'},
        }
      },
      animation: {
        tooltip_show: 'tooltip_show 1s ease forwards',
      }
    },
  },
  variants: {
    extend: {
      width: ['hover'],
      animation: ['group-hover'],
    },
  },
  plugins: [
      require('@tailwindcss/forms'),
      require('tailwindcss'),
      require('autoprefixer'),
  ],
};