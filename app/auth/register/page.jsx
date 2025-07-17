"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { generateKey } from "@/utils/kdsm";
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Key,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  // State to handle error messages
  const [error, setError] = useState("");

  const { register } = useAuth();
  const router = useRouter();

  // Generate a strong password using the KDSM generateKey function
  const handleGeneratePassword = useCallback(async () => {
    setIsGeneratingPassword(true);
    try {
      // Generate a 9-character strong password with all character types
      const strongPassword = await generateKey(9, {
        includeNumbers: true,
        includeSpecialChars: true,
        includeUppercase: true,
        includeLowercase: true,
        excludeSimilar: true, // Exclude similar looking characters for better usability
      });

      setPassword(strongPassword);
      setConfirmPassword(strongPassword);
      setError(""); // Clear any existing errors
    } catch (err) {
      setError("Failed to generate password. Please try again.");
    } finally {
      setIsGeneratingPassword(false);
    }
  }, []);
  // Memoized copy password function
  const handleCopyPassword = useCallback(async () => {
    if (!password) return;

    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
      toast.success("Password copied to clipboard!");

      // Reset copy state after 3 seconds
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (err) {
      toast.error("Failed to copy password to clipboard");
    }
  }, [password]);

  // Memoized download password function for secure storage
  const handleDownloadPassword = useCallback(() => {
    if (!password || !email) return;

    const passwordData = {
      email: email,
      password: password,
      generatedAt: new Date().toISOString(),
      note: "Keep this file secure and delete after storing in your password manager",
    };

    const dataStr = JSON.stringify(passwordData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `kdsm-password-${email.split("@")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Password file downloaded! Store it securely.");
  }, [password, email]);
  // Memoized password strength indicator
  const passwordStrength = useMemo(() => {
    if (!password) return null;

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 9;

    const score = [
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      isLongEnough,
    ].filter(Boolean).length;

    if (score <= 2)
      return { level: "weak", color: "text-red-500", text: "Weak" };
    if (score <= 3)
      return { level: "medium", color: "text-yellow-500", text: "Medium" };
    if (score <= 4)
      return { level: "strong", color: "text-blue-500", text: "Strong" };
    return {
      level: "very-strong",
      color: "text-green-500",
      text: "Very Strong",
    };
  }, [password]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await register(email, password, name);
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md text-primary bg-secondary/40 backdrop-blur-md shadow-lg sm:mb-20 mb-0">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Register to start using encrypted messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              required
              maxLength={50}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGeneratePassword}
                disabled={isGeneratingPassword}
                className="h-8 px-3 text-xs"
                title="Generate a strong password"
              >
                {isGeneratingPassword ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Key className="h-3 w-3" />
                )}
                <span className="ml-1">
                  {isGeneratingPassword ? "Generating..." : "Generate Strong"}
                </span>
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              secured={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={20}
              required
            />
            {/* Password strength indicator */}
            {passwordStrength && (
              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${passwordStrength.color}`}>
                  Strength: {passwordStrength.text}
                </span>

                {password && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="h-6 w-6 p-0 hover:bg-transparent"
                    title="Copy password"
                  >
                    {passwordCopied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              secured={true}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={20}
              required
            />
          </div>
          {/* Security reminder for generated passwords */}
          {password.length > 9 && (
            <Alert className="border-amber-200 bg-amber-50/50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                <strong>Important:</strong> Save your generated password in a
                secure password manager or write it down safely. You'll need it
                to access your account.
              </AlertDescription>
            </Alert>
          )}
          {error && <div className="text-destructive text-sm">{error}</div>}
          {password && email && !error && (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={handleDownloadPassword}
                className="ml-auto"
                title="Download password securely"
              >
                <Download className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
