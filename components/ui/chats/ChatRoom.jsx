"use client";

import { useState, useEffect, useRef } from "react";
import { useChatContext } from "@/context/ChatContext";
import { useEncryption } from "@/hooks/useEncryption";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, Eye, EyeOff, Users, Wifi, WifiOff } from "lucide-react";
// Things that are wrong: Decryption of messages, it should ask for the room pin to decrypt the sent and recieved messages, 
// Import existing components
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import TypingIndicator from "@/components/ui/chat/typing-indicator";
import RoomKeyModal from "./RoomKeyModal";

export default function ChatRoom({ room }) {
  const { user } = useAuth();
  const {
    messages,
    roomMembers,
    typingUsers,
    isConnected,
    roomKey,
    autoDecrypt,
    sendMessage,
    startTyping,
    stopTyping,
    setEncryptionKey,
    setAutoDecrypt,
  } = useChatContext();

  const { encrypt, decrypt, sign } = useEncryption(roomKey);

  const [showKeyModal, setShowKeyModal] = useState(!roomKey);
  const [decryptedMessages, setDecryptedMessages] = useState(new Map());

  // Handle message decryption
  const handleDecryptMessage = async (messageId, encryptedContent) => {
    if (!decrypt || !roomKey) {
      toast.error("Room key not set");
      return;
    }

    try {
      const decrypted = decrypt(encryptedContent);
      setDecryptedMessages(
        (prev) =>
          new Map(
            prev.set(messageId, {
              content: decrypted,
              error: false,
            })
          )
      );
    } catch (error) {
      console.error("Decryption error:", error);
      setDecryptedMessages(
        (prev) =>
          new Map(
            prev.set(messageId, {
              content: "",
              error: true,
            })
          )
      );
      toast.error("Failed to decrypt message");
    }
  };

  // Auto-decrypt messages when auto-decrypt is enabled
  useEffect(() => {
    if (autoDecrypt && decrypt && roomKey) {
      messages.forEach((message) => {
        if (!decryptedMessages.has(message.id)) {
          handleDecryptMessage(message.id, message.message);
        }
      });
    }
  }, [messages, autoDecrypt, decrypt, roomKey]);

  // Handle sending messages
  const handleSendMessage = async (messageText) => {
    if (!encrypt || !sign) {
      toast.error("Room key not set");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const encryptedMessage = encrypt(messageText);
      const signature = sign(messageText, timestamp);

      sendMessage(encryptedMessage, signature);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  // Handle typing indicators
  const handleTyping = (isTyping) => {
    if (isTyping) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  // Set room key and close modal
  const handleSetRoomKey = (key) => {
    setEncryptionKey(key);
    setShowKeyModal(false);
    toast.success("Room key set successfully!");
  };

  // Get user initials for avatar
  const getUserInitials = (senderId, senderName) => {
    if (senderId === user?.$id) return user.name?.[0] || user.email?.[0] || "Y";
    return senderName?.[0] || "U";
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              Connected
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center gap-1">
              <WifiOff className="h-3 w-3" />
              Disconnected
            </Badge>
          )}

          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {roomMembers.length} online
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKeyModal(true)}
          >
            <Key className="h-4 w-4 mr-1" />
            {roomKey ? "Change Key" : "Set Key"}
          </Button>

          {roomKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoDecrypt(!autoDecrypt)}
            >
              {autoDecrypt ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Auto-decrypt ON
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Auto-decrypt OFF
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <ChatMessageList className="flex-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
                {!roomKey && (
                  <p className="text-sm mt-2">
                    Set your room key to send encrypted messages.
                  </p>
                )}
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.$id;
                  const decryptedData = decryptedMessages.get(message.id);
                  const isDecrypted = decryptedData && !decryptedData.error;
                  const decryptError = decryptedData?.error || false;

                  return (
                    <ChatBubble
                      key={message.id}
                      variant={isOwnMessage ? "sent" : "received"}
                    >
                      {!isOwnMessage && (
                        <ChatBubbleAvatar
                          fallback={getUserInitials(
                            message.senderId,
                            message.senderName
                          )}
                        />
                      )}

                      <div className="flex flex-col gap-1">
                        {!isOwnMessage && (
                          <div className="text-xs text-muted-foreground px-1">
                            {message.senderName}
                          </div>
                        )}

                        <ChatBubbleMessage
                          variant={isOwnMessage ? "sent" : "received"}
                          encrypted={true}
                          encryptedContent={message.message}
                          isDecrypted={isDecrypted || autoDecrypt}
                          decryptError={decryptError}
                          autoDecrypt={autoDecrypt}
                          onDecrypt={() =>
                            handleDecryptMessage(message.id, message.message)
                          }
                        >
                          {isDecrypted
                            ? decryptedData.content
                            : "Encrypted message"}
                        </ChatBubbleMessage>

                        <ChatBubbleTimestamp
                          timestamp={formatTime(message.timestamp)}
                        />
                      </div>
                    </ChatBubble>
                  );
                })}

                {/* Typing Indicator */}
                {typingUsers.length > 0 && (
                  <TypingIndicator users={typingUsers} />
                )}
              </>
            )}
          </ChatMessageList>

          {/* Message Input */}
          <ChatInput
            onSend={handleSendMessage}
            onTyping={handleTyping}
            disabled={!roomKey || !isConnected}
            placeholder={
              !roomKey
                ? "Set room key to send messages"
                : !isConnected
                ? "Connecting..."
                : "Type your message..."
            }
          />
        </CardContent>
      </Card>

      {/* Room Key Modal */}
      <RoomKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSetKey={handleSetRoomKey}
        room={room}
      />
    </div>
  );
}
