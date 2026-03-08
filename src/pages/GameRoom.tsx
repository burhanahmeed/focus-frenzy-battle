import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GameState, GameResult, GameMode, GameStats } from '@/types/game';
import { useMultiplayerRoom } from '@/hooks/useMultiplayerRoom';
import Lobby from '@/components/Lobby';
import CountdownOverlay from '@/components/CountdownOverlay';
import FocusArena from '@/components/FocusArena';
import ResultScreen from '@/components/ResultScreen';

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(60);
  const [gameMode, setGameMode] = useState<GameMode>('reaction');
  const [countdownValue, setCountdownValue] = useState(3);
  const [result, setResult] = useState<GameResult>(null);
  const [yourTime, setYourTime] = useState(0);
  const [opponentTime, setOpponentTime] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({ score: 0, accuracy: 0, avgTime: 0 });
  const [opponentGameStats, setOpponentGameStats] = useState<GameStats>({ score: 0, accuracy: 0, avgTime: 0 });
  const gameStartRef = useRef<number>(0);
  const hasEndedRef = useRef(false);

  const handleOpponentLostFocus = useCallback(() => {
    // Opponent lost focus — we'll handle this in the effect below
  }, []);

  const handleGameStartBroadcast = useCallback(() => {
    // Non-host receives game start signal
    if (gameState === 'LOBBY' || gameState === 'WAITING') {
      setGameState('COUNTDOWN');
      setCountdownValue(3);
    }
  }, [gameState]);

  const mp = useMultiplayerRoom({
    roomId: roomId || '',
    onOpponentLostFocus: handleOpponentLostFocus,
    onGameStart: handleGameStartBroadcast,
  });

  // Sync opponent stats as they come in
  useEffect(() => {
    if (mp.opponentStats) {
      setOpponentGameStats(mp.opponentStats);
    }
  }, [mp.opponentStats]);

  // When host selects mode/duration, broadcast it
  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    mp.broadcastModeSelect(mode);
  }, [mp]);

  const handleSelectDuration = useCallback((dur: number) => {
    setDuration(dur);
    mp.broadcastDurationSelect(dur);
  }, [mp]);

  // Non-host receives mode/duration from host
  useEffect(() => {
    if (!mp.isHost && mp.opponentMode) {
      setGameMode(mp.opponentMode);
    }
  }, [mp.isHost, mp.opponentMode]);

  useEffect(() => {
    if (!mp.isHost && mp.opponentDuration) {
      setDuration(mp.opponentDuration);
    }
  }, [mp.isHost, mp.opponentDuration]);

  const handleToggleReady = useCallback(() => {
    setIsReady(prev => {
      const next = !prev;
      mp.broadcastReady(next);
      return next;
    });
  }, [mp]);

  // Both ready → host triggers game start
  useEffect(() => {
    if (isReady && mp.opponentReady && mp.playerCount >= 2 && mp.isHost) {
      mp.broadcastGameStart();
      setGameState('COUNTDOWN');
      setCountdownValue(3);
    }
  }, [isReady, mp.opponentReady, mp.playerCount, mp.isHost, mp]);

  // Countdown logic
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;
    if (countdownValue <= 0) {
      const timeout = setTimeout(() => {
        setGameState('ACTIVE');
        gameStartRef.current = Date.now();
        hasEndedRef.current = false;
      }, 800);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setCountdownValue(prev => prev - 1), 1000);
    return () => clearTimeout(timeout);
  }, [gameState, countdownValue]);

  // When opponent loses focus during active game
  useEffect(() => {
    if (!mp.opponentFocused && gameState === 'ACTIVE' && !hasEndedRef.current) {
      const elapsed = Math.floor((Date.now() - gameStartRef.current) / 1000);
      setOpponentTime(elapsed);
      // Give 2 seconds then end as win
      const t = setTimeout(() => {
        if (hasEndedRef.current) return;
        hasEndedRef.current = true;
        const finalElapsed = Math.floor((Date.now() - gameStartRef.current) / 1000);
        setYourTime(finalElapsed);
        setResult('WIN');
        setGameState('FINISHED');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [mp.opponentFocused, gameState]);

  const handleLoseFocus = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    mp.broadcastFocusLost();
    const elapsed = Math.floor((Date.now() - gameStartRef.current) / 1000);
    setYourTime(elapsed);
    if (!mp.opponentFocused) {
      setResult(elapsed > opponentTime ? 'WIN' : 'LOSE');
    } else {
      setResult('LOSE');
      setOpponentTime(elapsed);
    }
    setGameState('FINISHED');
  }, [mp, opponentTime]);

  const handleTimerEnd = useCallback(() => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    setYourTime(duration);
    if (mp.opponentFocused) {
      setOpponentTime(duration);
      // Both survived — compare scores
      if (opponentGameStats && gameStats.score !== opponentGameStats.score) {
        setResult(gameStats.score > opponentGameStats.score ? 'WIN' : 'LOSE');
      } else {
        setResult('TIE');
      }
    } else {
      setResult('WIN');
    }
    setGameState('FINISHED');
  }, [duration, mp.opponentFocused, gameStats, opponentGameStats]);

  const handleGameStats = useCallback((stats: GameStats) => {
    setGameStats(stats);
    mp.broadcastGameStats(stats);
  }, [mp]);

  const handleRematch = () => {
    setGameState('LOBBY');
    setIsReady(false);
    setResult(null);
    setYourTime(0);
    setOpponentTime(0);
    setCountdownValue(3);
    setGameStats({ score: 0, accuracy: 0, avgTime: 0 });
    setOpponentGameStats({ score: 0, accuracy: 0, avgTime: 0 });
    hasEndedRef.current = false;
    mp.resetOpponent();
  };

  if (!roomId) return null;

  switch (gameState) {
    case 'LOBBY':
    case 'WAITING':
      return (
        <Lobby
          roomId={roomId}
          playerCount={mp.playerCount}
          isReady={isReady}
          opponentReady={mp.opponentReady}
          selectedDuration={duration}
          selectedMode={gameMode}
          isHost={mp.isHost}
          onToggleReady={handleToggleReady}
          onSelectDuration={handleSelectDuration}
          onSelectMode={handleSelectMode}
        />
      );

    case 'COUNTDOWN':
      return <CountdownOverlay count={countdownValue} />;

    case 'ACTIVE':
      return (
        <FocusArena
          duration={duration}
          gameMode={gameMode}
          opponentFocused={mp.opponentFocused}
          opponentStats={mp.opponentStats}
          onLoseFocus={handleLoseFocus}
          onTimerEnd={handleTimerEnd}
          onGameStats={handleGameStats}
        />
      );

    case 'FINISHED':
      return (
        <ResultScreen
          result={result}
          yourTime={yourTime}
          opponentTime={opponentTime}
          onRematch={handleRematch}
          gameStats={gameStats}
          opponentStats={opponentGameStats}
          gameMode={gameMode}
        />
      );

    default:
      return null;
  }
};

export default GameRoom;
