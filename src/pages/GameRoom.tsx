import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { GameState, GameResult } from '@/types/game';
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
  const gameStartRef = useRef<number>(0);

  // Simulate opponent joining after 2s (MVP without real-time backend)
  const [playerCount, setPlayerCount] = useState(1);
  const [opponentReady, setOpponentReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPlayerCount(2), 2000);
    return () => clearTimeout(t);
  }, []);

  // When both ready, start countdown
  useEffect(() => {
    if (isReady && playerCount >= 2) {
      // Simulate opponent readying up shortly after you
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

  // Countdown logic
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

  // Simulate opponent losing focus at a random time
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
      // Opponent already lost, you lost too => compare times
      setResult(elapsed > opponentTime ? 'WIN' : 'LOSE');
    } else {
      setResult('LOSE');
      setOpponentTime(elapsed); // opponent was still going
    }
    setGameState('FINISHED');
  }, [opponentFocused, opponentTime]);

  // When opponent loses and game is still active, player wins
  useEffect(() => {
    if (!opponentFocused && gameState === 'ACTIVE') {
      // Give a brief moment then declare win
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
        />
      );

    case 'FINISHED':
      return (
        <ResultScreen
          result={result}
          yourTime={yourTime}
          opponentTime={opponentTime}
          onRematch={handleRematch}
        />
      );

    default:
      return null;
  }
};

export default GameRoom;
