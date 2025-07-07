/**
 * SupaChat - Typing Indicator Component
 * Animated typing indicator for chat UI.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface TypingIndicatorProps {
  isTyping?: boolean;
  showAvatar?: boolean;
  className?: string;
  adminAvatar: string;
}

export function TypingIndicator({
  isTyping = true,
  showAvatar = true,
  className,
  adminAvatar,
}: TypingIndicatorProps) {
  if (!isTyping) return null;

  return (
    <div className={cn("flex gap-1 sm:gap-2", className)}>
      {showAvatar && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <AvatarImage src={adminAvatar} />
          <AvatarFallback className="text-xs sm:text-sm">A</AvatarFallback>
        </Avatar>
      )}

      <div className="bg-muted rounded-lg px-2 py-1.5 sm:px-3 sm:py-3">
        <div className="flex space-x-0.5 sm:space-x-1">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
}
