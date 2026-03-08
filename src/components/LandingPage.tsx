import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords, Zap, Eye, Users, ArrowRight } from 'lucide-react';
import { generateRoomCode } from '@/lib/game-utils';

const LandingPage = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);

  const handleCreate = () => {
    const roomId = generateRoomCode();
    navigate(`/room/${roomId}`);
  };

  const handleJoin = () => {
    if (joinCode.trim().length >= 4) {
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/3 rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10 px-4 max-w-lg"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-border bg-card/50 backdrop-blur-sm"
        >
          <Swords className="w-5 h-5 text-primary" />
          <span className="font-mono text-sm tracking-widest text-primary font-semibold">FOCUS DUEL</span>
        </motion.div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
          Can you{' '}
          <span className="text-primary text-glow-primary">focus</span>
          <br />
          longer than your
          <br />
          opponent?
        </h1>

        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto leading-relaxed">
          Real-time 1v1 focus battles. First to switch tabs loses. 
          No distractions. No mercy.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreate}
            className="w-full py-4 px-6 rounded-lg bg-primary text-primary-foreground font-semibold text-lg glow-primary hover:glow-primary-intense transition-shadow flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Create Room
          </motion.button>

          {!showJoin ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowJoin(true)}
              className="w-full py-4 px-6 rounded-lg bg-secondary text-secondary-foreground font-semibold text-lg border border-border hover:border-primary/30 transition-colors flex items-center justify-center gap-2"
            >
              <Users className="w-5 h-5" />
              Join Room
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                placeholder="ROOM CODE"
                maxLength={6}
                autoFocus
                className="flex-1 py-4 px-4 rounded-lg bg-secondary border border-border text-foreground font-mono text-center text-lg tracking-widest placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:glow-primary transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoin}
                disabled={joinCode.trim().length < 4}
                className="py-4 px-5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Eye, label: 'Tab detection' },
            { icon: Zap, label: 'Instant results' },
            { icon: Swords, label: 'Sudden death' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/30 text-muted-foreground text-xs font-mono"
            >
              <Icon className="w-3 h-3 text-primary" />
              {label}
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LandingPage;
