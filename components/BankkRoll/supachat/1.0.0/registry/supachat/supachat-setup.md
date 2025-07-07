# SupaChat - Production-Ready Chat System

A complete, realtime chat system built with Supabase, React, and TypeScript. Features realtime messaging, admin panel, file uploads, typing indicators, and guest session support.

## 🚀 Quick Start

### Installation

```bash
# Install via shadcn CLI
npx shadcn@latest add https://supachat.site/r/supachat

# Or install manually
npm install @supabase/supabase-js @supabase/ssr react-markdown date-fns lucide-react clsx tailwind-merge zod react-dropzone emoji-datasource
```

### Dependencies

SupaChat requires the following dependencies:

**Core Dependencies:**

- `@supabase/supabase-js` - Supabase client library
- `@supabase/ssr` - Server-side rendering support
- `react-markdown` - Markdown rendering for messages
- `date-fns` - Date formatting utilities
- `lucide-react` - Icon library
- `clsx` - Conditional className utility
- `tailwind-merge` - Tailwind CSS class merging
- `zod` - Schema validation
- `react-dropzone` - File upload handling
- `emoji-datasource` - Emoji data and utilities

**ShadCN UI Dependencies:**

- `button`, `input`, `card`, `avatar`, `badge`
- `scroll-area`, `textarea`, `dropdown-menu`
- `popover`, `separator`, `sheet`

These are automatically installed when using the shadcn CLI.

### Environment Setup

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Go to your Supabase project dashboard
2. Open SQL Editor
3. Run the schema from `migrations/supabase/supachat-schema.sql`
4. Verify tables and policies are created

### Basic Usage

```tsx
// app/layout.tsx
import { ChatWidget } from "@/components/supachat/chat-widget";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <ChatWidget
        position="bottom-right"
        title="Support Team"
        showOnLoad={false}
      />
    </div>
  );
}
```

## 🎉 Installation Success

After installation, you'll see this message:

```
🎉 SupaChat installed successfully!

📋 Next steps:
1. Run the SQL schema in your Supabase SQL Editor
2. Add your Supabase keys to .env.local
3. Add <ChatWidget /> to your layout
4. Create an admin page with <AdminPanel />
5. Middleware automatically protects admin routes
6. Customize the configuration as needed

📖 See supachat-setup.md for detailed instructions.
```

## 📁 Project Structure

After installation, you'll have:

```
components/
├── ui/                    # ShadCN UI primitives
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── dropdown-menu.tsx
│   ├── input.tsx
│   ├── popover.tsx
│   ├── scroll-area.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   └── textarea.tsx
└── supachat/             # SupaChat components
    ├── chat-widget.tsx
    ├── admin-panel.tsx
    ├── message-bubble.tsx
    ├── typing-indicator.tsx
    ├── file-upload.tsx
    └── emoji-picker.tsx

hooks/
└── supachat/             # SupaChat hooks
    ├── use-chat.ts
    ├── use-chat-status.ts
    ├── use-admin.ts
    ├── use-chat-session.ts
    └── use-chat-store.ts

lib/
├── supachat/             # SupaChat configuration
│   ├── config.ts
│   ├── types.ts
│   └── utils.ts
└── supabase/             # Supabase configuration
    ├── client.ts
    ├── server.ts
    └── middleware.ts

migrations/
└── supabase/
    └── supachat-schema.sql

middleware.ts             # Next.js middleware
supachat-setup.md         # This documentation
```

## 🎯 Core Components

### ChatWidget

The main chat interface with configurable positioning and behavior.

