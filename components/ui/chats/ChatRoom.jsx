"use client";

import { useState, useMemo, useCallback } from "react";
import { useChatContext } from "@/context/ChatContext";
import { useEncryption } from "@/hooks/useEncryption";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Key,
  Eye,
  EyeOff,
  Users,
  Settings,
  EllipsisVertical,
  MessageSquareX,
  LogOut,
  Search,
  Trash2,
  BrickWallFire,
} from "lucide-react";
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
import { Modal } from "./Modal";
import Balataro from "../Balataro";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { decrypt as decryptRoomKey } from "@/utils/kdsm";
import Image from "next/image";
import MessageDecryptModal from "./MessageDecryptModal";
import { updateChatRoom } from "@/lib/chatRooms";

export default function ChatRoom({ room, user }) {
  const {
    messages,
    roomMembers,
    typingUsers,
    isConnected,
    autoDecrypt,
    sendMessage,
    startTyping,
    stopTyping,
    setAutoDecrypt,
  } = useChatContext();

  // De-hashing the room key will give us the encryption key
  const [roomKey, setRoomKey] = useState(
    decryptRoomKey(room?.roomKeyHash, room?.creatorId)
  );
  // For encryption and decryption of messages
  const { encrypt, decrypt } = useEncryption(roomKey);
  // Initially if the room has auto-decrypt enabled, show the key modal
  const [showEnterKeyModal, setShowEnterKeyModal] = useState(room.autoDecrypt);
  // For creator to show the change key modal
  const [showChangeKeyModal, setShowChangeKeyModal] = useState(false);
  const [decryptedMessages, setDecryptedMessages] = useState(new Map());
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [hasEnteredCorrectKey, setHasEnteredCorrectKey] = useState(
    autoDecrypt === true ? false : true
  );
  const [selectedMessageToDecrypt, setSelectedMessageToDecrypt] =
    useState(null);
  const [autoEncryptEnabled, setAutoEncryptEnabled] = useState(false); // New state for auto-encryption

  // Handle message decryption
  const handleDecryptMessage = useCallback(
    async (messageId, encryptedContent) => {
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
    },
    [decrypt, roomKey]
  );

  // Handle sending messages
  const handleSendMessage = useCallback(
    async (messageText) => {
      if (!encrypt) {
        toast.error("Room key not set");
        return;
      }

      try {
        const encryptedMessage = encrypt(messageText);
        sendMessage(encryptedMessage);
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    },
    [encrypt, sendMessage]
  );

  // Handle typing indicators
  const handleTyping = useCallback(
    (isTyping) => {
      if (isTyping) {
        startTyping();
      } else {
        stopTyping();
      }
    },
    [startTyping, stopTyping]
  );

  // Set room key and close modal
  const handleSetRoomKey = useCallback(
    (key) => {
      setRoomKey(key);
      setShowChangeKeyModal(false);
      toast.success("Room key set successfully!");
    },
    []
  );

  // Get user initials for avatar
  const getUserInitials = useCallback(
    (senderId, senderName) => {
      if (senderId === user?.$id) return user.name?.[0] || user.email?.[0] || "Y";
      return senderName?.[0] || "U";
    },
    [user]
  );

  // Format timestamp
  const formatTime = useCallback(
    (timestamp) => {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    []
  );

  // Memoized placeholder text for chat input
  const chatInputPlaceholder = useMemo(() => {
    if (!roomKey) return "Set room key to send messages";
    if (!isConnected) return "Connecting...";
    return "Type your message...";
  }, [roomKey, isConnected]);

  return (
    <div className="space-y-4 w-full h-full">
      <div className="fixed inset-0 w-full h-full">
        <Balataro />
      </div>
      <div className="relative flex items-center justify-between mt-5">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {roomMembers.length} online
          </Badge>
        </div>

        <Modal
          isOpen={showRoomSettings}
          onClose={() => setShowRoomSettings(false)}
        >
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Room Settings</h2>
            <div className="space-x-2 space-y-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangeKeyModal(true)}
              >
                <Key className="h-4 w-4 mr-1" />
                Change Room Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await updateChatRoom(
                    room.$id,
                    { autoDecrypt: !autoDecrypt },
                    "update-data"
                  );
                  setAutoDecrypt(!autoDecrypt);
                }}
              >
                {autoDecrypt ? (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Disable Auto-decrypt
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Enable Auto-decrypt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoEncryptEnabled(!autoEncryptEnabled)}
              >
                {autoEncryptEnabled ? (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Disable Auto-encrypt
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Enable Auto-encrypt
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                // onClick={() => setAutoDecrypt(!autoDecrypt)}
              >
                <BrickWallFire className="h-4 w-4 mr-1" />
                Change Background
              </Button>
            </div>
          </div>
        </Modal>
        <div className="flex items-center gap-2">
          {room.creatorId === user.$id && (
            <Button
              variant="outline"
              onClick={() => setShowRoomSettings(!showRoomSettings)}
              className="p-2"
            >
              <Settings className="h-5 w-5" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <EllipsisVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <MessageSquareX className="mr-2 h-4 w-4" />
                  Clear Chat
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Exit Room
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Search className="mr-2 h-4 w-4" />
                  Find Messages
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Room
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Chat Messages */}
      <Card className="relative bg-secondary/60 backdrop-blur-md flex flex-col sm:mb-24 pb-0 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Messages</CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 h-full">
          <ChatMessageList className="flex-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Image
                  src="/assets/no-messages.png"
                  alt="No messages"
                  width={200}
                  height={200}
                  className="mx-auto mb-4"
                />
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
                          autoEncryptEnabled={autoEncryptEnabled}
                          onDecrypt={() => {
                            setShowEnterKeyModal(true);
                            setSelectedMessageToDecrypt(message);
                          }}
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
            disabled={!roomKey || !isConnected || !hasEnteredCorrectKey}
            placeholder={chatInputPlaceholder}
          />
        </CardContent>
      </Card>
      {/* Room Key Modal */}
      <RoomKeyModal
        isOpen={showChangeKeyModal}
        onClose={() => setShowChangeKeyModal(false)}
        onSetKey={handleSetRoomKey}
        room={room}
      />
      {/* Enter Key Modal */}
      <MessageDecryptModal
        isOpen={showEnterKeyModal}
        onClose={() => {
          // Close the modal and clear selected message
          setShowEnterKeyModal(false);
          setSelectedMessageToDecrypt(null);
        }}
        onCorrectKey={() => {
          if (selectedMessageToDecrypt) {
            // Handle single message decryption with timer
            handleDecryptMessage(
              selectedMessageToDecrypt.id,
              selectedMessageToDecrypt.message
            );
            // Only enable auto-encrypt if autoDecrypt is false and we're decrypting a specific message
            if (!autoDecrypt) {
              setAutoEncryptEnabled(true);
            }
          } else if (room.autoDecrypt) {
            // Auto-decrypt all messages when auto-decrypt is enabled - no timer needed
            messages.forEach((message) => {
              if (!decryptedMessages.has(message.id)) {
                handleDecryptMessage(message.id, message.message);
              }
            });
          }
        }}
        roomKey={roomKey}
        type={room.autoDecrypt ? "all" : "single"}
        setHasEnteredCorrectKey={setHasEnteredCorrectKey}
      />
    </div>
  );
}
