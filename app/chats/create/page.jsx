"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Lock, Users } from "lucide-react";
import { createChatRoom } from "@/lib/chatRooms";
import Balataro from "@/components/ui/Balataro";

export default function CreateChatRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    roomPin: "",
    retention: "3days",
    autoDecrypt: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const room = await createChatRoom({
        name: formData.name,
        roomPin: formData.roomPin,
        retention: formData.retention,
        autoDecrypt: formData.autoDecrypt,
      });

      toast.success("Chat room created successfully!");
      router.push(`/chats/${room.$id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("Failed to create chat room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="absolute inset-0 overflow-hidden">
        <Balataro />
      </div>
      <Card className="relative dark:border-white/10 backdrop-blur-md text-secondary dark:text-primary bg-primary/10 z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Chat Room
          </CardTitle>
          <CardDescription>
            Set up a secure encrypted chat room with custom settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Room Name */}
            <div className="space-y-2">
              <Label htmlFor="roomName">Room Name</Label>
              <Input
                id="roomName"
                placeholder="Enter room name..."
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                minLength={3}
                maxLength={20}
                required
              />
            </div>

            {/* PIN Protection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomPin" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Room PIN
                </Label>
                <Input
                  id="roomPin"
                  type="password"
                  placeholder="Enter 4-8 digit PIN..."
                  value={formData.roomPin}
                  onChange={(e) =>
                    setFormData({ ...formData, roomPin: e.target.value })
                  }
                  minLength={4}
                  maxLength={8}
                  required={formData.requiresPin}
                />
                <p className="text-sm text-muted-foreground">
                  A secret word or keyword to protect your chat room. Only
                  members with the PIN can access the chat room and read the
                  message.
                </p>
              </div>
            </div>

            {/* Retention Policy */}
            <div className="space-y-2">
              <Label>Message Retention</Label>
              <Select
                value={formData.retention}
                onValueChange={(value) =>
                  setFormData({ ...formData, retention: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3days">3 Days</SelectItem>
                  <SelectItem value="7days">7 Days (Pro)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                7 Days is available in the Pro plan.
              </p>
            </div>

            {/* Auto Decrypt */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-decrypt">Auto Decrypt Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Enable automatic message decryption upon successful PIN
                  verification when entering the chat room. By default, each
                  message requires individual PIN verification for maximum
                  security.
                </p>
              </div>
              <Switch
                id="auto-decrypt"
                checked={formData.autoDecrypt}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, autoDecrypt: checked })
                }
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Room...
                </>
              ) : (
                "Create Chat Room"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
