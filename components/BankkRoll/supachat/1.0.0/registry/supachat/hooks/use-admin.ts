/**
 * SupaChat - useAdmin Hook
 * Admin operations, rooms, and messages management for SupaChat.
 */

"use client";

import { createChatStore } from "@/hooks/supachat/use-chat-store";
import {
  createMessage,
  createSupabaseClient,
  getChatRooms,
  getMessages,
} from "@/lib/supabase/client";
import type {
  ChatMessage,
  ChatRoom,
  SupaChatConfig,
} from "@/lib/supachat/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useAdmin(config: SupaChatConfig) {
  const chatStore = useMemo(
    () => createChatStore({ localStorageKey: config.localStorageKey }),
    [config.localStorageKey],
  );
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<ReturnType<typeof createSupabaseClient> | null>(
    null,
  );

  useEffect(() => {
    clientRef.current = createSupabaseClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
    );
  }, [config.supabaseUrl, config.supabaseAnonKey]);

  const loadRooms = useCallback(async () => {
    if (!clientRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getChatRooms(clientRef.current);
      const transformedRooms: ChatRoom[] = data.map((room: any) => ({
        id: room.id,
        name: room.name || undefined,
        isGuestRoom: room.is_guest_room || false,
        guestSessionId: room.guest_session_id || undefined,
        createdAt: room.created_at || new Date().toISOString(),
        updatedAt: room.updated_at || new Date().toISOString(),
        lastMessage: room.messages?.[0]
          ? {
              id: room.messages[0].id,
              roomId: room.messages[0].room_id || "",
              userId: room.messages[0].user_id || undefined,
              guestSessionId: room.messages[0].guest_session_id || undefined,
              content: room.messages[0].content,
              messageType:
                (room.messages[0].message_type as "text" | "file" | "system") ||
                "text",
              fileUrl: room.messages[0].file_url || undefined,
              fileName: room.messages[0].file_name || undefined,
              fileSize: room.messages[0].file_size || undefined,
              isFromAdmin: room.messages[0].is_from_admin || false,
              createdAt:
                room.messages[0].created_at || new Date().toISOString(),
            }
          : undefined,
        unreadCount: room.unread_count || 0,
      }));
      setRooms(transformedRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rooms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadRoomMessages = useCallback(async (roomId: string) => {
    if (!clientRef.current || !roomId) return;

    try {
      const data = await getMessages(clientRef.current, roomId);
      const transformedMessages: ChatMessage[] = data.map((msg: any) => ({
        id: msg.id,
        roomId: msg.room_id || "",
        userId: msg.user_id || undefined,
        guestSessionId: msg.guest_session_id || undefined,
        content: msg.content,
        messageType: (msg.message_type as "text" | "file" | "system") || "text",
        fileUrl: msg.file_url || undefined,
        fileName: msg.file_name || undefined,
        fileSize: msg.file_size || undefined,
        isFromAdmin: msg.is_from_admin || false,
        createdAt: msg.created_at || new Date().toISOString(),
      }));
      setRoomMessages((prev) => ({
        ...prev,
        [roomId]: transformedMessages,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    }
  }, []);

  const sendAdminMessage = useCallback(
    async (roomId: string, content: string) => {
      if (!clientRef.current || !roomId || !content.trim()) return;

      try {
        const messageData = await createMessage(
          clientRef.current,
          roomId,
          content,
          {
            isFromAdmin: true,
            messageType: "text",
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

        setRoomMessages((prev) => ({
          ...prev,
          [roomId]: [...(prev[roomId] || []), newMessage],
        }));

        setRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage: newMessage,
                  updatedAt: new Date().toISOString(),
                }
              : room,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [],
  );

  const deleteRoom = useCallback(
    async (roomId: string) => {
      if (!clientRef.current || !roomId) return;

      try {
        const { error } = await clientRef.current
          .from("chat_rooms")
          .delete()
          .eq("id", roomId);

        if (error) throw error;

        setRooms((prev) => prev.filter((room) => room.id !== roomId));
        setRoomMessages((prev) => {
          const newMessages = { ...prev };
          delete newMessages[roomId];
          return newMessages;
        });

        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete room");
      }
    },
    [selectedRoom?.id],
  );

  const markAsRead = useCallback(async (roomId: string) => {
    if (!clientRef.current || !roomId) return;

    try {
      const { error } = await clientRef.current.from("chat_users").upsert({
        user_id: "admin",
        last_seen: new Date().toISOString(),
      });

      if (error) throw error;

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, unreadCount: 0 } : room,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read");
    }
  }, []);

  const assignAdmin = useCallback(async (roomId: string, adminId: string) => {
    if (!clientRef.current || !roomId || !adminId) return;

    try {
      const { error } = await clientRef.current
        .from("chat_rooms")
        .update({ assigned_admin_id: adminId })
        .eq("id", roomId);

      if (error) throw error;

      setRooms((prev) =>
        prev.map((room) =>
          room.id === roomId ? { ...room, assignedAdminId: adminId } : room,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign admin");
    }
  }, []);

  const getRoomStats = useCallback(
    (roomId: string) => {
      const messages = roomMessages[roomId] || [];
      const totalMessages = messages.length;
      const adminMessages = messages.filter((m) => m.isFromAdmin).length;
      const userMessages = totalMessages - adminMessages;
      const lastActivity =
        messages.length > 0 ? messages[messages.length - 1].createdAt : null;

      return {
        totalMessages,
        adminMessages,
        userMessages,
        lastActivity,
      };
    },
    [roomMessages],
  );

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!clientRef.current) return;

    const roomsChannel = clientRef.current
      .channel("admin-rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_rooms",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newRoom: ChatRoom = {
              id: payload.new.id,
              name: payload.new.name || undefined,
              isGuestRoom: payload.new.is_guest_room || false,
              guestSessionId: payload.new.guest_session_id || undefined,
              createdAt: payload.new.created_at || new Date().toISOString(),
              updatedAt: payload.new.updated_at || new Date().toISOString(),
              unreadCount: 0,
            };
            setRooms((prev) => [newRoom, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedRoom: ChatRoom = {
              id: payload.new.id,
              name: payload.new.name || undefined,
              isGuestRoom: payload.new.is_guest_room || false,
              guestSessionId: payload.new.guest_session_id || undefined,
              createdAt: payload.new.created_at || new Date().toISOString(),
              updatedAt: payload.new.updated_at || new Date().toISOString(),
              unreadCount: 0,
            };
            setRooms((prev) =>
              prev.map((room) =>
                room.id === updatedRoom.id ? updatedRoom : room,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setRooms((prev) =>
              prev.filter((room) => room.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    const messagesChannel = clientRef.current
      .channel("admin-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage: ChatMessage = {
              id: payload.new.id,
              roomId: payload.new.room_id || "",
              userId: payload.new.user_id || undefined,
              guestSessionId: payload.new.guest_session_id || undefined,
              content: payload.new.content,
              messageType:
                (payload.new.message_type as "text" | "file" | "system") ||
                "text",
              fileUrl: payload.new.file_url || undefined,
              fileName: payload.new.file_name || undefined,
              fileSize: payload.new.file_size || undefined,
              isFromAdmin: payload.new.is_from_admin || false,
              createdAt: payload.new.created_at || new Date().toISOString(),
            };
            setRoomMessages((prev) => ({
              ...prev,
              [newMessage.roomId]: [
                ...(prev[newMessage.roomId] || []),
                newMessage,
              ],
            }));
          }
        },
      )
      .subscribe();

    return () => {
      roomsChannel.unsubscribe();
      messagesChannel.unsubscribe();
    };
  }, []);

  return {
    rooms,
    selectedRoom,
    roomMessages,
    isLoading,
    error,
    sendAdminMessage,
    deleteRoom,
    markAsRead,
    assignAdmin,
    getRoomStats,
    loadRooms,
    loadRoomMessages,
    setSelectedRoom,
  };
}
