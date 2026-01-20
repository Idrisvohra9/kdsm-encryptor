"use client";
import Image from "next/image";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useAuthStore from "@/store/authStore";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function page() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const [rateLimitStatus, setRateLimitStatus] = useState(null);


  const [showSecurityDialog, setShowSecurityDialog] = useState(true);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [securityData, setSecurityData] = useState({
    questionId: "",
    answer: "",
  });
  const [visibleFiles, setVisibleFiles] = useState(new Set());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [files, setFiles] = useState([]);
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      console.log(user);
      // fetchApiKeys();
      // fetchRateLimitStatus();
    }
  }, [user, loading, router]);
  return (
    <Card className="max-w-4xl w-full text-primary bg-secondary/90 backdrop-blur-md min-h-screen">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <InitialsAvatar user={user} />
          <div className="w-[90%] overflow-hidden truncate ">
            <CardTitle className="flex items-center gap-2 flex-wrap font-tomorrow">
              {user?.name || "User"}'s Secure Files
            </CardTitle>
            <CardDescription className="font-tomorrow text-sm text-muted-foreground">
              {user?.email || "user@example.com"}
            </CardDescription>
          </div>
          <Image
            src="/icons/secure-files.webp"
            width={86}
            height={86}
            className="ml-auto object-cover"
            alt="Secure Files Logo"
          />
        </div>
        <Separator />
      </CardHeader>

      <CardContent>
      </CardContent>
    </Card>
  );
}
