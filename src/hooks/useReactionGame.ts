import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactionStats } from '@/types/game';

export interface Target {
  id: string;
  x: number; // % position
  y: number; // % position
  spawnedAt: number;
}

export function useReactionGame(active: boolean) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [stats, setStats] = useState<ReactionStats>({ hits: 0, misses: 0, avgReactionTime: 0 });
  const reactionTimes = useRef<number[]>([]);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const targetTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const scheduleSpawn = useCallback(() => {
    const delay = 3000 + Math.random() * 5000; // 3-8s
    spawnTimer.current = setTimeout(() => {
      const id = crypto.randomUUID();
      const target: Target = {
        id,
        x: 10 + Math.random() * 80, // 10-90%
        y: 10 + Math.random() * 80,
        spawnedAt: Date.now(),
      };
      setTargets(prev => [...prev, target]);

      // Auto-dismiss after 2s (miss)
      const dismissTimer = setTimeout(() => {
        setTargets(prev => {
          const still = prev.find(t => t.id === id);
          if (still) {
            setStats(s => ({ ...s, misses: s.misses + 1 }));
          }
          return prev.filter(t => t.id !== id);
        });
        targetTimers.current.delete(id);
      }, 2000);
      targetTimers.current.set(id, dismissTimer);

      scheduleSpawn();
    }, delay);
  }, []);

  useEffect(() => {
    if (!active) return;
    // Initial delay before first target
    const startDelay = setTimeout(() => scheduleSpawn(), 3000);
    return () => {
      clearTimeout(startDelay);
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      targetTimers.current.forEach(t => clearTimeout(t));
      targetTimers.current.clear();
    };
  }, [active, scheduleSpawn]);

  const hitTarget = useCallback((id: string) => {
    setTargets(prev => {
      const target = prev.find(t => t.id === id);
      if (target) {
        const rt = Date.now() - target.spawnedAt;
        reactionTimes.current.push(rt);
        const avg = Math.round(
          reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length
        );
        setStats(s => ({ ...s, hits: s.hits + 1, avgReactionTime: avg }));
        // Clear the dismiss timer
        const timer = targetTimers.current.get(id);
        if (timer) {
          clearTimeout(timer);
          targetTimers.current.delete(id);
        }
      }
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const reset = useCallback(() => {
    setTargets([]);
    setStats({ hits: 0, misses: 0, avgReactionTime: 0 });
    reactionTimes.current = [];
    if (spawnTimer.current) clearTimeout(spawnTimer.current);
    targetTimers.current.forEach(t => clearTimeout(t));
    targetTimers.current.clear();
  }, []);

  return { targets, stats, hitTarget, reset };
}
