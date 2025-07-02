import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, BellOff } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const NotificationButton = () => {
  const { permissionGranted, requestPermissions, scheduleNamazReminder } = useNotifications();
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const handleScheduleNotification = async () => {
    setIsScheduling(true);
    console.log('🔔 Schedule button clicked, permission status:', permissionGranted);
    
    try {
      if (!permissionGranted) {
        console.log('❌ No permission, requesting...');
        const granted = await requestPermissions();
        console.log('📋 Permission request result:', granted);
        if (!granted) {
          console.log('❌ Permission denied');
          toast({
            title: "Permission Required",
            description: "Please allow notifications to receive prayer reminders.",
            variant: "destructive"
          });
          setIsScheduling(false);
          return;
        }
      }

      console.log('✅ Scheduling notification for 10 minutes...');
      await scheduleNamazReminder(10); // 10 minutes from now
      
      toast({
        title: "Prayer Reminder Set",
        description: "You will be notified in 10 minutes for prayer time.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to schedule notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleInstantNotification = async () => {
    console.log('⚡ Instant notification button clicked, permission status:', permissionGranted);
    try {
      if (!permissionGranted) {
        console.log('❌ No permission, requesting...');
        const granted = await requestPermissions();
        console.log('📋 Permission request result:', granted);
        if (!granted) {
          console.log('❌ Permission denied');
          toast({
            title: "Permission Required",
            description: "Please allow notifications to receive prayer reminders.",
            variant: "destructive"
          });
          return;
        }
      }

      console.log('⚡ Sending instant notification...');
      await scheduleNamazReminder(0); // Immediate notification
      
      toast({
        title: "Prayer Notification Sent",
        description: "May Allah accept your prayers.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send notification. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-prayer animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          {permissionGranted ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
          Notification Center
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {permissionGranted ? "Notifications enabled" : "Please enable notifications"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          variant="notification" 
          onClick={handleScheduleNotification}
          disabled={isScheduling}
          className="w-full text-lg py-6"
        >
          <Bell className="h-5 w-5" />
          {isScheduling ? "Scheduling..." : "Schedule 10min Reminder"}
        </Button>
        
        <Button 
          variant="golden" 
          onClick={handleInstantNotification}
          className="w-full"
        >
          <Bell className="h-4 w-4" />
          Send Instant Reminder
        </Button>
        
        {!permissionGranted && (
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Tap "Schedule 10min Reminder" to enable notifications
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};