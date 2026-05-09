import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production'
    ? 'https://asciibird.birdnest.live/'
    : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5180,
  },
  optimizeDeps: {
    include: ['vue-tailwind'],
  },
})
