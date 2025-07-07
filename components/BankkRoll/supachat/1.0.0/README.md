# SupaChat

![image](https://github.com/user-attachments/assets/905a4fd5-edf6-466d-b86a-cad08b0f5f5d)

SupaChat provides a complete realtime messaging solution with Supabase integration, admin panel, file uploads, emoji support and more!

## Features

- **Realtime Messaging**: Instant message delivery with Supabase realtime subscriptions
- **Admin Panel**: Complete admin interface for conversation management
- **File Uploads**: Drag-and-drop file uploads with image previews
- **Guest Sessions**: Support for both authenticated users and guest sessions
- **Row-Level Security**: Enterprise-grade security with RLS policies
- **TypeScript First**: Full TypeScript support with comprehensive types
- **One Command Install**: Install everything with a single ShadCN command

> **Note:** The current version of SupaChat supports only guest (anonymous) chat sessions. Authenticated user chat is not included out of the box, but the schema and codebase are designed for future extensibility.

## Quick Start

### Installation

```bash
npx shadcn@latest add https://supachat.site/r/supachat
```

### Environment Setup

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the SQL schema in your Supabase SQL Editor:

View the schema here: [supachat-schema.sql](registry/supachat/migrations/supabase/supachat-schema.sql)

### Basic Usage

```tsx
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

### Admin Panel

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

## Documentation

For detailed setup instructions, configuration options, and advanced usage, see:

**[Complete Documentation](./registry/supachat/supachat-setup.md)**

## Development

### Running the Registry Locally

1. Install dependencies:

```bash
pnpm install
```

2. Start the development server:

```bash
pnpm dev
```

3. The registry will be available at:

- Main registry: `http://localhost:3000/r`
- SupaChat block: `http://localhost:3000/r/supachat`

### Building the Registry

```bash
pnpm registry:build
```

This generates the registry JSON files in the `public/r/` directory.

## Registry Structure

```
registry/
└── supachat/                  # SupaChat block
    ├── components/
    │   ├── ui/                # ShadCN UI primitives (11 components)
    │   └── supachat/          # SupaChat components (6 components)
    ├── hooks/                 # React hooks (4 hooks)
    ├── lib/                   # Configuration and utilities (6 files)
    ├── migrations/            # Database schema
    └── supachat-setup.md      # Setup documentation
```

## Components

### Core Components

- `ChatWidget`: Main chat interface with configurable positioning
- `AdminPanel`: Complete admin dashboard for conversation management
- `MessageBubble`: Individual message display with file support
- `TypingIndicator`: Animated typing indicator component
- `FileUpload`: File upload interface with drag-and-drop
- `EmojiPicker`: Advanced emoji picker with search and categories

### Hooks

- `useChat`: Core chat functionality and message management
- `useChatStatus`: Presence and typing management
- `useAdmin`: Admin operations and room management
- `useChatSession`: Session management and persistence
- `useChatStore`: Global state management with Zustand

## Configuration

SupaChat is highly configurable through the `SupaChatConfig` interface:

```typescript
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
}
```

## Security

- Row-level security policies protect all data
- Guest sessions are properly isolated
- Admin access controlled via role-based permissions
- File uploads secured with access controls
- All messages encrypted in transit

## Performance

- Optimized database indexes for message queries
- Efficient realtime subscriptions
- Minimal bundle size with tree-shaking
- Optimized file upload handling
- Responsive design for all screen sizes

## Contributing

We welcome contributions! Please see our contributing guidelines:

### Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `pnpm install`
4. Start development server: `pnpm dev`
5. Make your changes
6. Test thoroughly
7. Submit a pull request

### Guidelines

- Follow the existing code style and patterns
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation as needed
- Ensure all components are responsive
- Test with both authenticated and guest users

### Areas for Contribution

- Bug fixes and improvements
- New features and components
- Documentation improvements
- Performance optimizations
- Security enhancements
- Accessibility improvements

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

SupaChat is built on top of excellent open-source projects:

- **[ShadCN UI](https://ui.shadcn.com)** - Component system and registry architecture
- **[Supabase](https://supabase.com)** - Realtime database and authentication infrastructure
- **[Next.js](https://nextjs.org)** - React framework and SSR support
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com)** - Accessible UI primitives
- **[Zustand](https://github.com/pmndrs/zustand)** - State management
- **[Lucide React](https://lucide.dev)** - Icon library
- **[Emoji Datasource](https://github.com/iamcal/emoji-data?tab=readme-ov-file#emoji-data---easy-to-consume-emoji-data-and-images)** - Emoji library

Special thanks to the ShadCN team for creating the registry system that makes distributing complex component suites possible with a single CLI command.

## Support

- **Documentation**: [Complete setup guide](./registry/supachat/supachat-setup.md)
- **Issues**: [GitHub Issues](https://github.com/BankkRoll/supachat/issues) for bugs and feature requests
- **Discussions**: [GitHub Discussions](https://github.com/BankkRoll/supachat/discussions) for questions
