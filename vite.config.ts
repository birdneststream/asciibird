import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
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
      'hotkeys-js',
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
        manualChunks(id) {
          if (id.includes('node_modules/vue/') || id.includes('node_modules/pinia/')) {
            return 'vendor-vue';
          }
          if (id.includes('node_modules/@headlessui/') || id.includes('node_modules/@vueuse/')) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
})
