/**
 * SupaChat - Message Bubble Component
 * Displays chat messages, files, and actions in a styled bubble.
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ButtonAction, ChatMessage } from "@/lib/supachat/types";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Download, Paperclip } from "lucide-react";

export interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage?: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  className?: string;
  buttons?: ButtonAction[];
  onButtonClick?: (action: ButtonAction) => void;
  adminAvatar: string;
  userAvatar: string;
}

export function MessageBubble({
  message,
  isOwnMessage = false,
  showAvatar = true,
  showTimestamp = true,
  className,
  buttons,
  onButtonClick,
  adminAvatar,
  userAvatar,
}: MessageBubbleProps) {
  const isFromAdmin = message.isFromAdmin;
  const isFileMessage = message.messageType === "file";
  const isImageFile =
    isFileMessage && message.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

  const handleFileDownload = () => {
    if (message.fileUrl) {
      const link = document.createElement("a");
      link.href = message.fileUrl;
      link.download = message.fileName || "download";
      link.click();
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div
      className={cn(
        "flex gap-1 sm:gap-2 group",
        isOwnMessage ? "flex-row-reverse" : "flex-row",
        className,
      )}
    >
      {showAvatar && !isOwnMessage && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <AvatarImage src={isFromAdmin ? adminAvatar : userAvatar} />
          <AvatarFallback className="text-xs sm:text-sm">
            {isFromAdmin ? "A" : "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "flex flex-col max-w-[85%] sm:max-w-[80%]",
          isOwnMessage ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-lg px-2 py-1.5 sm:px-3 sm:py-2",
            isOwnMessage
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
          )}
        >
          {isFileMessage ? (
            <div className="space-y-1.5 sm:space-y-2">
              {isImageFile && message.fileUrl && (
                <div className="rounded-md overflow-hidden">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName || "Image"}
                    className="max-w-full h-auto max-h-48 sm:max-h-64 object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">
                    {message.fileName}
                  </p>
                  {message.fileSize && (
                    <p className="text-xs opacity-70">
                      {formatFileSize(message.fileSize)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFileDownload}
                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 opacity-70 hover:opacity-100"
                >
                  <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
              {message.content && (
                <p className="text-xs sm:text-sm mt-1.5 sm:mt-2">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
        </div>
        {buttons && buttons.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2 mt-1.5 sm:mt-2">
            {buttons.map((btn) => (
              <Button
                key={btn.value}
                variant="outline"
                size="sm"
                onClick={() => onButtonClick?.(btn)}
                className="text-xs h-7 px-2 sm:h-8 sm:px-3"
              >
                {btn.label}
              </Button>
            ))}
          </div>
        )}
        {showTimestamp && (
          <p
            className={cn(
              "text-xs opacity-70 mt-1",
              isOwnMessage ? "text-right" : "text-left",
            )}
          >
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </p>
        )}
      </div>
      {showAvatar && isOwnMessage && (
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
          <AvatarImage src={userAvatar} />
          <AvatarFallback className="text-xs sm:text-sm">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
