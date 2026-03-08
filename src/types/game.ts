export type GameState = 'LANDING' | 'WAITING' | 'LOBBY' | 'COUNTDOWN' | 'ACTIVE' | 'FINISHED';

export type GameResult = 'WIN' | 'LOSE' | 'TIE' | null;

export interface Player {
  id: string;
  name: string;
  isReady: boolean;
  isConnected: boolean;
  isFocused: boolean;
  focusTime: number; // seconds
}

export interface GameRoom {
  roomId: string;
  players: Player[];
  state: GameState;
  duration: number; // selected duration in seconds
  result: GameResult;
  startTime: number | null;
}
