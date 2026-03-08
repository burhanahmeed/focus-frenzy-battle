import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from '@/hooks/useReactionGame';

interface ReactionTargetProps {
  target: Target;
  onHit: (id: string) => void;
}

const ReactionTarget = ({ target, onHit }: ReactionTargetProps) => {
  const [hit, setHit] = useState(false);

  const handleClick = () => {
    if (hit) return;
    setHit(true);
    onHit(target.id);
  };

  return (
    <AnimatePresence>
      {!hit && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={handleClick}
          className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 border-2 border-primary cursor-pointer hover:bg-primary/40 transition-colors focus:outline-none"
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
            boxShadow: 'var(--glow-primary)',
          }}
        >
          <motion.div
            className="absolute inset-1 rounded-full bg-primary/60"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </motion.button>
      )}
      {hit && (
        <motion.span
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -30, scale: 1.5 }}
          transition={{ duration: 0.5 }}
          className="absolute text-primary font-mono font-bold text-sm pointer-events-none"
          style={{ left: `${target.x}%`, top: `${target.y}%` }}
        >
          +1
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default ReactionTarget;
