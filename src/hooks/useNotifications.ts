import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    checkPermissions();
    setupMessageListener();
    if (Capacitor.isNativePlatform()) {
      // Initialize PushNotifications for FCM on Android
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });
      PushNotifications.addListener('registration', (token) => {
        setFcmToken(token.value);
        setPermissionGranted(true);
        console.log('FCM Token:', token.value);
        alert('Push notification registration successful!');
      });
      PushNotifications.addListener('registrationError', (error) => {
        setPermissionGranted(false);
        setFcmToken(null);
        console.error('FCM registration error:', error);
        alert('Push notification registration failed: ' + String(error));
      });
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        // Optionally show a local notification or alert
        LocalNotifications.schedule({
          notifications: [
            {
              title: notification.title || 'Notification',
              body: notification.body || '',
              id: Date.now(),
              schedule: { at: new Date() },
              sound: null,
              attachments: null,
              actionTypeId: '',
              extra: null
            }
          ]
        });
      });
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });
    } else {
      // On web, request notification permissions on first load
      requestPermissions();
    }
  }, []);

  const checkPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Check local notifications permission for mobile
        const { display } = await LocalNotifications.checkPermissions();
        setPermissionGranted(display === 'granted');
      } else {
        // Check web notifications
        console.log('🔍 Checking Firebase notification permissions...');
        if (!('Notification' in window)) {
          console.log('❌ Browser does not support notifications');
          setPermissionGranted(false);
          return;
        }

        const permission = await Notification.permission;
        setPermissionGranted(permission === 'granted');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // Request local notifications permission for mobile
        const { display } = await LocalNotifications.requestPermissions();
        const granted = display === 'granted';
        setPermissionGranted(granted);
        return granted;
      } else {
        // Request web notifications permission
        console.log('🔔 Requesting permissions...');
        const token = await requestNotificationPermission();
        const granted = token !== null;
        setPermissionGranted(granted);
        if (granted) {
          setFcmToken(token);
        } else {
          console.error('FCM token not retrieved. Notifications will not work.');
          alert('FCM token not retrieved. Please check your browser settings or try again.');
        }
        return granted;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      alert('Error requesting notification permissions: ' + (error?.message || error));
      return false;
    }
  };

  const setupMessageListener = () => {
    if (!Capacitor.isNativePlatform()) {
      onMessageListener()
        .then((payload: any) => {
          if (payload) {
            console.log('📨 Received foreground message:', payload);
            if (payload.notification) {
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: '/favicon.ico'
              });
            }
          }
        })
        .catch((err) => console.log('Message listener error:', err));
    }
  };

  const scheduleNotification = async (title: string, body: string, delay: number = 0) => {
    if (!permissionGranted) {
      const error = new Error('Notifications not permitted');
      console.log('❌ Notifications not permitted');
      throw error;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        // Schedule local notification for mobile
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + delay) },
              sound: null,
              attachments: null,
              actionTypeId: '',
              extra: null
            }
          ]
        });
      } else {
        // Web notification
        if (delay === 0) {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'namaz-reminder'
          });
          return;
        }

        setTimeout(() => {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'namaz-reminder'
          });
        }, delay);
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  };

  const scheduleNamazReminder = async (delayMinutes: number = 10) => {
    const delayMs = delayMinutes * 60 * 1000;
    try {
      await scheduleNotification(
        'Namaz Time Reminder',
        'It\'s time for your prayer (Salah). May Allah accept your prayers.',
        delayMs
      );
    } catch (error) {
      throw error;
    }
  };

  return {
    permissionGranted,
    fcmToken,
    requestPermissions,
    scheduleNotification,
    scheduleNamazReminder
  };
};