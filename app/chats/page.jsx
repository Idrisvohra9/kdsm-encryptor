"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserRooms, generateInviteLink } from "@/lib/chatRooms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  MessageCircle,
  Users,
  Clock,
  Lock,
  Share2,
  Copy,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

export default function ChatsPage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserRooms();
    }
  }, [user]);

  const fetchUserRooms = async () => {
    try {
      const userRooms = await getUserRooms();
      setRooms(userRooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load chat rooms");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (roomId, e) => {
    e.preventDefault();
    e.stopPropagation();
    const inviteUrl = generateInviteLink(roomId);
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGradientClass = (index) => {
    const gradients = [
      "from-purple-500/20 via-pink-500/20 to-red-500/20",
      "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
      "from-green-500/20 via-emerald-500/20 to-lime-500/20",
      "from-orange-500/20 via-amber-500/20 to-yellow-500/20",
      "from-indigo-500/20 via-purple-500/20 to-pink-500/20",
      "from-rose-500/20 via-pink-500/20 to-fuchsia-500/20",
    ];
    return gradients[index % gradients.length];
  };

  const getIconGradient = (index) => {
    const iconGradients = [
      "from-purple-400 to-pink-400",
      "from-blue-400 to-cyan-400",
      "from-green-400 to-emerald-400",
      "from-orange-400 to-amber-400",
      "from-indigo-400 to-purple-400",
      "from-rose-400 to-pink-400",
    ];
    return iconGradients[index % iconGradients.length];
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-primary flex items-center justify-center">
        <div className=" text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">Please log in to view your chats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navigation Bar */}
      <div className="relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                      <MessageCircle className="h-5 w-5 " />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2 w-2 " />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary-foreground bg-clip-text text-transparent">
                      KDSM Chats
                    </h1>
                    <p className="text-sm text-gray-400">
                      Secure • Encrypted • Private
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>{rooms.length} Rooms</span>
                </div>
                <Link href="/chats/create">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600  border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6 h-48">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2 mb-6"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/10 rounded w-full"></div>
                      <div className="h-3 bg-white/10 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-12 text-center max-w-md mx-auto shadow-2xl shadow-purple-500/10">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                  <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold  mb-3">
                  No chat rooms yet
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Create your first encrypted chat room to start secure
                  conversations with end-to-end KDSM encryption
                </p>
                <Link href="/chats/create">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600  border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Room
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  Your Chat Rooms
                </h2>
                <p className="text-gray-400">
                  Manage your secure encrypted conversations
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room, index) => (
                  <Link key={room.$id} href={`/chat/${room.$id}`}>
                    <Card
                      className={`group relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${getGradientClass(
                        index
                      )} border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer`}
                    >
                      {/* Glow Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Content */}
                      <CardContent className="relative p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 bg-gradient-to-r ${getIconGradient(
                                index
                              )} rounded-xl flex items-center justify-center shadow-lg`}
                            >
                              <MessageCircle className="h-6 w-6 " />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold  text-lg truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-200 group-hover:bg-clip-text transition-all duration-300">
                                {room.name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                Created {formatDate(room.createdAt)}
                              </p>
                            </div>
                          </div>

                          {room.roomKeyHash && (
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 backdrop-blur-sm">
                              <Lock className="h-3 w-3 mr-1" />
                              PIN
                            </Badge>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2 text-gray-300">
                              <Users className="h-4 w-4" />
                              <span>
                                {room.members.length} member
                                {room.members.length !== 1 ? "s" : ""}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-300">
                              <Clock className="h-4 w-4" />
                              <span>{room.retention}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {room.autoDecrypt ? (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 backdrop-blur-sm text-xs">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Auto-decrypt
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-sm text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Manual
                                </Badge>
                              )}
                            </div>

                            {room.creatorId === user.$id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400 hover: hover:bg-white/10"
                                onClick={(e) => copyInviteLink(room.$id, e)}
                              >
                                <Share2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Bottom Gradient Line */}
                        <div
                          className={`h-1 bg-gradient-to-r ${getIconGradient(
                            index
                          )} rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                        ></div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
