"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore"; // Import the store
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function VerifyMFAPage() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [challengeId, setChallengeId] = useState(null);
  const router = useRouter();
  
  // Get the session validation action from your store
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    const startMfaFlow = async () => {
      const secret = sessionStorage.getItem("mfaTempSecret");
      if (!secret) {
        router.push("/auth/login");
        return;
      }

      // Create challenge automatically on load
      try {
        const res = await fetch("/api/auth/mfa/challenge", {
          method: "POST",
          body: JSON.stringify({ secret }),
        });
        const data = await res.json();
        if (data.success) {
          setChallengeId(data.challengeId);
        } else {
          toast.error("Failed to start MFA challenge.");
        }
      } catch (e) {
        toast.error("Network error.");
      }
    };
    startMfaFlow();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const secret = sessionStorage.getItem("mfaTempSecret");

    try {
      const res = await fetch("/api/auth/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret, challengeId, otp }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Identity verified! Redirecting...");
        
        sessionStorage.removeItem("mfaTempSecret");
        
        // 2. Use window.location.href to force a full navigation
        // This guarantees the browser attaches the new cookie to the header
        window.location.href = "/profile"; 
      } else {
        toast.error(data.error || "Invalid code.");
      }
    } catch (e) {
      toast.error("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] relative z-20">
      <Card className="w-full max-w-md text-primary bg-secondary/70">
        <CardHeader>
          <CardTitle>Security Check</CardTitle>
          <CardDescription>Enter the code from your authenticator app.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-center text-2xl tracking-[0.5em]"
              maxLength={6}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading || !challengeId}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Verify identity"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}