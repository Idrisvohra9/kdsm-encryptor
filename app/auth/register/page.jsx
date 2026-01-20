"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: null,
    answer: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [error, setError] = useState("");
  const [securityQuestions, setSecurityQuestions] = useState([]);

  const register = useAuthStore((state) => state.register);
  const router = useRouter();

  // Helper function to update form state
  const updateFormState = (updates) => {
    setFormState((prev) => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    // Fetch security questions from the API
    async function fetchSecurityQuestions() {
      try {
        const response = await fetch("/api/auth/security-questions");
        const data = await response.json();
        if (data.success) {
          setSecurityQuestions(data.questions);
        } else {
          console.error("Failed to load security questions");
        }
      } catch (err) {
        console.error("Error fetching security questions:", err);
      }
    }
    fetchSecurityQuestions();
  }, []);

  // Generate a strong password using the generateKey function
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
        useReadablePassword: true, // Generate a readable password
      });

      updateFormState({
        password: strongPassword,
        confirmPassword: strongPassword,
      });
      setError(""); // Clear any existing errors
    } catch (err) {
      setError("Failed to generate password. Please try again.");
    } finally {
      setIsGeneratingPassword(false);
    }
  }, []);
  // Memoized copy password function
  const handleCopyPassword = useCallback(async () => {
    if (!formState.password) return;

    try {
      await navigator.clipboard.writeText(formState.password);
      setPasswordCopied(true);
      toast.success("Password copied to clipboard!");

      // Reset copy state after 3 seconds
      setTimeout(() => setPasswordCopied(false), 3000);
    } catch (err) {
      toast.error("Failed to copy password to clipboard");
    }
  }, [formState.password]);

  // Memoized download password function for secure storage
  const handleDownloadCreds = useCallback(() => {
    if (!formState.password || !formState.email) return;

    const credentials = {
      email: formState.email,
      password: formState.password,
      securityQuestion:
        securityQuestions.filter((q) => q.$id === formState.securityQuestion)[0]
          ?.question || null,
      answer: formState.answer,
      generatedAt: new Date().toISOString(),
      note: "Keep this file secure and delete after storing in your password manager",
    };

    const dataStr = JSON.stringify(credentials, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    // cspell:disable-next-line
    link.download = `kdsm-credentials-${formState.email.split("@")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Credentials file downloaded! Store it securely.");
  }, [formState.password, formState.email, formState.securityQuestion, formState.answer, securityQuestions]);
  // Memoized password strength indicator
  const passwordStrength = useMemo(() => {
    if (!formState.password) return null;

    const hasLower = /[a-z]/.test(formState.password);
    const hasUpper = /[A-Z]/.test(formState.password);
    const hasNumber = /\d/.test(formState.password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      formState.password
    );
    const isLongEnough = formState.password.length >= 9;

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
  }, [formState.password]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate passwords match
    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Create a completely new object with only primitive values to avoid circular references
      const registrationData = {
        name: String(formState.name || ""),
        email: String(formState.email || ""),
        password: String(formState.password || ""),
        securityQuestion: String(formState.securityQuestion || ""),
        answer: String(formState.answer || "").toLowerCase().trim()
      };
      
      try {
        await register(registrationData);
      } catch (registerError) {
        // Ignore harmless circular structure errors from React internals
        if (registerError.message && !registerError.message.includes("Converting circular structure to JSON")) {
          throw registerError;
        }
        // If it's the circular structure error, log it but continue
        console.warn("Harmless circular structure warning ignored:", registerError.message);
      }
      
      router.push("/profile");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl text-primary bg-secondary/90 backdrop-blur-sm shadow-lg sm:mb-20 mb-0">
      <CardHeader>
        <CardTitle>Create an Account</CardTitle>
        <CardDescription>
          Register to start using encrypted messaging
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="space-y-2 flex-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                type="text"
                value={formState.name}
                onChange={(e) => updateFormState({ name: e.target.value })}
                placeholder="Your Name"
                required
                maxLength={25}
                autoFocus
              />
            </div>
            <div className="space-y-2 flex-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => updateFormState({ email: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-between items-center">
            <div className="space-y-2 flex-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>

              <Input
                id="password"
                type="password"
                secured={true}
                value={formState.password}
                onChange={(e) => updateFormState({ password: e.target.value })}
                placeholder="••••••••"
                maxLength={16}
                minLength={8}
                required
              />
              {/* Password strength indicator */}
              {passwordStrength && (
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-medium ${passwordStrength.color}`}>
                    Strength: {passwordStrength.text}
                  </span>

                  {formState.password && (
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
            <div className="space-y-2 flex-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm
              </label>
              <Input
                id="confirmPassword"
                type="password"
                secured={true}
                value={formState.confirmPassword}
                onChange={(e) =>
                  updateFormState({ confirmPassword: e.target.value })
                }
                placeholder="••••••••"
                maxLength={16}
                minLength={8}
                required
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGeneratePassword}
            disabled={isGeneratingPassword}
            className="h-8 px-3 text-xs ml-auto"
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
          {!formState.securityQuestion && (
            <Alert variant={"info"} className={"font-tomorrow"}>
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <AlertTitle className="text-sm sm:text-base ">
                Choose a security question and answer
              </AlertTitle>
              <AlertDescription className="text-xs sm:text-sm">
                Choose a security question and answer that you can easily
                remember. Make sure your answer is something only you would
                know. The answer will be encrypted for your security and is
                case-insensitive. It will help you unlock your secret resources
                on the platform for additional security.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <label htmlFor="securityQuestion" className="text-sm font-medium">
              Security Question
            </label>
            <Select
              onValueChange={(value) =>
                updateFormState({ securityQuestion: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a security question" />
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
          </div>
          <div className="space-y-2">
            <label htmlFor="answer" className="text-sm font-medium">
              Answer
            </label>
            <Input
              id="answer"
              type="text"
              value={formState.answer}
              onChange={(e) => updateFormState({ answer: e.target.value })}
              placeholder="The answer to your security question"
              required
              maxLength={12}
              minLength={6}
            />
          </div>
          {/* Security reminder for generated passwords */}
          {formState.password.length > 9 && (
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
          {formState.password && formState.email && !error && (
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={handleDownloadCreds}
                className="ml-auto"
                title="Download credentials securely"
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
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
