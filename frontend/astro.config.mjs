import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server', // Enable server-side rendering for API routes
  adapter: vercel(), // Use Vercel serverless adapter
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    })
  ],
  server: {
    port: 4321,
    host: true
  },
  vite: {
    ssr: {
      noExternal: ['three']
    }
  }
});