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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SecurityQuestionModal({
  isOpen,
  onClose,
  originalAnswer,
  securityQuestions = [],
  onCorrect,
}) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] =
    useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSecurityQuestion) {
      setError("Please select a security question");
      return;
    }
    if (!answer.trim()) {
      setError("Please enter an answer");
      return;
    }

    // Perform a check to see if the answer is correct
    if (originalAnswer === answer.trim()) {
      onCorrect();
      // Clear form state
      setAnswer("");
      setSelectedSecurityQuestion(null);
      setError("");

      onClose();
    } else {
      setError("Incorrect answer. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} >
      <DialogContent className="sm:max-w-lg max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Enter Answer
          </DialogTitle>
          <DialogDescription>
            To unlock the passwords, you need to provide the correct answer to
            your previously set security question.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Label htmlFor="security-question">Your Security Question</Label>
          <Select
            id="security-question"
            onValueChange={(value) => setSelectedSecurityQuestion(value)}
          >
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Select your security question" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Security Questions</SelectLabel>
                {securityQuestions.map((q) => (
                  <SelectItem key={q.$id} value={q.$id}>
                    {q.question}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <Label htmlFor="userAnswer">Answer</Label>
            <Input
              id="userAnswer"
              type="text"
              placeholder="Enter your answer..."
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
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

          <div className="flex justify-end gap-2">
            <Button type="submit" disabled={!answer.trim()}>
              Decrypt Passwords
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
