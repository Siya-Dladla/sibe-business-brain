import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4b97af77c80b45c9ac4f80776d292811',
  appName: 'sibe-business-brain',
  webDir: 'dist',
  server: {
    url: 'https://4b97af77-c80b-45c9-ac4f-80776d292811.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
