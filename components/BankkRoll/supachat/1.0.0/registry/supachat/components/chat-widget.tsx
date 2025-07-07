/**
 * SupaChat - Chat Widget Component
 * Main chat bubble component with realtime messaging, emoji, uploads, and advanced config support.
 */

import { EmojiPicker } from "@/components/supachat/emoji-picker";
import { FileUploadButton } from "@/components/supachat/file-upload";
import { MessageBubble } from "@/components/supachat/message-bubble";
import { TypingIndicator } from "@/components/supachat/typing-indicator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useChat } from "@/hooks/supachat/use-chat";
import { useChatStatus } from "@/hooks/supachat/use-chat-status";
import { createChatStore } from "@/hooks/supachat/use-chat-store";
import { defaultConfig, validateConfig } from "@/lib/supachat/config";
import type {
  ButtonAction,
  ChatMessage,
  ChatWidgetProps,
  SupaChatConfig,
  WelcomeMessage,
} from "@/lib/supachat/types";
import { cn } from "@/lib/utils";
import { MessageCircle, Send, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

type WelcomeFlowState = "idle" | "running" | "complete";

export function ChatWidget(props: ChatWidgetProps & Partial<SupaChatConfig>) {
  return (
    <AnimatePresence mode="wait">
      <ChatWidgetContent {...props} />
    </AnimatePresence>
  );
}

function ChatWidgetContent(props: ChatWidgetProps & Partial<SupaChatConfig>) {
  const [isOpen, setIsOpen] = useState(props.showOnLoad ?? false);
  const [message, setMessage] = useState("");
  const [initialStep, setInitialStep] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [welcomeFlow, setWelcomeFlow] = useState<WelcomeFlowState>("idle");
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const config = useMemo(
    () =>
      validateConfig({
        ...defaultConfig,
        ...props,
        chatWidgetPosition: props.position ?? defaultConfig.chatWidgetPosition,
        chatWidgetSize: props.size ?? defaultConfig.chatWidgetSize,
      }),
    [props],
  );

  const chatStore = useMemo(
    () => createChatStore({ localStorageKey: config.localStorageKey }),
    [config.localStorageKey],
  );
  const inputLocked = chatStore((s: any) => s.inputLocked);
  const setInputLocked = chatStore((s: any) => s.setInputLocked);

  const {
    sendMessage,
    createRoom,
    isLoading,
    error,
    messages,
    currentRoom,
    hasNewMessages,
    markAsRead,
  } = useChat(config);
  const { isOnline } = useChatStatus(config);

  useEffect(() => {
    if (isOpen && hasNewMessages) {
      markAsRead();
    }
  }, [isOpen, hasNewMessages, markAsRead]);

  useEffect(() => {
    if (isOpen && !currentRoom) {
      createRoom();
    }
  }, [isOpen, currentRoom, createRoom]);

  const showNextInitial = useCallback(
    (step: number) => {
      if (!config.welcomeMessages || step >= config.welcomeMessages.length) {
        setShowTyping(false);
        setWelcomeFlow("complete");
        return;
      }
      setWelcomeFlow("running");
      const msg = config.welcomeMessages[step];
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        setInitialStep((s) => s + 1);
        setTimeout(
          () => showNextInitial(step + 1),
          (config.welcomeMessages?.[step + 1]?.delay ??
            config.agentTypingDelay) ||
            0,
        );
      }, msg.delay ?? config.agentTypingDelay);
    },
    [config.welcomeMessages, config.agentTypingDelay],
  );

  useEffect(() => {
    if (
      config.welcomeMessages &&
      isOpen &&
      currentRoom &&
      welcomeFlow === "idle" &&
      Array.isArray(messages) &&
      messages.length === 0
    ) {
      setInitialStep(0);
      setShowTyping(false);
      setWelcomeFlow("running");
      if (config.welcomeMessages.length > 0) {
        showNextInitial(0);
      }
    }
  }, [
    config.welcomeMessages,
    isOpen,
    currentRoom,
    showNextInitial,
    welcomeFlow,
    messages.length,
  ]);

  const bottomRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, initialStep, showTyping]);

  useEffect(() => {
    if (!config.inputLockedAfterSend) {
      setInputLocked(false);
      return;
    }
    if (messages.length === 0) {
      setInputLocked(false);
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) {
      setInputLocked(false);
      return;
    }
    if (!lastMsg.isFromAdmin) {
      setInputLocked(true);
    } else {
      setInputLocked(false);
    }
  }, [messages, config.inputLockedAfterSend, setInputLocked]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isLoading) return;
    await sendMessage(message.trim());
    setMessage("");
    inputRef.current?.focus();
    setWelcomeFlow("complete");
  }, [message, isLoading, sendMessage, config.inputLockedAfterSend]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (inputLocked) return;
      let value = e.target.value;
      if (config.maxMessageLength && value.length > config.maxMessageLength) {
        value = value.slice(0, config.maxMessageLength);
      }
      setMessage(value);
    },
    [inputLocked, config.maxMessageLength],
  );

  const handleButtonClick = useCallback((action: ButtonAction) => {
    if (action.callback) action.callback(action.value);
    if (action.value) setMessage(action.value);
  }, []);

  const handleFileSelect = useCallback(
    async (file: File) => {
      await sendMessage("[File uploaded]", file);
      setWelcomeFlow("complete");
    },
    [sendMessage],
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

  const positionClasses = useMemo(
    () => ({
      "bottom-right": "bottom-2 right-2 sm:bottom-4 sm:right-4",
      "bottom-left": "bottom-2 left-2 sm:bottom-4 sm:left-4",
      "top-right": "top-2 right-2 sm:top-4 sm:right-4",
      "top-left": "top-2 left-2 sm:top-4 sm:left-4",
    }),
    [],
  );

  if (!isOpen) {
    return (
      <motion.div
        key="chat-button"
        className="relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Button
          onClick={() => {
            setIsOpen(true);
          }}
          className={cn(
            "fixed z-50 rounded-full shadow-lg transition-all duration-300",
            "h-12 w-12 sm:h-auto sm:w-auto sm:px-4 sm:py-2",
            "text-sm sm:text-base",
            positionClasses[config.chatWidgetPosition!],
          )}
          size="lg"
        >
          <MessageCircle className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Chat with us</span>
        </Button>
        <AnimatePresence>
          {hasNewMessages && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="chat-widget"
      className={cn(
        "fixed z-50",
        positionClasses[config.chatWidgetPosition!],
        props.className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "shadow-xl",
          "w-[calc(100vw-1rem)] max-w-[400px] h-[calc(100vh-2rem)] p-0 gap-0",
        )}
        style={{
          width: config.chatWidgetSize?.width
            ? `${config.chatWidgetSize.width}px`
            : undefined,
          height: config.chatWidgetSize?.height
            ? `${config.chatWidgetSize.height}px`
            : undefined,
          maxWidth: config.chatWidgetSize?.width
            ? `${config.chatWidgetSize.width}px`
            : undefined,
          maxHeight: config.chatWidgetSize?.height
            ? `${config.chatWidgetSize.height}px`
            : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Chat widget"
      >
        <CardHeader className="p-2 pb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={config.adminAvatar} />
                <AvatarFallback className="text-xs sm:text-sm">
                  SA
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xs sm:text-sm font-semibold truncate">
                  {props.title ?? "Support Team"}
                </CardTitle>
                <div className="flex items-center space-x-1">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                      isOnline ? "bg-green-500" : "bg-gray-400",
                    )}
                    aria-label={isOnline ? "Online" : "Offline"}
                  />
                  <span className="text-xs text-muted-foreground">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0 flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <div className="h-full">
              <ScrollArea
                className="flex-1"
                style={{
                  height: config.chatWidgetSize?.height
                    ? `${config.chatWidgetSize.height - 130}px`
                    : undefined,
                }}
                ref={scrollRef}
              >
                <div className="p-2 sm:p-4 space-y-2 sm:space-y-4">
                  {config.welcomeMessages &&
                    initialStep > 0 &&
                    config.welcomeMessages
                      .slice(0, initialStep)
                      .map((msg: WelcomeMessage, i) => (
                        <MessageBubble
                          key={i}
                          message={{
                            id: `init-${i}`,
                            roomId: currentRoom?.id || "",
                            content: msg.content,
                            messageType: "system",
                            isFromAdmin: msg.isFromAdmin,
                            createdAt: new Date().toISOString(),
                          }}
                          isOwnMessage={!msg.isFromAdmin}
                          buttons={msg.buttons}
                          onButtonClick={handleButtonClick}
                          adminAvatar={config.adminAvatar}
                          userAvatar={config.userAvatar}
                        />
                      ))}
                  {messages.map((msg: ChatMessage) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwnMessage={!msg.isFromAdmin}
                      adminAvatar={config.adminAvatar}
                      userAvatar={config.userAvatar}
                    />
                  ))}
                  {showTyping && (
                    <TypingIndicator adminAvatar={config.adminAvatar} />
                  )}
                  {error && (
                    <div
                      className="text-red-500 text-xs sm:text-sm p-2 bg-red-50 rounded"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
          <Separator />
          <div className="p-2">
            <form
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              aria-label="Chat input form"
            >
              {config.enableUploads !== false && (
                <FileUploadButton
                  onFileSelect={handleFileSelect}
                  disabled={isLoading || showTyping || inputLocked}
                  maxSize={config.maxFileSize}
                  allowedTypes={config.allowedFileTypes}
                />
              )}
              {config.enableEmojis !== false && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  disabled={isLoading || showTyping || inputLocked}
                />
              )}
              <Input
                ref={inputRef}
                value={message}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading || showTyping || inputLocked}
                className="flex-1 text-xs sm:text-sm mx-2"
                aria-label="Type your message"
                autoComplete="off"
                maxLength={config.maxMessageLength}
              />
              <Button
                type="submit"
                disabled={
                  !message.trim() || isLoading || showTyping || inputLocked
                }
                size="sm"
                className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0"
                aria-label="Send message"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
