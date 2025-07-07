/**
 * SupaChat - Supabase Client Utilities
 * Client-side Supabase configuration and helpers for chat.
 */

import type { Database } from "@/lib/supachat/types";
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
) {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        "X-Client-Info": "supachat-browser",
      },
    },
  });
}

export function createAnonymousClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  getSessionId: () => string | null,
) {
  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey);

  const getGuestSessionId = () => {
    return getSessionId();
  };

  return {
    client,
    getGuestSessionId,
    isAuthenticated: async () => {
      const {
        data: { session },
      } = await client.auth.getSession();
      return !!session;
    },
    getCurrentUserId: async () => {
      const {
        data: { user },
      } = await client.auth.getUser();
      return user?.id;
    },
  };
}

export function createChatChannel(
  client: ReturnType<typeof createSupabaseClient>,
  roomId: string,
) {
  return client
    .channel(`chat:${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        console.log("Message change:", payload);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_rooms",
        filter: `id=eq.${roomId}`,
      },
      (payload) => {
        console.log("Room change:", payload);
      },
    );
}

export function createPresenceChannel(
  client: ReturnType<typeof createSupabaseClient>,
  roomId: string,
) {
  return client
    .channel(`presence:${roomId}`)
    .on("presence", { event: "sync" }, () => {
      console.log("Presence synced");
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      console.log("User joined:", key, newPresences);
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      console.log("User left:", key, leftPresences);
    });
}

export async function uploadFile(
  client: ReturnType<typeof createSupabaseClient>,
  file: File,
  bucketName: string = "chat-files",
): Promise<{ url: string; path: string }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${Date.now()}/${fileName}`;

  const { data, error } = await client.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucketName).getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

export async function getChatRooms(
  client: ReturnType<typeof createSupabaseClient>,
) {
  const { data, error } = await client
    .from("chat_rooms")
    .select(
      `
      *,
      messages (
        id,
        content,
        created_at,
        is_from_admin
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getMessages(
  client: ReturnType<typeof createSupabaseClient>,
  roomId: string,
  limit: number = 50,
) {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createChatRoom(
  client: ReturnType<typeof createSupabaseClient>,
  isGuestRoom: boolean = true,
  guestSessionId?: string,
  name?: string,
) {
  const { data, error } = await client
    .from("chat_rooms")
    .insert({
      name,
      is_guest_room: isGuestRoom,
      guest_session_id: guestSessionId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMessage(
  client: ReturnType<typeof createSupabaseClient>,
  roomId: string,
  content: string,
  options: {
    userId?: string;
    guestSessionId?: string;
    isFromAdmin?: boolean;
    messageType?: "text" | "file" | "system";
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  } = {},
) {
  const { data, error } = await client
    .from("messages")
    .insert({
      room_id: roomId,
      user_id: options.userId || null,
      guest_session_id: options.guestSessionId || null,
      content,
      message_type: options.messageType || "text",
      file_url: options.fileUrl || null,
      file_name: options.fileName || null,
      file_size: options.fileSize || null,
      is_from_admin: options.isFromAdmin || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserLastSeen(
  client: ReturnType<typeof createSupabaseClient>,
  userId?: string,
  guestSessionId?: string,
) {
  const { error } = await client.from("chat_users").upsert({
    user_id: userId || null,
    guest_session_id: guestSessionId || null,
    last_seen: new Date().toISOString(),
  });

  if (error) throw error;
}
