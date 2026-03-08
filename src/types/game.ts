export type GameState = 'LANDING' | 'WAITING' | 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED';

export type GameResult = 'WIN' | 'LOSE' | 'TIE' | null;

export interface ReactionStats {
  hits: number;
  misses: number;
  avgReactionTime: number; // ms
}

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
}
