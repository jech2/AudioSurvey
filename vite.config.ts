import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  assetsInclude: ['**/*.wav'],
  server: {
    proxy: {
      '/api': { 
        target: 'http://127.0.0.1:8000', // FastAPI 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // '/api' 프리픽스 제거
      }
    },
    host: '0.0.0.0',
    allowedHosts: [
      'your-host-name'
    ],
  },
  
});