import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Countdown/elapsed timer hook for interview questions.
 * @param {number} initialSeconds - starting seconds (countdown) or 0 for stopwatch
 * @param {boolean} countDown - true for countdown, false for stopwatch
 */
export const useTimer = (initialSeconds = 0, countDown = false) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSeconds(prev => {
        if (countDown) {
          if (prev <= 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, countDown]);

  const reset = useCallback((newSeconds = initialSeconds) => {
    setSeconds(newSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const pause = useCallback(() => setIsRunning(false), []);
  const resume = useCallback(() => setIsRunning(true), []);

  const formatTime = useCallback((totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return { seconds, isRunning, reset, pause, resume, formatted: formatTime(seconds) };
};