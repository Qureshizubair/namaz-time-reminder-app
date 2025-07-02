import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register service worker for notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(<App />);
