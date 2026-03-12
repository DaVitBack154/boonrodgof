import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    host: true, // สำคัญมาก ให้เข้าจากภายนอกได้
    port: 3200, // จะใช้ port อะไรก็ได้
    strictPort: true, // ถ้า port นี้ถูกใช้ จะ error เลย
    allowedHosts: [
      'frenetically-melanospermous-bonita.ngrok-free.dev', // ใส่ domain ngrok (ลบ https:// ออก)
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // URL ของ Backend
        changeOrigin: true,
      },
    },
  },
});
