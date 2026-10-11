import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  if (!env.VITE_API_BASE_URL?.trim()) {
    throw new Error("VITE_API_BASE_URL is required for a frontend build");
  }
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icon.svg"],
        manifest: {
          name: "Career Guidance AI",
          short_name: "Career Guidance AI",
          description: "Career intelligence for students",
          theme_color: "#020617",
          background_color: "#020617",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/icon.svg",
              sizes: "any",
              type: "image/svg+xml",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          navigateFallback: "/index.html",
          runtimeCaching: [
            { urlPattern: /\/api\//, handler: "NetworkOnly", method: "GET" },
          ],
        },
      }),
    ],
    server: { port: 5173 },
  };
});
