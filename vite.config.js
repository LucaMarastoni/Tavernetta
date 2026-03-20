import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const siteBase = process.env.GITHUB_PAGES_BASE || '/Tavernetta/';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? siteBase : '/',
  plugins: [react()],
}));
