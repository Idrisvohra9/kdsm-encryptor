"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Settings } from "lucide-react";

export default function MainNav() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/chat" className="flex items-center space-x-2">
              <MessageCircle className="h-6 w-6" />
              <span className="font-semibold">KDSM Chat</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link href="/chat">
              <Button variant="ghost" size="sm">
                <MessageCircle className="mr-2 h-4 w-4" />
                Rooms
              </Button>
            </Link>
            <Link href="/chats/create">
              <Button variant="ghost" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}