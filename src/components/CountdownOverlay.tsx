import { motion, AnimatePresence } from 'framer-motion';

interface CountdownOverlayProps {
  count: number; // 3, 2, 1, 0 (0 = GO)
}

const CountdownOverlay = ({ count }: CountdownOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center"
        >
          {count > 0 ? (
            <span className="font-mono text-9xl font-bold text-primary text-glow-primary">{count}</span>
          ) : (
            <span className="font-display text-8xl font-extrabold text-success text-glow-success">GO!</span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CountdownOverlay;
