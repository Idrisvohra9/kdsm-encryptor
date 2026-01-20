"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SetupMFAPage() {
  const [qrCodeUri, setQrCodeUri] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Step 1: Create TOTP authenticator via API
  const createAuthenticator = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/user/mfa/create", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setSecret(data.data.secret);
        setQrCodeUri(data.data.uri);
        toast.success("QR Code generated! Scan with your authenticator app.");
      } else {
        toast.error(data.error || "Failed to generate QR code");
      }
    } catch (error) {
      console.error("Error creating authenticator:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 2: Verify the TOTP code via API
  const verifyAuthenticator = async () => {
    if (!verificationCode.trim()) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (verificationCode.length !== 6) {
      toast.error("Code must be 6 digits");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch("/api/user/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("MFA enabled! Next time you log in, you will be prompted for a code.");
        router.push("/profile");
      } else {
        toast.error(data.error || "Invalid code.");
      }
    } catch (error) {
      toast.error("Verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
          <CardDescription>
            Secure your account with TOTP-based MFA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!qrCodeUri ? (
            <Button 
              onClick={createAuthenticator} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate QR Code"
              )}
            </Button>
          ) : (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG value={qrCodeUri} size={200} />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Scan this QR code with your authenticator app
                  <br />
                  (Google Authenticator, Authy, etc.)
                </p>
                <div className="w-full p-3 bg-muted rounded text-xs font-mono break-all text-center">
                  {secret}
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Or enter this secret key manually in your app
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  autoFocus
                  disabled={isVerifying}
                />
                <Button
                  onClick={verifyAuthenticator}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Enable MFA"
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}