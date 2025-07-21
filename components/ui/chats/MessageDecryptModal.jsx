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

export default function MessageDecryptModal({
  isOpen,
  onClose,
  roomKey,
  onCorrectKey,
  type = "single",
  setHasEnteredCorrectKey,
}) {
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

    // Perform a check to see if the key is correct
    if (roomKey === key.trim()) {
      // Set the flag that correct key has been entered
      if (setHasEnteredCorrectKey) {
        setHasEnteredCorrectKey(true);
      }

      onCorrectKey();

      // Clear form state
      setKey("");
      setError("");

      // Close the modal for both single and all types
      onClose();
    } else {
      setError("Incorrect key. Please try again.");
    }
  };

  const handleClose = () => {
    setKey("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={type === "single"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Enter Key
          </DialogTitle>
          <DialogDescription>
            To unlock {type === "single" ? "this message" : "these messages"},
            you need to provide the correct key.
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
              secured={true}
              className="w-full"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-2">
            {type === "single" && (
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={!key.trim()}>
              Decrypt Message{type === "all" ? "s" : ""}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
