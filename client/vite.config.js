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
    port: 5173, // จะใช้ port อะไรก็ได้
    strictPort: true, // ถ้า port นี้ถูกใช้ จะ error เลย
    allowedHosts: [
      'babe-58-8-175-83.ngrok-free.app', // ใส่ domain ngrok
    ],
  },
});
