/**
 * SupaChat - Admin Panel Component
 * Complete admin interface for managing chat conversations, with realtime messaging, emoji, uploads, and advanced config support.
 */

"use client";

import { EmojiPicker } from "@/components/supachat/emoji-picker";
import { FileUploadButton } from "@/components/supachat/file-upload";
import { MessageBubble } from "@/components/supachat/message-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAdmin } from "@/hooks/supachat/use-admin";
import { useChat } from "@/hooks/supachat/use-chat";
import { createChatStore } from "@/hooks/supachat/use-chat-store";
import { defaultConfig, validateConfig } from "@/lib/supachat/config";
import type { ChatMessage, ChatRoom } from "@/lib/supachat/types";
import { cn } from "@/lib/utils";
import {
  Clock,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

export function AdminPanel() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const config = validateConfig(defaultConfig);
  const chatStore = useMemo(
    () => createChatStore({ localStorageKey: config.localStorageKey }),
    [config.localStorageKey],
  );
  const setInputLocked = chatStore((s: any) => s.setInputLocked);

  const { rooms, isLoading, error, sendAdminMessage, deleteRoom, markAsRead } =
    useAdmin(config);
  const { messages } = useChat(config);

  const filteredRooms = rooms.filter(
    (room) =>
      room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.guestSessionId?.includes(searchQuery),
  );

  const bottomRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedRoom) return;

    await sendAdminMessage(selectedRoom.id, message.trim());
    setMessage("");
    setInputLocked(false);
  }, [message, selectedRoom, sendAdminMessage, setInputLocked]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!selectedRoom) return;
      await sendAdminMessage(selectedRoom.id, `[File uploaded: ${file.name}]`);
      setMessage("");
    },
    [selectedRoom, sendAdminMessage],
  );

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      if (!inputRef.current) return;
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newValue);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    },
    [message],
  );

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      if (config.maxMessageLength && value.length > config.maxMessageLength) {
        value = value.slice(0, config.maxMessageLength);
      }
      setMessage(value);
    },
    [config.maxMessageLength],
  );

  return (
    <div className="flex h-screen bg-background">
      <div
        className={cn(
          "w-full sm:w-80 h-full border-r bg-muted/30",
          "lg:relative lg:translate-x-0",
          isSidebarOpen ? "block" : "hidden lg:block",
        )}
      >
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base sm:text-lg font-semibold">
                SupaChat Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage conversations
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
          <div className="space-y-2 p-2 sm:p-3">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedRoom?.id === room.id}
                onSelect={() => {
                  setSelectedRoom(room);
                  setIsSidebarOpen(false);
                }}
                onDelete={() => deleteRoom(room.id)}
                onMarkAsRead={() => markAsRead(room.id)}
                userAvatar={config.userAvatar}
              />
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-3 sm:p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {selectedRoom ? (
                <>
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={config.userAvatar} />
                    <AvatarFallback className="text-sm">
                      {selectedRoom.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-sm sm:text-base truncate">
                      {selectedRoom.name ||
                        `Guest ${selectedRoom.guestSessionId?.slice(0, 8)}`}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedRoom.isGuestRoom
                        ? "Guest Session"
                        : "User Session"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-sm sm:text-base">
                    Select a conversation
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Choose from the sidebar to start chatting
                  </p>
                </div>
              )}
            </div>

            {selectedRoom && (
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Badge
                  variant={
                    selectedRoom.unreadCount > 0 ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {selectedRoom.unreadCount} unread
                </Badge>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {selectedRoom ? (
          <>
            <ScrollArea className="flex-1 p-2 sm:p-3 lg:p-4" ref={scrollRef}>
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                {messages.map((msg: ChatMessage) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwnMessage={!msg.isFromAdmin}
                    adminAvatar={config.adminAvatar}
                    userAvatar={config.userAvatar}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="p-2 sm:p-3 border-t">
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                aria-label="Admin chat input form"
              >
                {config.enableUploads !== false && (
                  <FileUploadButton
                    onFileSelect={handleFileSelect}
                    disabled={false}
                    maxSize={config.maxFileSize}
                    allowedTypes={config.allowedFileTypes}
                  />
                )}
                {config.enableEmojis !== false && (
                  <EmojiPicker onSelect={handleEmojiSelect} />
                )}
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={false}
                  className="flex-1 text-sm"
                  aria-label="Type your message"
                  autoComplete="off"
                  maxLength={config.maxMessageLength}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  size="sm"
                  className="h-9 w-9 sm:h-10 sm:w-auto sm:px-4 p-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-4">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No conversation selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RoomCard({
  room,
  isSelected,
  onSelect,
  onDelete,
  onMarkAsRead,
  userAvatar,
}: {
  room: ChatRoom;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMarkAsRead: () => void;
  userAvatar: string;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent",
        isSelected && "bg-accent border-primary",
      )}
      onClick={onSelect}
    >
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 min-w-0 flex-1">
            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 flex-shrink-0">
              <AvatarImage src={userAvatar} />
              <AvatarFallback className="text-xs">
                {room.name?.charAt(0) || "G"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-xs sm:text-sm truncate">
                {room.name || `Guest ${room.guestSessionId?.slice(0, 8)}`}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {room.lastMessage?.content || "No messages yet"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            {room.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {room.unreadCount}
              </Badge>
            )}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead();
                }}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0"
              >
                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-destructive"
              >
                <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
