import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { GameStats } from '@/types/game';

interface WordleGameProps {
  active: boolean;
  onStats: (stats: GameStats) => void;
}

const WORD_LIST = [
  'focus', 'brain', 'sharp', 'power', 'quick', 'alert', 'nerve', 'blaze',
  'storm', 'pulse', 'steel', 'flame', 'drive', 'force', 'spark', 'clash',
  'drift', 'orbit', 'prism', 'scope', 'pixel', 'laser', 'turbo', 'ultra',
  'world', 'crane', 'slate', 'trace', 'audio', 'raise', 'stare', 'arise',
];

type TileStatus = 'correct' | 'present' | 'absent' | 'empty';

const WordleGame = ({ active, onStats }: WordleGameProps) => {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [solved, setSolved] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  const pickWord = useCallback(() => {
    const word = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(word);
    setGuesses([]);
    setCurrentGuess('');
    startTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (active) pickWord();
  }, [active, pickWord]);

  useEffect(() => {
    const total = solved + Math.max(0, attempts - solved);
    const accuracy = total > 0 ? Math.round((solved / Math.max(1, total)) * 100) : 0;
    const avg = solved > 0 ? Math.round(totalTime / solved) : 0;
    onStats({ score: solved, accuracy, avgTime: avg });
  }, [solved, attempts, totalTime, onStats]);

  const getTileStatus = (guess: string, index: number): TileStatus => {
    if (!targetWord) return 'empty';
    const letter = guess[index];
    if (letter === targetWord[index]) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
  };

  const tileColor = (status: TileStatus) => {
    switch (status) {
      case 'correct': return 'bg-success border-success/50 text-success-foreground';
      case 'present': return 'bg-warning border-warning/50 text-warning-foreground';
      case 'absent': return 'bg-muted border-border text-muted-foreground';
      default: return 'bg-secondary/30 border-border text-foreground';
    }
  };

  const handleKey = useCallback((key: string) => {
    if (!targetWord) return;
    if (key === 'Backspace') {
      setCurrentGuess(g => g.slice(0, -1));
      return;
    }
    if (key === 'Enter' && currentGuess.length === 5) {
      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setAttempts(a => a + 1);

      if (currentGuess.toLowerCase() === targetWord.toLowerCase()) {
        const rt = Date.now() - startTime.current;
        setTotalTime(t => t + rt);
        setSolved(s => s + 1);
        setFlash('SOLVED!');
        setTimeout(() => { setFlash(null); pickWord(); }, 1500);
      } else if (newGuesses.length >= 6) {
        setFlash(`Answer: ${targetWord.toUpperCase()}`);
        setTimeout(() => { setFlash(null); pickWord(); }, 2000);
      }
      setCurrentGuess('');
      return;
    }
    if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(g => g + key.toLowerCase());
    }
  }, [targetWord, currentGuess, guesses, pickWord]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKey(e.key);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  const KEYBOARD = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
  ];

  const rows = Array.from({ length: 6 }, (_, i) => {
    if (i < guesses.length) return guesses[i];
    if (i === guesses.length) return currentGuess.padEnd(5, ' ');
    return '     ';
  });

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-start pt-6 relative overflow-y-auto">
      <div className="absolute top-2 left-3 text-[10px] font-mono text-muted-foreground">GUESS THE WORD</div>
      <div className="absolute top-2 right-3 text-xs font-mono text-primary">{solved} solved</div>

      {/* Grid */}
      <div className="grid gap-1 mb-3">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.split('').slice(0, 5).map((letter, ci) => {
              const isGuessed = ri < guesses.length;
              const status = isGuessed ? getTileStatus(guesses[ri], ci) : 'empty';
              return (
                <motion.div
                  key={`${ri}-${ci}`}
                  initial={isGuessed ? { rotateX: 90 } : {}}
                  animate={{ rotateX: 0 }}
                  transition={{ delay: isGuessed ? ci * 0.1 : 0 }}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-mono font-bold border rounded ${tileColor(status)}`}
                >
                  {letter.trim() ? letter.toUpperCase() : ''}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Keyboard */}
      <div className="flex flex-col gap-1 items-center">
        {KEYBOARD.map((row, ri) => (
          <div key={ri} className="flex gap-0.5">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKey(key === '⌫' ? 'Backspace' : key)}
                className="px-2 py-1.5 rounded text-[11px] font-mono bg-secondary/60 border border-border hover:bg-secondary text-foreground transition-colors min-w-[24px]"
              >
                {key.toUpperCase()}
              </button>
            ))}
          </div>
        ))}
      </div>

      {flash && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 text-sm font-mono font-bold text-primary"
        >
          {flash}
        </motion.div>
      )}
    </div>
  );
};

export default WordleGame;
