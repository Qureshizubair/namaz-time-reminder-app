import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.namazreminder',
  appName: 'Namaz Time Reminder',
  webDir: 'dist',
  server: {
    url: 'https://819966c9-9392-4353-a7ab-f9fe3af7a2b4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
};

export default config;