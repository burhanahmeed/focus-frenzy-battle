import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStats } from '@/types/game';

interface ReadingChallengeProps {
  active: boolean;
  onStats: (stats: GameStats) => void;
}

interface Question {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correctIndex: number;
  spawnedAt: number;
}

const PASSAGES: Omit<Question, 'id' | 'spawnedAt'>[] = [
  {
    passage: 'The octopus has three hearts. Two pump blood to the gills, while the third pumps it to the rest of the body.',
    question: 'How many hearts does an octopus have?',
    options: ['Two', 'Three', 'Four', 'One'],
    correctIndex: 1,
  },
  {
    passage: 'Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.',
    question: 'Where was ancient honey found?',
    options: ['Roman ruins', 'Egyptian tombs', 'Greek temples', 'Chinese caves'],
    correctIndex: 1,
  },
  {
    passage: 'Venus is the hottest planet in our solar system, even though Mercury is closer to the Sun. This is due to its thick atmosphere.',
    question: 'Why is Venus hotter than Mercury?',
    options: ['It is larger', 'Its thick atmosphere', 'It rotates faster', 'It has volcanoes'],
    correctIndex: 1,
  },
  {
    passage: 'A group of flamingos is called a "flamboyance." They get their pink color from the shrimp and algae they eat.',
    question: 'What gives flamingos their pink color?',
    options: ['Genetics', 'Sunlight', 'Shrimp and algae', 'Minerals in water'],
    correctIndex: 2,
  },
  {
    passage: 'The Great Wall of China is not visible from space with the naked eye. This is a common myth that has been debunked by astronauts.',
    question: 'Can the Great Wall be seen from space?',
    options: ['Yes, easily', 'Only at night', 'No, it is a myth', 'Only with binoculars'],
    correctIndex: 2,
  },
  {
    passage: 'Bananas are technically berries, while strawberries are not. Botanically, a berry must develop from a single ovary.',
    question: 'Which of these is technically a berry?',
    options: ['Strawberry', 'Raspberry', 'Banana', 'Blackberry'],
    correctIndex: 2,
  },
];

const ReadingChallenge = ({ active, onStats }: ReadingChallengeProps) => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [flash, setFlash] = useState<'hit' | 'miss' | null>(null);
  const usedIndices = useRef<Set<number>>(new Set());
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  const spawnQuestion = useCallback(() => {
    let idx: number;
    if (usedIndices.current.size >= PASSAGES.length) usedIndices.current.clear();
    do {
      idx = Math.floor(Math.random() * PASSAGES.length);
    } while (usedIndices.current.has(idx));
    usedIndices.current.add(idx);

    const p = PASSAGES[idx];
    setQuestion({ ...p, id: crypto.randomUUID(), spawnedAt: Date.now() });

    dismissTimer.current = setTimeout(() => {
      setQuestion(null);
      setWrong(w => w + 1);
      setFlash('miss');
      setTimeout(() => setFlash(null), 400);
      setTimeout(() => spawnQuestion(), 1500);
    }, 15000);
  }, []);

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => spawnQuestion(), 2000);
    return () => {
      clearTimeout(t);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [active, spawnQuestion]);

  useEffect(() => {
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avg = correct > 0 ? Math.round(totalTime / correct) : 0;
    onStats({ score: correct, accuracy, avgTime: avg });
  }, [correct, wrong, totalTime, onStats]);

  const handleAnswer = (idx: number) => {
    if (!question) return;
    const rt = Date.now() - question.spawnedAt;
    if (idx === question.correctIndex) {
      setTotalTime(t => t + rt);
      setCorrect(c => c + 1);
      setFlash('hit');
    } else {
      setWrong(w => w + 1);
      setFlash('miss');
    }
    setTimeout(() => setFlash(null), 400);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setQuestion(null);
    setTimeout(() => spawnQuestion(), 1500);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-8 px-4 relative overflow-y-auto">
      <div className="absolute top-2 left-3 flex items-center gap-1.5 text-muted-foreground">
        <span className="text-[10px] font-mono">READ & ANSWER</span>
      </div>
      <div className="absolute top-2 right-3 flex items-center gap-3 text-xs font-mono">
        <span className="text-primary">{correct} correct</span>
        <span className="text-destructive">{wrong} wrong</span>
      </div>

      <AnimatePresence mode="wait">
        {question ? (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-sm"
          >
            <p className="text-sm text-foreground/80 mb-4 leading-relaxed">{question.passage}</p>
            <p className="text-sm font-semibold text-foreground mb-3">{question.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="py-2 px-3 rounded-md text-xs font-mono bg-secondary/50 border border-border hover:border-primary/40 hover:bg-secondary transition-colors text-foreground"
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="text-sm font-mono text-muted-foreground mt-16"
          >
            get ready…
          </motion.p>
        )}
      </AnimatePresence>

      {flash && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          className={`absolute bottom-4 text-sm font-mono font-bold ${flash === 'hit' ? 'text-success' : 'text-destructive'}`}
        >
          {flash === 'hit' ? 'CORRECT' : 'WRONG'}
        </motion.div>
      )}
    </div>
  );
};

export default ReadingChallenge;
