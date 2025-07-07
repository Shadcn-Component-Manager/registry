/**
 * SupaChat - useChatStatus Hook
 * Manages typing indicators and user presence for chat rooms.
 */

"use client";

import {
  createPresenceChannel,
  createSupabaseClient,
} from "@/lib/supabase/client";
import type { SupaChatConfig } from "@/lib/supachat/types";
import { useCallback, useEffect, useRef, useState } from "react";

export function useChatStatus(config: SupaChatConfig) {
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string>(new Date().toISOString());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!config.enablePresence) return;
    const client = createSupabaseClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
    );
    channelRef.current = createPresenceChannel(client, "presence-channel");
    channelRef.current.on("presence", { event: "sync" }, () => {
      const presence = channelRef.current.presenceState();
      const onlineUsers = Object.keys(presence);
      setIsOnline(onlineUsers.length > 0);
    });
    channelRef.current.on("presence", { event: "join" }, () => {
      setLastSeen(new Date().toISOString());
      setIsOnline(true);
    });
    channelRef.current.on("presence", { event: "leave" }, () => {
      setLastSeen(new Date().toISOString());
    });
    channelRef.current.subscribe(async (status: string) => {
      if (status === "SUBSCRIBED") {
        await channelRef.current.track({
          user_id: "guest",
          online_at: new Date().toISOString(),
        });
      }
    });
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, [config.supabaseUrl, config.supabaseAnonKey, config.enablePresence]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channelRef.current || !config.enablePresence) return;
      setIsTyping(isTyping);
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        await channelRef.current.track({
          user_id: "guest",
          typing: true,
          typing_at: new Date().toISOString(),
        });
        typingTimeoutRef.current = setTimeout(async () => {
          await channelRef.current.track({
            user_id: "guest",
            typing: false,
          });
          setIsTyping(false);
        }, 3000);
      } else {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        await channelRef.current.track({
          user_id: "guest",
          typing: false,
        });
      }
    },
    [config.enablePresence],
  );

  const updateLastSeen = useCallback(async () => {
    if (!channelRef.current || !config.enablePresence) return;
    const now = new Date().toISOString();
    setLastSeen(now);
    await channelRef.current.track({
      user_id: "guest",
      last_seen: now,
    });
  }, [config.enablePresence]);

  useEffect(() => {
    if (!channelRef.current || !config.enablePresence) return;
    channelRef.current.on("presence", { event: "sync" }, () => {
      const presence = channelRef.current.presenceState();
      const typingUsersSet = new Set<string>();
      Object.entries(presence).forEach(([key, presences]: [string, any]) => {
        const userPresence = Array.isArray(presences)
          ? presences[0]
          : presences;
        if (userPresence?.typing && userPresence.user_id !== "guest") {
          typingUsersSet.add(userPresence.user_id);
        }
      });
      setTypingUsers(typingUsersSet);
    });
  }, [config.enablePresence]);

  useEffect(() => {
    if (!config.enablePresence) return;
    const interval = setInterval(() => {
      updateLastSeen();
    }, 30000);
    return () => clearInterval(interval);
  }, [updateLastSeen, config.enablePresence]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    isTyping,
    isOnline,
    lastSeen,
    typingUsers: Array.from(typingUsers),
    setTyping,
    updateLastSeen,
  };
}
