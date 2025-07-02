import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBn5jlCRzd0h2F3t56Z249ZvJyBBRKLlxM",
  authDomain: "namaz-reminder-app.firebaseapp.com",
  projectId: "namaz-reminder-app",
  storageBucket: "namaz-reminder-app.firebasestorage.app",
  messagingSenderId: "700860879919",
  appId: "1:700860879919:web:ae46c299df590d5a2ae2da",
  measurementId: "G-4LND1M5YF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging: any = null;

if (typeof window !== 'undefined') {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Firebase messaging initialization failed:', error);
  }
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.log('Firebase messaging not available');
      return null;
    }

    console.log('🔔 Requesting notification permission...');
    
    const permission = await Notification.requestPermission();
    console.log('📋 Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: 'BPueU-_JfSrz5qTQjFBHSRvo1FHjMI9mVBxNLoQ_YtoxEBn-NTW2eryAEckniFPsHnOG3FnDbDIQIl4QgbeH1lo'
      });
      
      if (currentToken) {
        console.log('🎯 FCM Token:', currentToken);
        return currentToken;
      } else {
        console.log('❌ No registration token available');
        return null;
      }
    } else {
      console.log('❌ Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('❗ Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      resolve(null);
      return;
    }
    
    onMessage(messaging, (payload) => {
      console.log('📨 Foreground message received:', payload);
      resolve(payload);
    });
  });

export { messaging };