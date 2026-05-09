import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5180,
  },
  optimizeDeps: {
    include: [
      'vue-tailwind',
      'node-emoji',
      'vue-file-toolbar-menu',
      'material-icons',
    ],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vuex', 'vue-template-compiler'],
          'vendor-ui': [
            'vue-tailwind',
            'vue-file-toolbar-menu',
            'vue-draggable-resizable',
            'vue-toasted',
            'vue-clipboard2',
            'vue-slider-component',
          ],
        },
      },
    },
  },
})