```tsx
import { ChatWidget } from "@/components/supachat/chat-widget";

<ChatWidget
  // Positioning
  position="bottom-right" // "bottom-right" | "bottom-left" | "top-right" | "top-left"
  size={{ width: 400, height: 600 }}
  // Appearance
  title="Customer Support"
  className="custom-styles"
  // Behavior
  showOnLoad={false}
  enableUploads={true}
  enableEmojis={true}
  // Welcome messages
  welcomeMessages={[
    {
      content: "👋 Welcome! How can I help?",
      delay: 500,
      isFromAdmin: true,
      buttons: [
        {
          label: "View Docs",
          value: "/docs",
          callback: () => (window.location.href = "/docs"),
        },
      ],
    },
  ]}
/>;
```

### AdminPanel

Complete admin interface for managing conversations.

```tsx
// app/admin/page.tsx
import { AdminPanel } from "@/components/supachat/admin-panel";

export default function AdminPage() {
  return (
    <div className="h-screen">
      <AdminPanel />
    </div>
  );
}
```

### MessageBubble

Individual message display with file support.

```tsx
import { MessageBubble } from "@/components/supachat/message-bubble";

<MessageBubble
  message={message}
  isOwnMessage={message.userId === currentUserId}
  showTimestamp={true}
  showAvatar={true}
  buttons={message.buttons}
  onButtonClick={handleButtonClick}
/>;
```

### TypingIndicator

Animated typing indicator.

```tsx
import { TypingIndicator } from "@/components/supachat/typing-indicator";

<TypingIndicator
  isTyping={true}
  showAvatar={true}
  className="custom-typing-styles"
/>;
```

### FileUpload

File upload with drag-and-drop support.

```tsx
import { FileUploadButton } from "@/components/supachat/file-upload";

<FileUploadButton
  onFileSelect={handleFileUpload}
  maxSize={10 * 1024 * 1024} // 10MB
  allowedTypes={["image/*", "application/pdf", "text/*"]}
  disabled={false}
/>;
```

### EmojiPicker

Advanced emoji picker with search and categories.

```tsx
import { EmojiPicker } from "@/components/supachat/emoji-picker";

<EmojiPicker onSelect={handleEmojiSelect} disabled={false} />;
```

## 🔧 Configuration

### Default Configuration

```typescript
// lib/supachat/config.ts
export const defaultConfig: SupaChatConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  localStorageKey: "supachat-store",

  // Avatar Configuration
  adminAvatar: "/admin-avatar.png",
  userAvatar: "/user-avatar.png",

  // Widget Configuration
  chatWidgetPosition: "bottom-right",
  chatWidgetSize: { width: 400, height: 650 },

  // Message Configuration
  welcomeMessages: [
    {
      content:
        "👋 Welcome! I'm here to help you get the most out of our platform.",
      delay: 500,
      isFromAdmin: true,
    },
    {
      content: "What would you like to explore today?",
      delay: 800,
      isFromAdmin: true,
      buttons: [
        {
          label: "📚 Documentation",
          value: "/docs",
          callback: () => (window.location.href = "/docs"),
        },
      ],
    },
  ],
  maxMessageLength: 2000,
  agentTypingDelay: 800,
  inputLockedAfterSend: true,

  // Feature Configuration
  enableUploads: true,
  enableEmojis: true,
  enablePresence: true,
  autoAssignAdmin: true,

  // File Upload Configuration
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ["image/*", "application/pdf", "text/*"],

  // Admin Configuration
  adminRole: "admin",

  // Theme Configuration
  theme: "system",

  // Session Configuration
  guestSessionExpiry: 24 * 60 * 60 * 1000, // 24 hours
};
```

### Custom Configuration

```tsx
// Override defaults in components
<ChatWidget
  adminAvatar="/custom-admin.png"
  userAvatar="/custom-user.png"
  enableUploads={false}
  agentTypingDelay={2000}
  theme="dark"
  chatWidgetPosition="bottom-left"
  chatWidgetSize={{ width: 500, height: 700 }}
  maxFileSize={5 * 1024 * 1024} // 5MB
  allowedFileTypes={["image/*"]}
/>
```

## 🪝 Hooks

### useChat

Main chat functionality hook.

