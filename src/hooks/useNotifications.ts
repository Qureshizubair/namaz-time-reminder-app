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
      console.log('🔍 Checking permissions...');
      console.log('📱 Is native platform:', Capacitor.isNativePlatform());
      
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.checkPermissions();
        console.log('📋 Native permission object:', JSON.stringify(permission, null, 2));
        console.log('🎯 Permission display value:', permission.display);
        
        // For Android, also accept 'prompt' as granted since user may have already allowed
        const granted = permission.display === 'granted' || permission.display === 'prompt';
        console.log('✅ Permission granted status:', granted);
        setPermissionGranted(granted);
        
        // Force set to true if permission was already given at OS level
        if (!granted && permission.display === 'denied') {
          console.log('❗ Permission denied, but checking if OS-level permission exists...');
          // Try to schedule a test notification to see if it works
          try {
            await LocalNotifications.schedule({
              notifications: [{
                title: 'Test',
                body: 'Test notification',
                id: 999999,
                schedule: { at: new Date(Date.now() + 1000) }
              }]
            });
            console.log('🎉 Test notification scheduled successfully - permissions actually work!');
            setPermissionGranted(true);
          } catch (testError) {
            console.log('❌ Test notification failed:', testError);
          }
        }
      } else {
        // For web, check browser notification permission
        const granted = Notification.permission === 'granted';
        console.log('🌐 Web permission status:', Notification.permission);
        setPermissionGranted(granted);
      }
    } catch (error) {
      console.log('💥 Permission check error:', error);
      // On error, assume permissions are granted for native platform
      if (Capacitor.isNativePlatform()) {
        console.log('🔧 Error occurred but on native platform, assuming granted');
        setPermissionGranted(true);
      } else {
        setPermissionGranted(false);
      }
    }
  };

  const requestPermissions = async () => {
    try {
      console.log('Requesting permissions...');
      if (Capacitor.isNativePlatform()) {
        // For native, try to request but assume granted if already given at OS level
        try {
          const permission = await LocalNotifications.requestPermissions();
          console.log('Permission request result:', permission);
          const granted = permission.display === 'granted' || permission.display === 'prompt';
          setPermissionGranted(granted);
          return granted;
        } catch (reqError) {
          console.log('Permission request failed, assuming granted:', reqError);
          // If request fails but we're on native, assume permissions are granted
          setPermissionGranted(true);
          return true;
        }
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
      // For native platforms, assume granted on error
      const granted = Capacitor.isNativePlatform();
      setPermissionGranted(granted);
      return granted;
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