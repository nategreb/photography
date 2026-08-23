import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nategrebelsky.com',
  build: {
    assets: '_assets',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
