import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from '@/types/game';

const WORDS = [
  'focus', 'sharp', 'brain', 'quick', 'alert', 'power', 'speed', 'skill',
  'nerve', 'blaze', 'clash', 'spark', 'drive', 'force', 'steel', 'flame',
  'surge', 'pulse', 'storm', 'crush', 'rapid', 'swift', 'agile', 'bold',
  'brave', 'smart', 'vivid', 'crisp', 'elite', 'prime', 'ultra', 'hyper',
  'turbo', 'flash', 'laser', 'pixel', 'scope', 'drift', 'orbit', 'prism',
];

interface TypingChallengeProps {
  active: boolean;
  onStats: (stats: GameStats) => void;
}

interface FallingWord {
  id: string;
  word: string;
  spawnedAt: number;
}

const TypingChallenge = ({ active, onStats }: TypingChallengeProps) => {
  const [currentWord, setCurrentWord] = useState<FallingWord | null>(null);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawnWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord({ id: crypto.randomUUID(), word, spawnedAt: Date.now() });
    setInput('');

    dismissTimer.current = setTimeout(() => {
      setCurrentWord(null);
      setWrong(w => w + 1);
      setFlash('miss');
      setTimeout(() => setFlash(null), 400);
      scheduleNext();
    }, 4000);
  }, []);

  const scheduleNext = useCallback(() => {
    spawnTimer.current = setTimeout(() => spawnWord(), 1500 + Math.random() * 2000);
  }, [spawnWord]);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => spawnWord(), 2000);
    return () => {
      clearTimeout(t);
      if (spawnTimer.current) clearTimeout(spawnTimer.current);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [active, spawnWord]);

  useEffect(() => {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avg = correct > 0 ? Math.round(totalTime / correct) : 0;
    onStats({ score: correct, accuracy, avgTime: avg });
  }, [correct, wrong, totalTime, onStats]);

  const handleInput = (val: string) => {
    setInput(val);
    if (currentWord && val.toLowerCase() === currentWord.word.toLowerCase()) {
      const rt = Date.now() - currentWord.spawnedAt;
      setTotalTime(t => t + rt);
      setCorrect(c => c + 1);
      setFlash('hit');
      setTimeout(() => setFlash(null), 400);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      setCurrentWord(null);
      setInput('');
      scheduleNext();
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentWord]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative" onClick={() => inputRef.current?.focus()}>
      <div className="absolute top-2 left-3 flex items-center gap-1.5 text-muted-foreground">
        <span className="text-[10px] font-mono">TYPE THE WORD</span>
      </div>
      <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-mono">
        <span className="text-primary">{correct} correct</span>
        <span className="text-destructive">{wrong} missed</span>
      </div>

      <AnimatePresence mode="wait">
        {currentWord ? (
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-3xl font-mono font-bold text-primary mb-6 tracking-widest"
          >
            {currentWord.word.split('').map((char, i) => (
              <span
                key={i}
                className={
                  i < input.length
                    ? input[i]?.toLowerCase() === char.toLowerCase()
                      ? 'text-success'
                      : 'text-destructive'
                    : 'text-foreground'
                }
              >
                {char}
              </span>
            ))}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-sm font-mono text-muted-foreground mb-6"
          >
            get ready…
          </motion.p>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        value={input}
        onChange={e => handleInput(e.target.value)}
        className="bg-secondary/50 border border-border rounded-md px-4 py-2 text-center font-mono text-lg text-foreground focus:outline-none focus:border-primary/50 w-48"
        placeholder="type here"
        autoComplete="off"
        spellCheck={false}
      />

      {flash && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          className={`absolute top-1/3 text-sm font-mono font-bold ${flash === 'hit' ? 'text-success' : 'text-destructive'}`}
        >
          {flash === 'hit' ? '+1' : 'MISS'}
        </motion.div>
      )}
    </div>
  );
};

export default TypingChallenge;
