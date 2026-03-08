import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from '@/types/game';

interface MathBlitzProps {
  active: boolean;
  onStats: (stats: GameStats) => void;
}

interface MathProblem {
  id: string;
  question: string;
  answer: number;
  spawnedAt: number;
}

function generateProblem(): { question: string; answer: number } {
  const ops = ['+', '-', '×'] as const;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;

  switch (op) {
    case '+':
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      answer = a + b;
      break;
    case '-':
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * a) + 1;
      answer = a - b;
      break;
    case '×':
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
      break;
    default:
      a = 1; b = 1; answer = 2;
  }
  return { question: `${a} ${op} ${b}`, answer };
}

const MathBlitz = ({ active, onStats }: MathBlitzProps) => {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawnProblem = useCallback(() => {
    const { question, answer } = generateProblem();
    setProblem({ id: crypto.randomUUID(), question, answer, spawnedAt: Date.now() });
    setInput('');

    dismissTimer.current = setTimeout(() => {
      setProblem(null);
      setWrong(w => w + 1);
      setFlash('miss');
      setTimeout(() => setFlash(null), 400);
      setTimeout(() => spawnProblem(), 1000);
    }, 6000);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => spawnProblem(), 2000);
    return () => {
      clearTimeout(t);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [active, spawnProblem]);

  useEffect(() => {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avg = correct > 0 ? Math.round(totalTime / correct) : 0;
    onStats({ score: correct, accuracy, avgTime: avg });
  }, [correct, wrong, totalTime, onStats]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem) return;
    const num = parseInt(input, 10);
    if (num === problem.answer) {
      const rt = Date.now() - problem.spawnedAt;
      setTotalTime(t => t + rt);
      setCorrect(c => c + 1);
      setFlash('hit');
    } else {
      setWrong(w => w + 1);
      setFlash('miss');
    }
    setTimeout(() => setFlash(null), 400);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setProblem(null);
    setInput('');
    setTimeout(() => spawnProblem(), 1000);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [problem]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative">
      <div className="absolute top-2 left-3 flex items-center gap-1.5 text-muted-foreground">
        <span className="text-[10px] font-mono">SOLVE THE PROBLEM</span>
      </div>
      <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-mono">
        <span className="text-primary">{correct} correct</span>
        <span className="text-destructive">{wrong} wrong</span>
      </div>

      <AnimatePresence mode="wait">
        {problem ? (
          <motion.div
            key={problem.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-4xl font-mono font-bold text-foreground mb-6"
          >
            {problem.question} = ?
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

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value.replace(/[^0-9-]/g, ''))}
          className="bg-secondary/50 border border-border rounded-md px-4 py-2 text-center font-mono text-lg text-foreground focus:outline-none focus:border-primary/50 w-32"
          placeholder="?"
          autoComplete="off"
        />
      </form>

      {flash && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          className={`absolute top-1/3 text-sm font-mono font-bold ${flash === 'hit' ? 'text-success' : 'text-destructive'}`}
        >
          {flash === 'hit' ? '+1' : 'WRONG'}
        </motion.div>
      )}
    </div>
  );
};

export default MathBlitz;
