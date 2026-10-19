"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { RoomState, MultiplayerTeam, MultiplayerSubmission } from "./types";

interface UseRoomSyncOptions {
  roomCode: string | null;
  pollInterval?: number;
}

export function useRoomSync({ roomCode, pollInterval = 2500 }: UseRoomSyncOptions) {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [teams, setTeams] = useState<MultiplayerTeam[]>([]);
  const [submissions, setSubmissions] = useState<MultiplayerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const roomCodeRef = useRef(roomCode);
  roomCodeRef.current = roomCode;

  const fetchState = useCallback(async (codeToFetch?: string) => {
    const code = (codeToFetch || roomCodeRef.current)?.trim().toUpperCase();
    if (!code) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/room?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRoom(data.room);
          setTeams(data.teams || []);
          setSubmissions(data.submissions || []);
          setError(null);
          setIsConnected(true);
        } else {
          setError(data.error || "Gagal memuat ruangan");
        }
      } else if (res.status === 404) {
        setError("Ruangan tidak ditemukan");
        setRoom(null);
      }
    } catch (err: any) {
      console.warn("Sync fetch error:", err);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    if (!roomCode) {
      setRoom(null);
      setTeams([]);
      setSubmissions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchState(roomCode);

    const intervalId = setInterval(() => {
      fetchState(roomCode);
    }, pollInterval);

    // Supabase Realtime channel
    const channel = supabase
      .channel(`room_${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mpi_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          fetchState(roomCode);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mpi_teams",
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          fetchState(roomCode);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "mpi_submissions",
          filter: `room_code=eq.${roomCode}`,
        },
        () => {
          fetchState(roomCode);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
        }
      });

    return () => {
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [roomCode, pollInterval, fetchState]);

  return {
    room,
    teams,
    submissions,
    loading,
    error,
    isConnected,
    refresh: () => fetchState(roomCodeRef.current || undefined),
  };
}
