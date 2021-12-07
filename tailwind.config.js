module.exports = {
  purge: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "./src/style.css"],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [
      require('@tailwindcss/forms'),
      require('tailwindcss'),
      require('autoprefixer'),
  ],
};