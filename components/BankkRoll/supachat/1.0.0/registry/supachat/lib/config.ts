/**
 * SupaChat Configuration
 * Complete configuration for the chat system with avatar support.
 */

import { z } from "zod";

export const defaultConfig: SupaChatConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  localStorageKey: "supachat-store",

  // Avatar Configuration
  adminAvatar: "/admin-avatar.png",
  userAvatar: "/user-avatar.png",

  // Widget Configuration
  chatWidgetPosition: "bottom-right",
  chatWidgetSize: {
    width: 400,
    height: 650,
  },

  // Message Configuration
  welcomeMessages: [
    {
      content:
        "👋 Welcome to SupaChat! A configurable chat system built with Next.js, Supabase, and ShadCN. This is open-source software - feel free to contribute, report bugs, or build your own version!",
      delay: 800,
      isFromAdmin: true,
    },
    {
      content:
        "Check out the GitHub repo for issues, discussions, and contribution guidelines!",
      delay: 500,
      isFromAdmin: true,
      buttons: [
        {
          label: "🐙 GitHub Repo",
          value: "https://github.com/BankkRoll/SupaChat",
          callback: () => {
            if (typeof window !== "undefined") {
              window.open("https://github.com/BankkRoll/SupaChat", "_blank");
            }
          },
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
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: ["image/*", "application/pdf", "text/*"],

  // Admin Configuration
  adminRole: "admin",

  // Theme Configuration
  theme: "system",

  // Session Configuration
  guestSessionExpiry: 24 * 60 * 60 * 1000,
};

export const ButtonActionSchema = z.object({
  label: z.string(),
  value: z.string(),
  callback: z.function().args(z.string()).returns(z.void()).optional(),
});

export const WelcomeMessageSchema = z.object({
  content: z.string(),
  delay: z.number().optional(),
  isFromAdmin: z.boolean(),
  buttons: z.array(ButtonActionSchema).optional(),
});

export const SupaChatConfigSchema = z.object({
  supabaseUrl: z.string().url(),
  supabaseAnonKey: z.string(),
  localStorageKey: z.string().default("supachat-store"),

  adminAvatar: z.string().default("/admin-avatar.png"),
  userAvatar: z.string().default("/user-avatar.png"),

  chatWidgetPosition: z
    .enum(["bottom-right", "bottom-left", "top-right", "top-left"])
    .default("bottom-right"),
  chatWidgetSize: z
    .object({
      width: z.number().default(400),
      height: z.number().default(650),
    })
    .optional(),

  welcomeMessages: z.array(WelcomeMessageSchema).optional(),
  maxMessageLength: z.number().default(2000),
  agentTypingDelay: z.number().min(0).max(5000).default(800),
  inputLockedAfterSend: z.boolean().default(true),

  enableUploads: z.boolean().default(true),
  enableEmojis: z.boolean().default(true),
  enablePresence: z.boolean().default(true),
  autoAssignAdmin: z.boolean().default(true),

  maxFileSize: z.number().default(10 * 1024 * 1024),
  allowedFileTypes: z
    .array(z.string())
    .default(["image/*", "application/pdf", "text/*"]),

  adminRole: z.string().default("admin"),

  theme: z.enum(["light", "dark", "system"]).default("system"),

  guestSessionExpiry: z.number().default(24 * 60 * 60 * 1000),
});

export type SupaChatConfig = z.infer<typeof SupaChatConfigSchema>;
export type ButtonAction = z.infer<typeof ButtonActionSchema>;
export type WelcomeMessage = z.infer<typeof WelcomeMessageSchema>;

export function validateConfig(
  config: Partial<SupaChatConfig>,
): SupaChatConfig {
  return SupaChatConfigSchema.parse({
    ...defaultConfig,
    ...config,
  });
}

export function getConfigFromEnv(): SupaChatConfig {
  return validateConfig({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}
