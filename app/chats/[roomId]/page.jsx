"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, Share2, LogIn, ArrowLeft } from "lucide-react";
import { getChatRoom, joinChatRoom } from "@/lib/chatRooms";
import ChatRoom from "@/components/ui/chats/ChatRoom";
import ThemeToggle from "@/components/ui/theme-toggle";

function ChatRoomPageContent() {
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
    if (isInviteLink && user === null) {
      setLoading(false);
      return;
    }

    if (user === undefined) {
      return;
    }

    if (user && roomId) {
      fetchRoom();
    }
  }, [user, roomId, isInviteLink]);

  const fetchRoom = async () => {
    try {
      const roomData = await getChatRoom(roomId);
      setRoom(roomData);
      // If already a member, set access
      if (roomData.members.includes(user.$id)) {
        setHasAccess(true);
      } else if (roomData.roomKeyHash) {
        // For new joiners:
        setPinRequired(true);
      } else {
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
      const updatedRoom = await joinChatRoom(roomId, enteredPin);
      setRoom(updatedRoom);
      setHasAccess(true);
      setPinRequired(false);
      toast.success("PIN verified! Joining room...");
    } catch (error) {
      console.error("Error verifying PIN:", error);
      toast.error("Invalid PIN. Please try again.");
    } finally {
      setVerifyingPin(false);
    }
  };

  const joinRoom = async () => {
    if (!room || !user) return;

    try {
      const updatedRoom = await joinChatRoom(roomId);
      setRoom(updatedRoom);
      setHasAccess(true);
      setPinRequired(false);
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/chats/${roomId}?invite=true`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  const handleLogin = () => {
    const returnUrl = encodeURIComponent(window.location.href);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  const goBack = () => {
    router.push("/chats");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading chat room...</p>
        </div>
      </div>
    );
  }

  if (isInviteLink && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Login Required</CardTitle>
            <CardDescription>
              You must be logged in to join this room. Please log in to
              continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleLogin} className="w-full" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Login to Join Room
            </Button>
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/")}
                className="text-sm text-muted-foreground"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Room Not Found</CardTitle>
            <CardDescription>
              The chat room you're looking for doesn't exist or you don't have
              access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push("/chats/create")}
              className="w-full"
              size="lg"
            >
              Create New Room
            </Button>
            <Button onClick={goBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (pinRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Room Access Required</CardTitle>
            <CardDescription>
              {isInviteLink
                ? `You've been invited to join "${room.name}". Enter the PIN to continue.`
                : `Enter the PIN to access "${room.name}"`}
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
                className="text-center"
              />
            </div>
            <Button
              onClick={verifyPin}
              className="w-full"
              size="lg"
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
            <Button onClick={goBack} variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chats
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <ChatProvider room={room} user={user}>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          {/* Header */}
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goBack}
                    className="shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  <div className="min-w-0">
                    <h1 className="text-xl font-bold truncate flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary"></div>
                      {room.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {room.members.length} member
                      {room.members.length !== 1 ? "s" : ""}
                      {isInviteLink && " • Joined via invite"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {room.creatorId === user.$id && (
                    <Button
                      variant="outline"
                      onClick={copyInviteLink}
                      className="shrink-0"
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Share Invite</span>
                    </Button>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <ChatRoom room={room} user={user} />
            </div>
          </div>
        </div>
      </ChatProvider>
    );
  }

  return null;
}

// Loading fallback component
function ChatRoomPageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function ChatRoomPage() {
  return (
    <Suspense fallback={<ChatRoomPageFallback />}>
      <ChatRoomPageContent />
    </Suspense>
  );
}
