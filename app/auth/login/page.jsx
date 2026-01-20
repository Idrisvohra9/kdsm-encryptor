"use client";

import { useState } from "react";
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
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await login(email, password);

      if (data.mfaRequired) {
        // Store tempSecret for the verification page
        sessionStorage.setItem("mfaTempSecret", data.tempSecret);
        toast.info("MFA verification required");
        router.push("/auth/verify-mfa");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      toast.error("Oopsie!", {
        description:
          err.message || "Login failed. Please check your credentials.",
      });
      setFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md text-primary bg-secondary/90 backdrop-blur-md shadow-lg">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              type="password"
              secured={true}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={16}
              minLength={8}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center flex-col items-center space-y-2 text-center">
        {failed && (
          <p className="text-sm">
            Forgot password?{" "}
            <Link href="/auth/reset-password" className="underline">
              Reset it
            </Link>
          </p>
        )}
        <p className="text-sm">
          Don't have an account?{" "}
          <Link href="/auth/register" className="underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
