import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    console.log('Capacitor platform:', Capacitor.getPlatform());
    console.log('Is native platform:', Capacitor.isNativePlatform());
    
    if (Capacitor.isNativePlatform()) {
      console.log('📱 Initializing native platform notifications...');
      try {
        // Request local notifications permission first
        const localPermResult = await LocalNotifications.requestPermissions();
        console.log('📱 Local notifications permission:', localPermResult);
        
        if (localPermResult.display === 'granted') {
          setPermissionGranted(true);
          console.log('✅ Local notifications enabled');
        }

        // Also request push notifications for FCM
        const pushPermResult = await PushNotifications.requestPermissions();
        console.log('📱 Push notifications permission:', pushPermResult);
        
        if (pushPermResult.receive === 'granted') {
          // Register for push notifications
          await PushNotifications.register();
          console.log('📱 Push notifications registered');
        }

        // Set up push notification listeners
        PushNotifications.addListener('registration', (token) => {
          setFcmToken(token.value);
          console.log('📱 FCM Token received:', token.value);
        });

        PushNotifications.addListener('registrationError', (error) => {
          console.error('📱 FCM registration error:', String(error));
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📱 Push notification received:', notification);
          // Show local notification when push is received
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
          console.log('📱 Push notification action performed:', notification);
        });

      } catch (error) {
        console.error('📱 Native notification setup error:', error);
      }
      } else {
        // Web platform initialization
        console.log('🌐 Initializing web platform notifications...');
        await checkPermissions();
        setupMessageListener();
      }
  };

  const checkPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        console.log('📱 Checking native permissions...');
        // Check both local and push notifications permission for mobile
        const localPerm = await LocalNotifications.checkPermissions();
        const pushPerm = await PushNotifications.checkPermissions();
        console.log('📱 Local notifications permission:', localPerm);
        console.log('📱 Push notifications permission:', pushPerm);
        
        const granted = localPerm.display === 'granted' && pushPerm.receive === 'granted';
        setPermissionGranted(granted);
        console.log('📱 Overall permission granted:', granted);
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
        console.log('📱 Local notification scheduled for native platform');
      } else {
        // Web notification - use service worker for mobile compatibility
        if ('serviceWorker' in navigator && 'Notification' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            
            if (delay === 0) {
              // For immediate notifications, try service worker first, fallback to direct
              if (registration && registration.showNotification) {
                await registration.showNotification(title, {
                  body,
                  icon: '/favicon.ico',
                  tag: 'namaz-reminder',
                  requireInteraction: true,
                  badge: '/favicon.ico'
                });
                console.log('🔔 Service worker notification sent');
              } else {
                // Fallback for desktop browsers
                new Notification(title, {
                  body,
                  icon: '/favicon.ico',
                  tag: 'namaz-reminder'
                });
                console.log('🔔 Direct notification sent');
              }
              return;
            }

            // For delayed notifications
            setTimeout(async () => {
              if (registration && registration.showNotification) {
                await registration.showNotification(title, {
                  body,
                  icon: '/favicon.ico',
                  tag: 'namaz-reminder',
                  requireInteraction: true,
                  badge: '/favicon.ico'
                });
                console.log('🔔 Delayed service worker notification sent');
              } else {
                new Notification(title, {
                  body,
                  icon: '/favicon.ico',
                  tag: 'namaz-reminder'
                });
                console.log('🔔 Delayed direct notification sent');
              }
            }, delay);
          } catch (swError) {
            console.log('Service worker notification failed, trying direct:', swError);
            // Fallback to direct notification
            if (delay === 0) {
              new Notification(title, {
                body,
                icon: '/favicon.ico',
                tag: 'namaz-reminder'
              });
            } else {
              setTimeout(() => {
                new Notification(title, {
                  body,
                  icon: '/favicon.ico',
                  tag: 'namaz-reminder'
                });
              }, delay);
            }
          }
        } else {
          throw new Error('Notifications not supported in this browser');
        }
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