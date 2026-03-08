import { motion } from 'framer-motion';
import { Copy, Check, Clock, Shield, Crosshair, Keyboard, Calculator, BookOpen, Grid3x3 } from 'lucide-react';
import { useState } from 'react';
import { GameMode, GAME_MODES } from '@/types/game';

interface LobbyProps {
  roomId: string;
  playerCount: number;
  isReady: boolean;
  opponentReady: boolean;
  selectedDuration: number;
  selectedMode: GameMode;
  isHost: boolean;
  onToggleReady: () => void;
  onSelectDuration: (seconds: number) => void;
  onSelectMode: (mode: GameMode) => void;
}

const DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];

const MODE_ICONS: Record<GameMode, React.ReactNode> = {
  reaction: <Crosshair className="w-5 h-5" />,
  typing: <Keyboard className="w-5 h-5" />,
  math: <Calculator className="w-5 h-5" />,
  reading: <BookOpen className="w-5 h-5" />,
  wordle: <Grid3x3 className="w-5 h-5" />,
};

const Lobby = ({ roomId, playerCount, isReady, opponentReady, selectedDuration, selectedMode, isHost, onToggleReady, onSelectDuration, onSelectMode }: LobbyProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Room code */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground text-sm font-mono mb-2 tracking-wider">ROOM CODE</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyCode}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <span className="font-mono text-3xl font-bold text-primary tracking-[0.3em]">{roomId}</span>
            {copied ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground" />
            )}
          </motion.button>
          <p className="text-muted-foreground text-xs mt-2">Share this code with your opponent</p>
        </div>

        {/* Players */}
        <div className="bg-card border border-border rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground font-mono">PLAYERS</span>
            <span className="text-sm font-mono text-primary">{playerCount}/2</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary/50">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-sm font-medium">You</span>
              {isReady && <span className="ml-auto text-xs font-mono text-success">READY</span>}
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-secondary/50">
              {playerCount >= 2 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
                  <span className="text-sm font-medium">Opponent</span>
                  {opponentReady && <span className="ml-auto text-xs font-mono text-success">READY</span>}
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground">Waiting for opponent…</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Game mode selection */}
        <div className="bg-card border border-border rounded-lg p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Crosshair className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono">GAME MODE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-center transition-all ${
                  selectedMode === mode.id
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'bg-secondary text-secondary-foreground hover:border-primary/30 border border-border'
                }`}
              >
                {MODE_ICONS[mode.id]}
                <span className="text-xs font-mono font-semibold">{mode.label}</span>
                <span className={`text-[9px] leading-tight ${
                  selectedMode === mode.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {mode.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration selection */}
        <div className="bg-card border border-border rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-mono">DURATION</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DURATIONS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onSelectDuration(value)}
                className={`py-2 px-3 rounded-md text-sm font-mono transition-all ${
                  selectedDuration === value
                    ? 'bg-primary text-primary-foreground glow-primary'
                    : 'bg-secondary text-secondary-foreground hover:border-primary/30 border border-border'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ready button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleReady}
          className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
            isReady
              ? 'bg-success/20 text-success border border-success/30 glow-success'
              : 'bg-primary text-primary-foreground glow-primary'
          }`}
        >
          <Shield className="w-5 h-5" />
          {isReady ? 'Ready — Waiting for opponent' : 'Ready Up'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Lobby;
