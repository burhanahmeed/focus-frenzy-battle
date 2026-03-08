import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Clock, AlertTriangle } from 'lucide-react';
import { formatTime } from '@/lib/game-utils';
import { usePageVisibility } from '@/hooks/usePageVisibility';

interface FocusArenaProps {
  duration: number;
  opponentFocused: boolean;
  onLoseFocus: () => void;
  onTimerEnd: () => void;
}

const FocusArena = ({ duration, opponentFocused, onLoseFocus, onTimerEnd }: FocusArenaProps) => {
  const [elapsed, setElapsed] = useState(0);
  const { isVisible, leftCount } = usePageVisibility();
  const hasTriggeredLoss = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= duration) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimerEnd();
          return duration;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [duration, onTimerEnd]);

  useEffect(() => {
    if (!isVisible && !hasTriggeredLoss.current && leftCount > 0) {
      hasTriggeredLoss.current = true;
      onLoseFocus();
    }
  }, [isVisible, leftCount, onLoseFocus]);

  const progress = (elapsed / duration) * 100;
  const remaining = duration - elapsed;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      {/* Background pulse */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="z-10 w-full max-w-md text-center">
        {/* Warning banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-mono"
        >
          <AlertTriangle className="w-3 h-3" />
          DON'T SWITCH TABS — YOU'LL LOSE
        </motion.div>

        {/* Main timer */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-muted-foreground text-xs font-mono mb-2 tracking-wider">FOCUSED FOR</p>
          <div className="font-mono text-7xl sm:text-8xl font-bold text-foreground mb-2 tabular-nums">
            {formatTime(elapsed)}
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            {formatTime(remaining)} remaining
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="mt-8 mb-10 w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: 'var(--glow-primary)' }}
          />
        </div>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-xs font-mono text-muted-foreground">YOU</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-success">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-semibold">Focused</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${opponentFocused ? 'bg-success animate-pulse-glow' : 'bg-destructive'}`} />
              <span className="text-xs font-mono text-muted-foreground">OPPONENT</span>
            </div>
            <div className={`flex items-center justify-center gap-1 ${opponentFocused ? 'text-success' : 'text-destructive'}`}>
              {opponentFocused ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm font-semibold">{opponentFocused ? 'Focused' : 'Lost Focus!'}</span>
            </div>
          </div>
        </div>

        {/* Focus tips */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          className="mt-10 text-xs text-muted-foreground font-mono"
        >
          Breathe. Stay present. You've got this.
        </motion.p>
      </div>
    </div>
  );
};

export default FocusArena;
