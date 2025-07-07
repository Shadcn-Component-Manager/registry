/**
 * SupaChat - useChat Hook
 * Core chat logic for messages, rooms, and realtime updates with sync and notifications.
 */

"use client";

import { createChatStore } from "@/hooks/supachat/use-chat-store";
import {
  createAnonymousClient,
  createChatChannel,
  createChatRoom,
  createMessage,
  createSupabaseClient,
  getMessages,
} from "@/lib/supabase/client";
import type {
  ChatMessage,
  ChatRoom,
  SupaChatConfig,
} from "@/lib/supachat/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useChat(config: SupaChatConfig) {
  const chatStore = useMemo(
    () => createChatStore({ localStorageKey: config.localStorageKey }),
    [config.localStorageKey],
  );
  const storeMessages = chatStore((s: any) => s.messages);
  const storeCurrentRoom = chatStore((s: any) => s.currentRoom);
  const storeCurrentUser = chatStore((s: any) => s.user);
  const sessionId = chatStore((s: any) => s.sessionId);
  const setMessages = chatStore((s: any) => s.setMessages);
  const setCurrentRoom = chatStore((s: any) => s.setCurrentRoom);
  const setCurrentUser = chatStore((s: any) => s.setUser);
  const addMessage = chatStore((s: any) => s.addMessage);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  const clientRef = useRef<ReturnType<typeof createSupabaseClient> | null>(
    null,
  );
  const channelRef = useRef<any>(null);
  const guestSessionIdRef = useRef<string | null>(null);
  const isPageVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const { client, getGuestSessionId } = createAnonymousClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      () => sessionId,
    );
    clientRef.current = client;
    guestSessionIdRef.current = getGuestSessionId();
  }, [config.supabaseUrl, config.supabaseAnonKey, sessionId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const wasVisible = isPageVisibleRef.current;
      isPageVisibleRef.current = !document.hidden;

      if (wasVisible && !isPageVisibleRef.current) {
        setLastSyncTime(Date.now());
      } else if (!wasVisible && isPageVisibleRef.current) {
        if (storeCurrentRoom?.id) {
          syncNewMessages(storeCurrentRoom.id);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [storeCurrentRoom?.id]);

  const syncNewMessages = useCallback(
    async (roomId: string) => {
      if (!clientRef.current || !roomId) return;

      try {
        const data = await getMessages(clientRef.current, roomId);
        const transformedMessages: ChatMessage[] = data.map((msg: any) => ({
          id: msg.id,
          roomId: msg.room_id || "",
          userId: msg.user_id || undefined,
          guestSessionId: msg.guest_session_id || undefined,
          content: msg.content,
          messageType:
            (msg.message_type as "text" | "file" | "system") || "text",
          fileUrl: msg.file_url || undefined,
          fileName: msg.file_name || undefined,
          fileSize: msg.file_size || undefined,
          isFromAdmin: msg.is_from_admin || false,
          createdAt: msg.created_at || new Date().toISOString(),
        }));

        const newMessages = transformedMessages.filter(
          (msg) => new Date(msg.createdAt).getTime() > lastSyncTime,
        );

        if (newMessages.length > 0) {
          setHasNewMessages(true);
        }

        setMessages(transformedMessages);
        setLastSyncTime(Date.now());
      } catch (err) {
        console.error("Failed to sync messages:", err);
      }
    },
    [lastSyncTime, setMessages],
  );

  const loadMessages = useCallback(
    async (roomId: string) => {
      if (!clientRef.current || !roomId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getMessages(clientRef.current, roomId);
        const transformedMessages: ChatMessage[] = data.map((msg: any) => ({
          id: msg.id,
          roomId: msg.room_id || "",
          userId: msg.user_id || undefined,
          guestSessionId: msg.guest_session_id || undefined,
          content: msg.content,
          messageType:
            (msg.message_type as "text" | "file" | "system") || "text",
          fileUrl: msg.file_url || undefined,
          fileName: msg.file_name || undefined,
          fileSize: msg.file_size || undefined,
          isFromAdmin: msg.is_from_admin || false,
          createdAt: msg.created_at || new Date().toISOString(),
        }));
        setMessages(transformedMessages);
        setLastSyncTime(Date.now());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load messages",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [setMessages],
  );

  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!clientRef.current || !storeCurrentRoom?.id || !content.trim())
        return;

      setIsLoading(true);
      setError(null);

      try {
        let fileUrl: string | undefined;
        let fileName: string | undefined;
        let fileSize: number | undefined;

        if (file && config.enableUploads) {
          const uploadResult = await uploadFile(clientRef.current!, file);
          fileUrl = uploadResult.url;
          fileName = file.name;
          fileSize = file.size;
        }

        const messageData = await createMessage(
          clientRef.current!,
          storeCurrentRoom.id,
          content,
          {
            userId: storeCurrentUser?.userId,
            guestSessionId: guestSessionIdRef.current || undefined,
            isFromAdmin: storeCurrentUser?.isAdmin || false,
            messageType: file ? "file" : "text",
            fileUrl,
            fileName,
            fileSize,
          },
        );

        const newMessage: ChatMessage = {
          id: messageData.id,
          roomId: messageData.room_id || "",
          userId: messageData.user_id || undefined,
          guestSessionId: messageData.guest_session_id || undefined,
          content: messageData.content,
          messageType:
            (messageData.message_type as "text" | "file" | "system") || "text",
          fileUrl: messageData.file_url || undefined,
          fileName: messageData.file_name || undefined,
          fileSize: messageData.file_size || undefined,
          isFromAdmin: messageData.is_from_admin || false,
          createdAt: messageData.created_at || new Date().toISOString(),
        };

        addMessage(newMessage);
        setHasNewMessages(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [storeCurrentRoom?.id, storeCurrentUser, config.enableUploads, addMessage],
  );

  const createRoom = useCallback(
    async (name?: string): Promise<ChatRoom> => {
      if (!clientRef.current) throw new Error("Client not initialized");

      try {
        const roomData = await createChatRoom(
          clientRef.current,
          true,
          guestSessionIdRef.current || undefined,
          name,
        );

        const room: ChatRoom = {
          id: roomData.id,
          name: roomData.name || undefined,
          isGuestRoom: roomData.is_guest_room || false,
          guestSessionId: roomData.guest_session_id || undefined,
          createdAt: roomData.created_at || new Date().toISOString(),
          updatedAt: roomData.updated_at || new Date().toISOString(),
          unreadCount: 0,
        };

        setCurrentRoom(room);
        await loadMessages(room.id);

        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }

        channelRef.current = createChatChannel(clientRef.current, room.id);
        channelRef.current.subscribe();

        return room;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to create room",
        );
      }
    },
    [loadMessages, setCurrentRoom],
  );

  const joinRoom = useCallback(
    async (roomId: string) => {
      if (!clientRef.current) throw new Error("Client not initialized");

      try {
        await loadMessages(roomId);

        if (channelRef.current) {
          channelRef.current.unsubscribe();
        }

        channelRef.current = createChatChannel(clientRef.current, roomId);
        channelRef.current.subscribe();
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : "Failed to join room",
        );
      }
    },
    [loadMessages],
  );

  const markAsRead = useCallback(async () => {
    setHasNewMessages(false);
  }, []);

  const setTyping = useCallback(async (isTyping: boolean) => {}, []);

  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return {
    config,
    currentUser: storeCurrentUser,
    currentRoom: storeCurrentRoom,
    messages: storeMessages,
    isLoading,
    error,
    hasNewMessages,
    sendMessage,
    markAsRead,
    setTyping,
    createRoom,
    joinRoom,
    syncNewMessages,
  };
}

async function uploadFile(
  client: ReturnType<typeof createSupabaseClient>,
  file: File,
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${Date.now()}/${fileName}`;

  const { data, error } = await client.storage
    .from("chat-files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from("chat-files").getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}
