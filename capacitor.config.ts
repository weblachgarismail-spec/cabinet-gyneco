import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cabinet.gyneco',
  appName: 'Cabinet Gynéco',
  webDir: 'out',
  server: {
    // Dev: http://localhost:3000 — Prod: remplacer par l'URL Vercel
    url: 'https://gynecologue-app-b2er.vercel.app',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
