/**
 * SupaChat - Supabase Server Utilities
 * Server-side Supabase configuration and helpers for SSR/API.
 */

import type { Database } from "@/lib/supachat/types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

export async function getServerSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getServerUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getChatRoomsServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
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

export async function getMessagesServer(roomId: string, limit: number = 50) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createChatRoomServer(
  isGuestRoom: boolean = true,
  guestSessionId?: string,
  name?: string,
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
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

export async function createMessageServer(
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
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
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

export async function updateUserLastSeenServer(
  userId?: string,
  guestSessionId?: string,
) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("chat_users").upsert({
    user_id: userId || null,
    guest_session_id: guestSessionId || null,
    last_seen: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function getChatUserServer(
  userId?: string,
  guestSessionId?: string,
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("chat_users")
    .select("*")
    .or(`user_id.eq.${userId},guest_session_id.eq.${guestSessionId}`)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createChatUserServer(
  userId?: string,
  guestSessionId?: string,
  name?: string,
  email?: string,
  isAdmin: boolean = false,
) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("chat_users")
    .insert({
      user_id: userId || null,
      guest_session_id: guestSessionId || null,
      name,
      email,
      is_admin: isAdmin,
      last_seen: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAdminRoomsServer() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("chat_rooms")
    .select(
      `
      *,
      messages (
        id,
        content,
        created_at,
        is_from_admin
      ),
      chat_users (
        id,
        name,
        email,
        is_admin,
        last_seen
      )
    `,
    )
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function assignAdminToRoomServer(roomId: string, adminId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("chat_users")
    .update({ assigned_admin_id: adminId })
    .eq("id", roomId);

  if (error) throw error;
}

export async function deleteRoomServer(roomId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("chat_rooms").delete().eq("id", roomId);

  if (error) throw error;
}
