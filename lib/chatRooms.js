// Client-side API functions for chat rooms

import { decrypt } from "@/utils/kdsm";

export const createChatRoom = async ({
  name,
  roomPin = "",
  retention = "3days",
  autoDecrypt = false,
}) => {
  const response = await fetch("/api/chat/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      roomPin,
      retention,
      autoDecrypt,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to create room");
  }

  return data.room;
};

export async function getChatRoom(roomId) {
  const response = await fetch(`/api/chat/rooms/${roomId}`, {
    method: "GET",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch room");
  }

  return data.room;
}

export async function joinChatRoom(roomId, pin = null) {
  const response = await fetch(`/api/chat/rooms/${roomId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "join",
      pin,
    }),
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to join room");
  }

  return data.room;
}

export async function getUserRooms() {
  const response = await fetch("/api/chat/rooms", {
    method: "GET",
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch rooms");
  }

  return data.rooms;
}

export function generateInviteLink(roomId, baseUrl = "") {
  const domain =
    baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${domain}/chat/${roomId}?invite=true`;
}

export function hashRoomPin(pin, secret) {
  // Simple base64 encoding for demo - use crypto.subtle.digest in production
  return decrypt(pin, secret);
}

export function verifyRoomPin(pin, secret, hashedPin) {
  return hashRoomPin(pin, secret) === hashedPin;
}
