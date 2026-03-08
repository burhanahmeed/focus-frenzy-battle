export type GameState = 'LANDING' | 'WAITING' | 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED';

export type GameResult = 'WIN' | 'LOSE' | 'TIE' | null;

export type GameMode = 'reaction' | 'typing' | 'math' | 'reading' | 'wordle';

export interface GameStats {
  score: number;
  accuracy: number; // 0-100
  avgTime: number; // ms
  extras?: Record<string, string | number>;
}

export interface ReactionStats {
  hits: number;
  misses: number;
  avgReactionTime: number; // ms
}

export interface GameModeConfig {
  id: GameMode;
  label: string;
  description: string;
  icon: string; // lucide icon name reference
}

export const GAME_MODES: GameModeConfig[] = [
  { id: 'reaction', label: 'Reaction', description: 'Click glowing targets as fast as you can', icon: 'crosshair' },
  { id: 'typing', label: 'Typing', description: 'Type words before they disappear', icon: 'keyboard' },
  { id: 'math', label: 'Math Blitz', description: 'Solve arithmetic problems quickly', icon: 'calculator' },
  { id: 'reading', label: 'Reading', description: 'Answer comprehension questions', icon: 'book-open' },
  { id: 'wordle', label: 'Wordle', description: 'Guess the 5-letter word', icon: 'grid-3x3' },
];

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isConnected: boolean;
  isFocused: boolean;
  focusTime: number;
}

export interface GameRoom {
  roomId: string;
  players: Player[];
  state: GameState;
  duration: number;
  result: GameResult;
  startTime: number | null;
  gameMode: GameMode;
}
