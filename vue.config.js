module.exports = {
  lintOnSave: false,

  css: {
    extract: false
  },

  publicPath: process.env.NODE_ENV === 'production' ? 'https://asciibird.birdnest.live/' : ''
};
