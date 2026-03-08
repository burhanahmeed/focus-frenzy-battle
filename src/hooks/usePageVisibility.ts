import { useState, useEffect, useCallback } from 'react';

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(true);
  const [leftCount, setLeftCount] = useState(0);
  const [lastLeftAt, setLastLeftAt] = useState<number | null>(null);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      setIsVisible(false);
      setLeftCount(prev => prev + 1);
      setLastLeftAt(Date.now());
    } else {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', () => {
      setIsVisible(false);
      setLeftCount(prev => prev + 1);
      setLastLeftAt(Date.now());
    });
    window.addEventListener('focus', () => setIsVisible(true));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return { isVisible, leftCount, lastLeftAt };
}
