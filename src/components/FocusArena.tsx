import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Clock, AlertTriangle, Crosshair } from 'lucide-react';
import { formatTime } from '@/lib/game-utils';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { useReactionGame } from '@/hooks/useReactionGame';
import { GameMode, GameStats, ReactionStats } from '@/types/game';
import ReactionTarget from '@/components/ReactionTarget';
import TypingChallenge from '@/components/games/TypingChallenge';
import MathBlitz from '@/components/games/MathBlitz';
import ReadingChallenge from '@/components/games/ReadingChallenge';
import WordleGame from '@/components/games/WordleGame';

interface FocusArenaProps {
  duration: number;
  gameMode: GameMode;
  opponentFocused: boolean;
  opponentStats?: GameStats | null;
  onLoseFocus: () => void;
  onTimerEnd: () => void;
  onGameStats?: (stats: GameStats) => void;
}

const FocusArena = ({ duration, gameMode, opponentFocused, onLoseFocus, onTimerEnd, onGameStats }: FocusArenaProps) => {
  const [elapsed, setElapsed] = useState(0);
  const { isVisible, leftCount } = usePageVisibility();
  const hasTriggeredLoss = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { targets, stats: reactionStats, hitTarget } = useReactionGame(gameMode === 'reaction');
  const [genericStats, setGenericStats] = useState<GameStats>({ score: 0, accuracy: 0, avgTime: 0 });

  // Convert reaction stats to generic stats for the reaction mode
  useEffect(() => {
    if (gameMode === 'reaction') {
      const total = reactionStats.hits + reactionStats.misses;
      const accuracy = total > 0 ? Math.round((reactionStats.hits / total) * 100) : 0;
      const gs: GameStats = { score: reactionStats.hits, accuracy, avgTime: reactionStats.avgReactionTime };
      setGenericStats(gs);
      onGameStats?.(gs);
    }
  }, [reactionStats, gameMode, onGameStats]);

  // For non-reaction modes, forward stats
  const handleModeStats = (stats: GameStats) => {
    setGenericStats(stats);
    onGameStats?.(stats);
  };

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

  const renderGameArea = () => {
    switch (gameMode) {
      case 'reaction':
        return (
          <>
            <div className="absolute top-2 left-3 flex items-center gap-1.5 text-muted-foreground">
              <Crosshair className="w-3 h-3" />
              <span className="text-[10px] font-mono">CLICK THE TARGETS</span>
            </div>
            <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-mono">
              <span className="text-primary">{reactionStats.hits} hit{reactionStats.hits !== 1 ? 's' : ''}</span>
              <span className="text-destructive">{reactionStats.misses} miss</span>
            </div>
            {targets.map(t => (
              <ReactionTarget key={t.id} target={t} onHit={hitTarget} />
            ))}
          </>
        );
      case 'typing':
        return <TypingChallenge active={true} onStats={handleModeStats} />;
      case 'math':
        return <MathBlitz active={true} onStats={handleModeStats} />;
      case 'reading':
        return <ReadingChallenge active={true} onStats={handleModeStats} />;
      case 'wordle':
        return <WordleGame active={true} onStats={handleModeStats} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="z-10 w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20 text-warning text-xs font-mono"
        >
          <AlertTriangle className="w-3 h-3" />
          DON'T SWITCH TABS — YOU'LL LOSE
        </motion.div>

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

        <div className="mt-6 mb-6 w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: 'var(--glow-primary)' }}
          />
        </div>

        {/* Game area */}
        <div className={`relative w-full bg-card/50 border border-border rounded-lg mb-6 overflow-hidden ${
          gameMode === 'reading' || gameMode === 'wordle' ? 'min-h-[350px]' : 'h-[250px] sm:h-[300px]'
        }`}>
          {renderGameArea()}
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

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
          className="mt-8 text-xs text-muted-foreground font-mono"
        >
          Stay sharp. Don't leave this tab.
        </motion.p>
      </div>
    </div>
  );
};

export default FocusArena;
