"use client";

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children, room, user }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomMembers, setRoomMembers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [autoDecrypt, setAutoDecrypt] = useState(room.autoDecrypt);
  const roomId = room?.$id;
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user || !roomId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      
      // Join the room
      newSocket.emit('join-room', {
        roomId,
        userId: user.$id,
        username: user.name || user.email
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
    });

    // Room event handlers
    newSocket.on('room-members', (members) => {
      setRoomMembers(members);
    });

    newSocket.on('user-joined', (data) => {
      toast.success(`${data.username} joined the room`);
      setRoomMembers(prev => [...new Set([...prev, data.userId])]);
    });

    newSocket.on('user-left', (data) => {
      toast.info(`${data.username} left the room`);
      setRoomMembers(prev => prev.filter(id => id !== data.userId));
    });

    // Message event handlers
    newSocket.on('receive-message', (messageData) => {
      setMessages(prev => [...prev, messageData]);
    });

    // Typing event handlers
    newSocket.on('user-typing', (data) => {
      if (data.userId === user.$id) return; // Don't show own typing
      
      setTypingUsers(prev => {
        if (data.isTyping) {
          return [...prev.filter(u => u.userId !== data.userId), data];
        } else {
          return prev.filter(u => u.userId !== data.userId);
        }
      });
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user, roomId]);

  // Send message function
  const sendMessage = (encryptedMessage, signature) => {
    if (!socket || !user) return;

    const messageData = {
      roomId,
      message: encryptedMessage,
      senderId: user.$id,
      senderName: user.name || user.email,
      timestamp: new Date().toISOString(),
      signature
    };

    // Add to local messages immediately
    const localMessage = {
      ...messageData,
      id: `local_${Date.now()}`,
      isLocal: true
    };
    setMessages(prev => [...prev, localMessage]);

    // Send to server
    socket.emit('send-message', messageData);
  };

  // Typing indicators
  const startTyping = () => {
    if (!socket || !user) return;
    
    socket.emit('typing-start', {
      roomId,
      userId: user.$id,
      username: user.name || user.email
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = () => {
    if (!socket || !user) return;
    
    socket.emit('typing-stop', {
      roomId,
      userId: user.$id,
      username: user.name || user.email
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Set room encryption key
  // const setEncryptionKey = (key) => {
  //   setRoomKey(key);
  // };

  const value = {
    socket,
    messages,
    roomMembers,
    typingUsers,
    isConnected,
    autoDecrypt,
    sendMessage,
    startTyping,
    stopTyping,
    setAutoDecrypt,
    setMessages
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};