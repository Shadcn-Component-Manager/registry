/**
 * SupaChat - TypeScript Types
 * Complete type definitions for the chat system with avatar support.
 */

export interface ChatMessage {
  id: string;
  roomId: string;
  userId?: string;
  guestSessionId?: string;
  content: string;
  messageType: "text" | "file" | "system";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isFromAdmin: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  name?: string;
  isGuestRoom: boolean;
  guestSessionId?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatUser {
  id: string;
  userId?: string;
  guestSessionId?: string;
  name?: string;
  email?: string;
  isAdmin: boolean;
  assignedAdminId?: string;
  lastSeen: string;
  createdAt: string;
}

export interface AvatarConfig {
  adminAvatar: string;
  userAvatar: string;
}

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: "small" | "medium" | "large";
  className?: string;
}

export interface ChatStatus {
  isTyping: boolean;
  isOnline: boolean;
  lastSeen: string;
}

export interface ButtonAction {
  label: string;
  value: string;
  callback?: (value: string) => void;
}

export interface WelcomeMessage {
  content: string;
  delay?: number;
  isFromAdmin: boolean;
  buttons?: ButtonAction[];
}

export interface SupaChatConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  localStorageKey: string;
  welcomeMessages?: WelcomeMessage[];
  enableUploads?: boolean;
  enableEmojis?: boolean;
  agentTypingDelay?: number;
  inputLockedAfterSend?: boolean;
  adminRole?: string;
  theme?: "light" | "dark" | "system";
  maxMessageLength?: number;
  enablePresence?: boolean;
  autoAssignAdmin?: boolean;
  guestSessionExpiry?: number;
  chatWidgetPosition?:
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left";
  chatWidgetSize?: {
    width: number;
    height: number;
  };
  maxFileSize?: number;
  allowedFileTypes?: string[];
  adminAvatar?: string;
  userAvatar?: string;
}

export interface SupaChatContextType {
  config: SupaChatConfig;
  currentUser: ChatUser | null;
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string, file?: File) => Promise<void>;
  markAsRead: () => Promise<void>;
  setTyping: (isTyping: boolean) => Promise<void>;
  createRoom: (name?: string) => Promise<ChatRoom>;
  joinRoom: (roomId: string) => Promise<void>;
}

export interface AdminPanelProps {
  rooms: ChatRoom[];
  onRoomSelect: (room: ChatRoom) => void;
  onAssignAdmin: (roomId: string, adminId: string) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  onMarkAsRead: (roomId: string) => Promise<void>;
  className?: string;
}

export interface ChatWidgetProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: { width: number; height: number };
  className?: string;
  showOnLoad?: boolean;
  customWelcomeMessage?: string;
  title?: string;
  subtitle?: string;
}

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  className?: string;
  buttons?: ButtonAction[];
  onButtonClick?: (action: ButtonAction) => void;
}

export interface TypingIndicatorProps {
  isTyping?: boolean;
  showAvatar?: boolean;
  className?: string;
}

export interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>;
  maxSize?: number;
  allowedTypes?: string[];
  className?: string;
  disabled?: boolean;
}

export interface ChatStoreState {
  sessionId: string | null;
  user: ChatUser | null;
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  unreadCount: number;
  inputLocked: boolean;
  setSessionId: (id: string) => void;
  setUser: (user: ChatUser | null) => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setUnreadCount: (count: number) => void;
  setInputLocked: (locked: boolean) => void;
  reset: () => void;
}

export interface Database {
  public: {
    Tables: {
      chat_rooms: {
        Row: {
          id: string;
          name: string | null;
          is_guest_room: boolean | null;
          guest_session_id: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          is_guest_room?: boolean | null;
          guest_session_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          is_guest_room?: boolean | null;
          guest_session_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string | null;
          user_id: string | null;
          guest_session_id: string | null;
          content: string;
          message_type: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          is_from_admin: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          user_id?: string | null;
          guest_session_id?: string | null;
          content: string;
          message_type?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          is_from_admin?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string | null;
          user_id?: string | null;
          guest_session_id?: string | null;
          content?: string;
          message_type?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          is_from_admin?: boolean | null;
          created_at?: string | null;
        };
      };
      chat_users: {
        Row: {
          id: string;
          user_id: string | null;
          guest_session_id: string | null;
          name: string | null;
          email: string | null;
          is_admin: boolean | null;
          assigned_admin_id: string | null;
          last_seen: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_session_id?: string | null;
          name?: string | null;
          email?: string | null;
          is_admin?: boolean | null;
          assigned_admin_id?: string | null;
          last_seen?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_session_id?: string | null;
          name?: string | null;
          email?: string | null;
          is_admin?: boolean | null;
          assigned_admin_id?: string | null;
          last_seen?: string | null;
          created_at?: string | null;
        };
      };
    };
  };
}
