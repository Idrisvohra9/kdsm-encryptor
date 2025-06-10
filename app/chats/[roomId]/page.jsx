"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { databases } from "@/lib/appwrite";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Share2, Copy } from "lucide-react";

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinRequired, setPinRequired] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [verifyingPin, setVerifyingPin] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const isInviteLink = searchParams.get("invite") === "true";

  useEffect(() => {
    if (!user || !roomId) return;
    fetchRoom();
  }, [user, roomId]);

  const fetchRoom = async () => {
    try {
      const roomDoc = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        "chatRooms",
        roomId
      );

      const roomData = roomDoc;
      setRoom(roomData);

      // Check if user is already a member
      if (roomData.members.includes(user.$id)) {
        setHasAccess(true);
      } else if (roomData.roomKeyHash) {
        // Room requires PIN
        setPinRequired(true);
      } else {
        // No PIN required, add user to room
        await joinRoom();
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      toast.error("Room not found or access denied");
      router.push("/chats/create");
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = async () => {
    if (!room || !enteredPin) return;

    setVerifyingPin(true);
    try {
      // Simple hash verification - in production use crypto.subtle.digest
      const hashedPin = btoa(enteredPin);
      
      if (hashedPin === room.roomKeyHash) {
        await joinRoom();
        toast.success("PIN verified! Joining room...");
      } else {
        toast.error("Invalid PIN. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying PIN:", error);
      toast.error("Failed to verify PIN");
    } finally {
      setVerifyingPin(false);
    }
  };

  const joinRoom = async () => {
    if (!room || !user) return;

    try {
      // Add user to room members
      const updatedMembers = [...room.members, user.$id];
      
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        "chatRooms",
        room.$id,
        { members: updatedMembers }
      );

      setHasAccess(true);
      setPinRequired(false);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/chat/${roomId}?invite=true`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Room Not Found</CardTitle>
            <CardDescription>
              The chat room you're looking for doesn't exist or you don't have access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/chats/create")} className="w-full">
              Create New Room
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pinRequired) {
    return (
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Room Access Required
            </CardTitle>
            <CardDescription>
              {isInviteLink 
                ? `You've been invited to join "${room.name}". Enter the PIN to continue.`
                : `Enter the PIN to access "${room.name}"`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter room PIN..."
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyPin()}
              />
            </div>
            <Button 
              onClick={verifyPin} 
              className="w-full" 
              disabled={!enteredPin || verifyingPin}
            >
              {verifyingPin ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Join Room"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{room.name}</h1>
            <p className="text-muted-foreground">
              {room.members.length} member{room.members.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          {room.creatorId === user.$id && (
            <Button variant="outline" onClick={copyInviteLink}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Invite
            </Button>
          )}
        </div>

        {/* Chat Interface Placeholder */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>🚀 Chat interface coming in Phase 4!</p>
              <p className="text-sm mt-2">
                Socket.IO integration and real-time messaging will be implemented next.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}