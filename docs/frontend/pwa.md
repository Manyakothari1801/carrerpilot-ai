# PWA testing

The production build generates `manifest.webmanifest`, `sw.js`, and Workbox assets. Static application-shell files are precached. `/api/` uses `NetworkOnly`, so authenticated API responses are not service-worker cached.

Run `npm run build` and `npm run preview` in `frontend`, then open the localhost URL in Chrome or Edge. Use the install-app action and inspect **Application > Manifest** and **Application > Service Workers** in DevTools. Offline mode should reopen the previously loaded shell; authenticated data still requires the backend and network.

The SVG icon is a Phase 2 branding placeholder. Add production maskable PNG icons before public distribution.
