// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBn5jlCRzd0h2F3t56Z249ZvJyBBRKLlxM",
  authDomain: "namaz-reminder-app.firebaseapp.com",
  projectId: "namaz-reminder-app",
  storageBucket: "namaz-reminder-app.firebasestorage.app",
  messagingSenderId: "700860879919",
  appId: "1:700860879919:web:ae46c299df590d5a2ae2da",
  measurementId: "G-4LND1M5YF3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background Message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Namaz Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'Time for prayer',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'namaz-reminder',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});