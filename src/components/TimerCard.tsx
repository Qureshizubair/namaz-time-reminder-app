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
    <Card className="w-full max-w-md mx-auto animate-fade-in shadow-prayer bg-gradient-to-br from-card via-card to-card/95 border-primary/20">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2 text-primary text-xl">
          <Timer className="h-7 w-7" />
          🕐 Prayer Countdown Timer
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Prepare your heart for Salah
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-5xl font-bold text-primary mb-3 font-mono tracking-wider">
              {formattedTime}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {isComplete ? "🕌 Time for Prayer!" : "Minutes until prayer reminder"}
            </div>
          </div>
          
          {/* Circular Progress */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary transition-all duration-1000"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 + 50 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 50%)`
              }}
            ></div>
            <div className="absolute inset-4 rounded-full bg-card/90 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>
          
          <Progress value={progress} className="w-full h-2" />
        </div>
        
        {/* Controls */}
        <div className="flex flex-col gap-3">
          {!isRunning && !isComplete && (
            <Button 
              variant="prayer" 
              onClick={handleStartTimer}
              className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
            >
              <Bell className="h-5 w-5" />
              🕌 Start Prayer Countdown
            </Button>
          )}
          
          {isRunning && (
            <Button 
              variant="secondary" 
              onClick={pause}
              className="w-full text-lg py-6"
            >
              ⏸️ Pause Timer
            </Button>
          )}
          
          {isComplete && (
            <div className="text-center space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="text-primary-glow font-bold text-xl animate-pulse mb-2">
                  🕌 Allahu Akbar! Time for Salah
                </div>
                <p className="text-sm text-muted-foreground">
                  May your prayers be accepted
                </p>
              </div>
              <Button 
                variant="prayer" 
                onClick={reset}
                className="w-full"
              >
                🔄 Reset Timer
              </Button>
            </div>
          )}
          
          {(isRunning || isComplete) && (
            <Button 
              variant="outline" 
              onClick={reset}
              className="w-full border-primary/30 hover:bg-primary/5"
            >
              🔄 Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};