```tsx
import { useChat } from "@/hooks/supachat/use-chat";
import { validateConfig, defaultConfig } from "@/lib/supachat/config";

function MyChatComponent() {
  const config = validateConfig(defaultConfig);
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    createRoom,
    currentRoom,
    hasNewMessages,
    markAsRead,
  } = useChat(config);

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {/* Chat input */}
    </div>
  );
}
```

### useAdmin

Admin operations and room management.

```tsx
import { useAdmin } from "@/hooks/supachat/use-admin";

function AdminComponent() {
  const config = validateConfig(defaultConfig);
  const {
    rooms,
    selectedRoom,
    isLoading,
    error,
    sendAdminMessage,
    deleteRoom,
    markAsRead,
    assignAdmin,
    getRoomStats,
  } = useAdmin(config);

  const handleSendAdminMessage = async (roomId: string, content: string) => {
    await sendAdminMessage(roomId, content);
  };

  return (
    <div>
      {rooms.map((room) => (
        <div key={room.id}>
          <h3>{room.name}</h3>
          <p>Unread: {room.unreadCount}</p>
          <button onClick={() => markAsRead(room.id)}>Mark as Read</button>
        </div>
      ))}
    </div>
  );
}
```

### useChatStatus

Presence and typing management.

```tsx
import { useChatStatus } from "@/hooks/supachat/use-chat-status";

function ChatStatusComponent() {
  const config = validateConfig(defaultConfig);
  const {
    isTyping,
    isOnline,
    lastSeen,
    typingUsers,
    setTyping,
    updateLastSeen,
  } = useChatStatus(config);

  return (
    <div>
      <div className={`status ${isOnline ? "online" : "offline"}`}>
        {isOnline ? "Online" : "Offline"}
      </div>
      {isTyping && <TypingIndicator />}
    </div>
  );
}
```

### useChatSession

Session management and persistence.

```tsx
import { useChatSession } from "@/hooks/supachat/use-chat-session";

function SessionComponent() {
  const config = validateConfig(defaultConfig);
  const { sessionId, isNewSession, restoreSession, clearSession } =
    useChatSession(config);

  return (
    <div>
      <p>Session: {sessionId}</p>
      {isNewSession && <p>New session started</p>}
      <button onClick={clearSession}>Clear Session</button>
    </div>
  );
}
```

### useChatStore

Global state management with Zustand.

```tsx
import { createChatStore } from "@/hooks/supachat/use-chat-store";

function StoreComponent() {
  const chatStore = createChatStore({ localStorageKey: "my-chat-store" });
  const sessionId = chatStore((s) => s.sessionId);
  const setSessionId = chatStore((s) => s.setSessionId);
  const messages = chatStore((s) => s.messages);
  const addMessage = chatStore((s) => s.addMessage);

  return (
    <div>
      <p>Session: {sessionId}</p>
      <p>Messages: {messages.length}</p>
      <button onClick={() => addMessage(newMessage)}>Add Message</button>
    </div>
  );
}
```

## 🗄️ Database Schema

### Tables

- **chat_rooms**: Conversation metadata
- **messages**: Individual messages with file support
- **chat_users**: User information and admin assignments

### Key Features

- Row-level security (RLS) policies
- Automatic timestamps
- File upload support
- Guest session isolation
- Admin role management

### Storage

- `chat-files` bucket for file uploads
- Secure access policies
- Automatic cleanup

## 🔒 Security

### Authentication

- Supports authenticated users and guest sessions
- Row-level security protects all data
- Admin access via role-based permissions
- Secure session management

### Data Protection

- Messages encrypted in transit
- Guest sessions properly isolated
- File uploads secured
- No sensitive data in client code

## 🎨 Styling

### CSS Variables

The system includes custom CSS variables for theming:

