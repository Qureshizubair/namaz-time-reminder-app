import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
    setupMessageListener();
  }, []);

  const checkPermissions = async () => {
    try {
      console.log('🔍 Checking Firebase notification permissions...');
      
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        console.log('❌ Browser does not support notifications');
        setPermissionGranted(false);
        return;
      }

      const permission = Notification.permission;
      console.log('📋 Current permission status:', permission);
      
      const granted = permission === 'granted';
      setPermissionGranted(granted);
      
      if (granted) {
        // Get FCM token if permission already granted
        const token = await requestNotificationPermission();
        setFcmToken(token);
      }
    } catch (error) {
      console.log('💥 Permission check error:', error);
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('🔔 Requesting Firebase permissions...');
      
      const token = await requestNotificationPermission();
      const granted = token !== null;
      
      setPermissionGranted(granted);
      setFcmToken(token);
      
      return granted;
    } catch (error) {
      console.log('💥 Permission request error:', error);
      return false;
    }
  };

  const setupMessageListener = () => {
    onMessageListener()
      .then((payload: any) => {
        if (payload) {
          console.log('📨 Received foreground message:', payload);
          // Show notification in foreground
          if (payload.notification) {
            new Notification(payload.notification.title, {
              body: payload.notification.body,
              icon: '/favicon.ico'
            });
          }
        }
      })
      .catch((err) => console.log('Message listener error:', err));
  };

  const scheduleNotification = async (title: string, body: string, delay: number = 0) => {
    if (!permissionGranted) {
      console.log('❌ Notifications not permitted');
      return;
    }

    try {
      // For immediate notifications, show directly
      if (delay === 0) {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'namaz-reminder'
        });
        return;
      }

      // For delayed notifications, use setTimeout
      setTimeout(() => {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          tag: 'namaz-reminder'
        });
      }, delay);

      console.log(`⏰ Notification scheduled for ${delay}ms from now`);
    } catch (error) {
      console.error('💥 Error scheduling notification:', error);
    }
  };

  const scheduleNamazReminder = async (delayMinutes: number = 10) => {
    const delayMs = delayMinutes * 60 * 1000;
    await scheduleNotification(
      'Namaz Time Reminder',
      'It\'s time for your prayer (Salah). May Allah accept your prayers.',
      delayMs
    );
  };

  return {
    permissionGranted,
    fcmToken,
    requestPermissions,
    scheduleNotification,
    scheduleNamazReminder
  };
};