import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      console.log('Checking permissions...');
      console.log('Is native platform:', Capacitor.isNativePlatform());
      
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.checkPermissions();
        console.log('Native permission status:', permission);
        setPermissionGranted(permission.display === 'granted');
      } else {
        // For web, check browser notification permission
        const granted = Notification.permission === 'granted';
        console.log('Web permission status:', Notification.permission);
        setPermissionGranted(granted);
      }
    } catch (error) {
      console.log('Permission check error:', error);
      setPermissionGranted(false);
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('Requesting permissions...');
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.requestPermissions();
        console.log('Permission request result:', permission);
        const granted = permission.display === 'granted';
        setPermissionGranted(granted);
        return granted;
      } else {
        // For web
        if ('Notification' in window && Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission();
          const granted = permission === 'granted';
          setPermissionGranted(granted);
          return granted;
        }
        return Notification.permission === 'granted';
      }
    } catch (error) {
      console.log('Permission request error:', error);
      return false;
    }
  };

  const scheduleNotification = async (title: string, body: string, delay: number = 0) => {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web - show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      }
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: delay > 0 ? { at: new Date(Date.now() + delay) } : undefined,
            actionTypeId: "",
            attachments: undefined,
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
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
    requestPermissions,
    scheduleNotification,
    scheduleNamazReminder
  };
};