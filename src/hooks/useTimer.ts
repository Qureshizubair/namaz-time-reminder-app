import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialMinutes: number = 10) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsComplete(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialMinutes * 60);
    setIsRunning(false);
    setIsComplete(false);
  }, [initialMinutes]);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const progress = ((initialMinutes * 60 - timeLeft) / (initialMinutes * 60)) * 100;

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isRunning,
    isComplete,
    progress,
    start,
    pause,
    reset
  };
};