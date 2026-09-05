import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const cookie = 'token=ZDczOTBiYjgtZWRkZC00NWNmLWI3YWMtOTUwODkwMGE3NmQy';
const base = process.env.NEXUS_BASE || '/flow-designer/';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base,
  resolve: {
    alias: {
      '@xbeeant/flow-designer': path.resolve(__dirname, '../lib'),
    },
  },
  server: {
    proxy: {
      '/forms/api': {
        target: 'http://localhost:8080',
        changeOrigin: true, // 允许跨域
        headers: {
          Cookie: cookie,
        },
      },
    },
  },
});