```css
:root {
  --chat-primary: 222.2 84% 4.9%;
  --chat-primary-foreground: 210 40% 98%;
  --chat-secondary: 210 40% 96%;
  --chat-secondary-foreground: 222.2 84% 4.9%;
  --chat-muted: 210 40% 96%;
  --chat-muted-foreground: 215.4 16.3% 46.9%;
  --chat-accent: 210 40% 96%;
  --chat-accent-foreground: 222.2 84% 4.9%;
  --chat-border: 214.3 31.8% 91.4%;
  --chat-input: 0 0% 100%;
  --chat-ring: 222.2 84% 4.9%;
}
```

### Custom Styling

```tsx
<ChatWidget
  className="custom-chat-widget"
  style={
    {
      "--chat-primary": "220 14% 96%",
      "--chat-primary-foreground": "220 9% 46%",
    } as React.CSSProperties
  }
/>
```

## 🚀 Advanced Features

### Realtime Messaging

- Supabase realtime subscriptions
- Automatic message synchronization
- Typing indicators
- Online/offline status

### File Uploads

- Drag-and-drop interface
- File type validation
- Image previews
- Progress indicators

### Guest Sessions

- Automatic UUID generation
- Persistent sessions
- Secure isolation
- Configurable expiry

### Admin Features

- Real-time conversation monitoring
- Message history and search
- Admin assignment
- Conversation management

## 🔧 Middleware

The middleware automatically:

- Protects admin routes (`/admin/*`)
- Redirects unauthenticated users to `/auth/login`
- Redirects non-admin users to `/`
- Allows guest access to chat routes

```typescript
// middleware.ts (automatically installed)
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}
```

## 📱 Responsive Design

All components are fully responsive:

- Mobile-first design
- Touch-friendly interfaces
- Adaptive layouts
- Optimized for all screen sizes

## 🐛 Troubleshooting

### Common Issues

1. **Messages not appearing**

   - Verify RLS policies in Supabase
   - Check environment variables
   - Ensure database schema is applied

2. **Realtime not working**

   - Verify Supabase URL and anon key
   - Check network connectivity
   - Ensure realtime is enabled in Supabase

3. **File uploads failing**

   - Verify storage bucket permissions
   - Check file size limits
   - Ensure bucket policies are correct

4. **Admin access denied**
   - Check user roles in `chat_users` table
   - Verify admin configuration
   - Ensure middleware is working

### Debug Mode

```typescript
const config = validateConfig({
  ...defaultConfig,
  debug: true, // Enable debug logging
});
```

### Error Handling

```tsx
const { error, isLoading } = useChat(config);

if (error) {
  return (
    <div className="error-message">
      <p>Error: {error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );
}
```

## 📚 API Reference

### Components

| Component          | Description         | Props                   |
| ------------------ | ------------------- | ----------------------- |
| `ChatWidget`       | Main chat interface | `ChatWidgetProps`       |
| `AdminPanel`       | Admin dashboard     | `AdminPanelProps`       |
| `MessageBubble`    | Message display     | `MessageBubbleProps`    |
| `TypingIndicator`  | Typing animation    | `TypingIndicatorProps`  |
| `FileUploadButton` | File upload         | `FileUploadButtonProps` |
| `EmojiPicker`      | Emoji selection     | `EmojiPickerProps`      |

### Hooks

| Hook             | Description             | Returns                        |
| ---------------- | ----------------------- | ------------------------------ |
| `useChat`        | Core chat functionality | Chat state and methods         |
| `useAdmin`       | Admin operations        | Admin state and methods        |
| `useChatStatus`  | Presence management     | Status state and methods       |
| `useChatSession` | Session management      | Session state and methods      |
| `useChatStore`   | Global state management | Zustand store with persistence |

### Types

```typescript
interface ChatMessage {
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

interface SupaChatConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  localStorageKey: string;
  adminAvatar?: string;
  userAvatar?: string;
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
  chatWidgetSize?: { width: number; height: number };
  maxFileSize?: number;
  allowedFileTypes?: string[];
}
```
