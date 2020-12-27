const tailwindcss = require('tailwindcss');

module.exports = {
  purge: [
    './MySettings.js',
    'node_modules/vue-tailwind/dist/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
    tailwindcss,
  ],
};
