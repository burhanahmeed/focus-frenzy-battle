import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GameMode, GameStats } from '@/types/game';
import { generatePlayerId } from '@/lib/game-utils';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface MultiplayerState {
  playerId: string;
  playerCount: number;
  isHost: boolean;
  opponentReady: boolean;
  opponentFocused: boolean;
  opponentStats: GameStats | null;
  opponentMode: GameMode | null;
  opponentDuration: number | null;
}

interface UseMultiplayerRoomOptions {
  roomId: string;
  onOpponentLostFocus?: () => void;
  onGameStart?: () => void;
}

export function useMultiplayerRoom({ roomId, onOpponentLostFocus, onGameStart }: UseMultiplayerRoomOptions) {
  const playerIdRef = useRef(generatePlayerId());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [state, setState] = useState<MultiplayerState>({
    playerId: playerIdRef.current,
    playerCount: 0,
    isHost: false,
    opponentReady: false,
    opponentFocused: true,
    opponentStats: null,
    opponentMode: null,
    opponentDuration: null,
  });

  const isHostRef = useRef(false);
  const playersRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: playerIdRef.current } },
    });

    channelRef.current = channel;

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const playerIds = Object.keys(presenceState);
      playersRef.current = new Set(playerIds);
      const count = playerIds.length;
      
      // Determine host based on who joined first (earliest joinedAt timestamp)
      const playersWithTimestamps = playerIds.map(id => ({
        id,
        joinedAt: presenceState[id]?.[0]?.joinedAt || 0
      }));
      const sortedByJoinTime = playersWithTimestamps.sort((a, b) => a.joinedAt - b.joinedAt);
      const host = sortedByJoinTime[0]?.id === playerIdRef.current;
      
      isHostRef.current = host;
      setState(s => ({ ...s, playerCount: count, isHost: host }));
    });

    channel.on('broadcast', { event: 'ready' }, ({ payload }) => {
      if (payload.playerId !== playerIdRef.current) {
        setState(s => ({ ...s, opponentReady: payload.ready }));
      }
    });

    channel.on('broadcast', { event: 'mode_select' }, ({ payload }) => {
      if (payload.playerId !== playerIdRef.current) {
        setState(s => ({ ...s, opponentMode: payload.mode }));
      }
    });

    channel.on('broadcast', { event: 'duration_select' }, ({ payload }) => {
      if (payload.playerId !== playerIdRef.current) {
        setState(s => ({ ...s, opponentDuration: payload.duration }));
      }
    });

    channel.on('broadcast', { event: 'focus_lost' }, ({ payload }) => {
      if (payload.playerId !== playerIdRef.current) {
        setState(s => ({ ...s, opponentFocused: false }));
        onOpponentLostFocus?.();
      }
    });

    channel.on('broadcast', { event: 'game_stats' }, ({ payload }) => {
      if (payload.playerId !== playerIdRef.current) {
        setState(s => ({ ...s, opponentStats: payload.stats }));
      }
    });

    channel.on('broadcast', { event: 'game_start' }, () => {
      onGameStart?.();
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online: true, joinedAt: Date.now() });
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, onOpponentLostFocus, onGameStart]);

  const broadcastReady = useCallback((ready: boolean) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'ready',
      payload: { playerId: playerIdRef.current, ready },
    });
  }, []);

  const broadcastModeSelect = useCallback((mode: GameMode) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'mode_select',
      payload: { playerId: playerIdRef.current, mode },
    });
  }, []);

  const broadcastDurationSelect = useCallback((duration: number) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'duration_select',
      payload: { playerId: playerIdRef.current, duration },
    });
  }, []);

  const broadcastFocusLost = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'focus_lost',
      payload: { playerId: playerIdRef.current },
    });
  }, []);

  const broadcastGameStats = useCallback((stats: GameStats) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'game_stats',
      payload: { playerId: playerIdRef.current, stats },
    });
  }, []);

  const broadcastGameStart = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'game_start',
      payload: { playerId: playerIdRef.current },
    });
  }, []);

  const resetOpponent = useCallback(() => {
    setState(s => ({
      ...s,
      opponentReady: false,
      opponentFocused: true,
      opponentStats: null,
      opponentMode: null,
      opponentDuration: null,
    }));
  }, []);

  return {
    ...state,
    broadcastReady,
    broadcastModeSelect,
    broadcastDurationSelect,
    broadcastFocusLost,
    broadcastGameStats,
    broadcastGameStart,
    resetOpponent,
  };
}
