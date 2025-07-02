import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      const permission = await LocalNotifications.checkPermissions();
      setPermissionGranted(permission.display === 'granted');
    }
  };

  const requestPermissions = async () => {
    if (Capacitor.isNativePlatform()) {
      const permission = await LocalNotifications.requestPermissions();
      setPermissionGranted(permission.display === 'granted');
      return permission.display === 'granted';
    }
    return false;
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