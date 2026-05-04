import { defineConfig } from 'vite';
import { resolve } from 'path';
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
//  base: '/test-warera1/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  build: {
    outDir: 'static/dist',
    sourcemap: false,
    manifest: true,
    rollupOptions: {
      input: './src/main.ts',
      /*
      output: {
        manualChunks: {
          three: ['three']
        }
      }
      */
    }
  },
  plugins: [vue(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 8000
  },
  preview: {
    host: '0.0.0.0',
    port: 8000
  }
});
