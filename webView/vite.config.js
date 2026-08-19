import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      // Enable PWA/service worker during local development
      devOptions: {
        enabled: true,
      },

      manifest: {
        id: "/",
        name: "Exit Ramp",
        short_name: "Exit Ramp",
        description: "Exit Ramp Application",

        start_url: "/",
        scope: "/",

        display: "standalone",
        orientation: "portrait-primary",

        theme_color: "#ffffff",
        background_color: "#ffffff",

        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],

  server: {
    host: "0.0.0.0",
    allowedHosts: ["exitramp.co", "test.exitramp.co"],
    port: 5173,
  },
});