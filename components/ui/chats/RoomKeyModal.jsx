"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Key, AlertTriangle } from "lucide-react";

export default function RoomKeyModal({ isOpen, onClose, onSetKey, room }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!key.trim()) {
      setError("Please enter a room key");
      return;
    }

    if (key.length < 8) {
      setError("Room key must be at least 8 characters long");
      return;
    }

    onSetKey(key.trim());
    setKey("");
    setError("");
  };

  const handleClose = () => {
    setKey("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Room Encryption Key
          </DialogTitle>
          <DialogDescription>
            Enter the encryption key for "{room?.name}". This key will be used
            to encrypt and decrypt all messages in this room.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomKey">Encryption Key</Label>
            <Input
              id="roomKey"
              type="password"
              placeholder="Enter your room key..."
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError("");
              }}
              className="w-full"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Keep your room key safe! You'll need it to decrypt messages. If
              you lose it, you won't be able to read encrypted messages.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!key.trim()}>
              Set Key
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
