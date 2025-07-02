import { useTimer } from '@/hooks/useTimer';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, Bell } from 'lucide-react';
import { useEffect } from 'react';

export const TimerCard = () => {
  const { timeLeft, formattedTime, isRunning, isComplete, progress, start, pause, reset } = useTimer(10);
  const { scheduleNamazReminder, permissionGranted, requestPermissions } = useNotifications();

  useEffect(() => {
    if (isComplete) {
      scheduleNamazReminder(0); // Immediate notification when timer completes
    }
  }, [isComplete, scheduleNamazReminder]);

  const handleStartTimer = async () => {
    if (!permissionGranted) {
      await requestPermissions();
    }
    start();
    // Schedule notification for when timer completes
    await scheduleNamazReminder(timeLeft / 60);
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-prayer">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-primary">
          <Timer className="h-6 w-6" />
          Prayer Timer (10 Minutes)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-2 font-mono">
            {formattedTime}
          </div>
          <Progress value={progress} className="w-full h-3" />
        </div>
        
        <div className="flex flex-col gap-3">
          {!isRunning && !isComplete && (
            <Button 
              variant="prayer" 
              onClick={handleStartTimer}
              className="w-full text-lg py-6"
            >
              <Bell className="h-5 w-5" />
              Start Prayer Reminder
            </Button>
          )}
          
          {isRunning && (
            <Button 
              variant="secondary" 
              onClick={pause}
              className="w-full text-lg py-6"
            >
              Pause Timer
            </Button>
          )}
          
          {isComplete && (
            <div className="text-center space-y-3">
              <div className="text-primary-glow font-medium animate-glow">
                🕌 Time for Prayer (Salah)
              </div>
              <Button 
                variant="prayer" 
                onClick={reset}
                className="w-full"
              >
                Reset Timer
              </Button>
            </div>
          )}
          
          {(isRunning || isComplete) && (
            <Button 
              variant="outline" 
              onClick={reset}
              className="w-full"
            >
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};