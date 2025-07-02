import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.819966c993924353a7abf9fe3af7a2b4',
  appName: 'Namaz Time Reminder',
  webDir: 'dist',
  server: {
    url: 'https://819966c9-9392-4353-a7ab-f9fe3af7a2b4.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;