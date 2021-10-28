import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from 'vite-plugin-yaml'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    yaml,
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '/src'),
    },
  },
  server: {
    fs: {
      // ignores `Unrestricted file system access to "/__webpack_hmr"` error
      strict: false,
    },
  },
})
