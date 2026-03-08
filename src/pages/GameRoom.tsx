import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GameState, GameResult, ReactionStats } from '@/types/game';
import Lobby from '@/components/Lobby';
import CountdownOverlay from '@/components/CountdownOverlay';
import FocusArena from '@/components/FocusArena';
import ResultScreen from '@/components/ResultScreen';

const GameRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(60);
  const [countdownValue, setCountdownValue] = useState(3);
  const [result, setResult] = useState<GameResult>(null);
  const [yourTime, setYourTime] = useState(0);
  const [opponentTime, setOpponentTime] = useState(0);
  const [opponentFocused, setOpponentFocused] = useState(true);
  const [reactionStats, setReactionStats] = useState<ReactionStats>({ hits: 0, misses: 0, avgReactionTime: 0 });
  const gameStartRef = useRef<number>(0);

  const [playerCount, setPlayerCount] = useState(1);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlayerCount(2), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isReady && playerCount >= 2) {
      const t = setTimeout(() => {
        setOpponentReady(true);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isReady, playerCount]);

  useEffect(() => {
    if (isReady && opponentReady) {
      setGameState('COUNTDOWN');
      setCountdownValue(3);
    }
  }, [isReady, opponentReady]);

  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;

    if (countdownValue <= 0) {
      const timeout = setTimeout(() => {
        setGameState('ACTIVE');
        gameStartRef.current = Date.now();
      }, 800);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCountdownValue(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [gameState, countdownValue]);

  useEffect(() => {
    if (gameState !== 'ACTIVE') return;
    const opponentLoseTime = 15000 + Math.random() * (duration * 1000 - 15000);
    const t = setTimeout(() => {
      setOpponentFocused(false);
      const opTime = Math.floor(opponentLoseTime / 1000);
      setOpponentTime(opTime);
    }, opponentLoseTime);
    return () => clearTimeout(t);
  }, [gameState, duration]);

  const handleLoseFocus = useCallback(() => {
    const elapsed = Math.floor((Date.now() - gameStartRef.current) / 1000);
    setYourTime(elapsed);
    if (!opponentFocused) {
      setResult(elapsed > opponentTime ? 'WIN' : 'LOSE');
    } else {
      setResult('LOSE');
      setOpponentTime(elapsed);
    }
    setGameState('FINISHED');
  }, [opponentFocused, opponentTime]);

  useEffect(() => {
    if (!opponentFocused && gameState === 'ACTIVE') {
      const t = setTimeout(() => {
        const elapsed = Math.floor((Date.now() - gameStartRef.current) / 1000);
        setYourTime(elapsed);
        setResult('WIN');
        setGameState('FINISHED');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [opponentFocused, gameState]);

  const handleTimerEnd = useCallback(() => {
    const elapsed = duration;
    setYourTime(elapsed);
    if (opponentFocused) {
      setOpponentTime(elapsed);
      setResult('TIE');
    } else {
      setResult('WIN');
    }
    setGameState('FINISHED');
  }, [duration, opponentFocused]);

  const handleRematch = () => {
    setGameState('LOBBY');
    setIsReady(false);
    setOpponentReady(false);
    setResult(null);
    setYourTime(0);
    setOpponentTime(0);
    setOpponentFocused(true);
    setCountdownValue(3);
    setReactionStats({ hits: 0, misses: 0, avgReactionTime: 0 });
  };

  if (!roomId) return null;

  switch (gameState) {
    case 'LOBBY':
    case 'WAITING':
      return (
        <Lobby
          roomId={roomId}
          playerCount={playerCount}
          isReady={isReady}
          opponentReady={opponentReady}
          selectedDuration={duration}
          onToggleReady={() => setIsReady(prev => !prev)}
          onSelectDuration={setDuration}
        />
      );

    case 'COUNTDOWN':
      return <CountdownOverlay count={countdownValue} />;

    case 'ACTIVE':
      return (
        <FocusArena
          duration={duration}
          opponentFocused={opponentFocused}
          onLoseFocus={handleLoseFocus}
          onTimerEnd={handleTimerEnd}
          onReactionStats={setReactionStats}
        />
      );

    case 'FINISHED':
      return (
        <ResultScreen
          result={result}
          yourTime={yourTime}
          opponentTime={opponentTime}
          onRematch={handleRematch}
          reactionStats={reactionStats}
        />
      );

    default:
      return null;
  }
};

export default GameRoom;
