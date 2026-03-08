import { motion } from 'framer-motion';
import { Trophy, Skull, Handshake, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '@/lib/game-utils';
import { GameResult } from '@/types/game';

interface ResultScreenProps {
  result: GameResult;
  yourTime: number;
  opponentTime: number;
  onRematch: () => void;
}

const ResultScreen = ({ result, yourTime, opponentTime, onRematch }: ResultScreenProps) => {
  const navigate = useNavigate();

  const config = {
    WIN: {
      icon: Trophy,
      title: 'VICTORY',
      subtitle: 'You outlasted your opponent!',
      color: 'text-success',
      glow: 'text-glow-success',
      borderColor: 'border-success/30',
      bgGlow: 'bg-success/5',
    },
    LOSE: {
      icon: Skull,
      title: 'DEFEATED',
      subtitle: 'You lost focus. Train harder.',
      color: 'text-destructive',
      glow: 'text-glow-destructive',
      borderColor: 'border-destructive/30',
      bgGlow: 'bg-destructive/5',
    },
    TIE: {
      icon: Handshake,
      title: 'DRAW',
      subtitle: 'Both players survived the full duration!',
      color: 'text-primary',
      glow: 'text-glow-primary',
      borderColor: 'border-primary/30',
      bgGlow: 'bg-primary/5',
    },
  };

  const c = config[result || 'TIE'];
  const Icon = c.icon;

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-4 relative">
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ${c.bgGlow} rounded-full blur-[120px] pointer-events-none`} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="z-10 text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Icon className={`w-20 h-20 mx-auto mb-4 ${c.color}`} />
        </motion.div>

        <h1 className={`font-display text-5xl font-extrabold ${c.color} ${c.glow} mb-2`}>
          {c.title}
        </h1>
        <p className="text-muted-foreground mb-8">{c.subtitle}</p>

        {/* Stats */}
        <div className={`bg-card border ${c.borderColor} rounded-lg p-5 mb-6`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">YOUR TIME</p>
              <p className="font-mono text-2xl font-bold text-foreground">{formatTime(yourTime)}</p>
            </div>
            <div>
              <p className="text-xs font-mono text-muted-foreground mb-1">OPPONENT</p>
              <p className="font-mono text-2xl font-bold text-foreground">{formatTime(opponentTime)}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRematch}
            className="flex-1 py-3.5 px-6 rounded-lg bg-primary text-primary-foreground font-semibold glow-primary hover:glow-primary-intense transition-shadow flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Rematch
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="py-3.5 px-5 rounded-lg bg-secondary text-secondary-foreground border border-border hover:border-primary/30 transition-colors"
          >
            <Home className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultScreen;
