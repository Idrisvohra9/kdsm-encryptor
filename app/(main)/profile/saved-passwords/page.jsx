"use client";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

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
import PasswordsDatatable from "@/components/ui/PasswordsDatatable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import SecurityQuestionModal from "@/components/ui/SecurityQuestionModal";
import { decrypt } from "@/utils/kdsm";

export default function page() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const [showSecurityDialog, setShowSecurityDialog] = useState(true);
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [originalAnswer, setOriginalAnswer] = useState("");
  // const [visiblePasswords, setVisiblePasswords] = useState(new Set());
  const [loadingPasswords, setLoadingPasswords] = useState(false);
  const [passwords, setPasswords] = useState([]);
  const fetchPasswords = async () => {
    setLoadingPasswords(true);
    try {
      const response = await fetch("/api/saved-passwords");
      const data = await response.json();

      if (data.success) {
        // console.log(data.data);
        setPasswords(data.data.documents);
      } else {
        toast.error("Failed to fetch PASSWORDS ");
      }
    } catch (error) {
      console.error("Error fetching PASSWORDS :", error);
      toast.error("Failed to fetch PASSWORDS ");
    } finally {
      setLoadingPasswords(false);
    }
  };
  const decryptPasswords = () => {
    setPasswords((prevPasswords) =>
      prevPasswords.map((password) => {
        password.password = decrypt(password.passwordHash, user?.hashedAnswer);
        return password;
      })
    );
  }
  const fetchSecurityQuestions = async () => {
    try {
      const response = await fetch("/api/auth/security-questions");
      const data = await response.json();
      if (data.success) {
        setSecurityQuestions(data.questions);
      }
    } catch (error) {
      console.error("Error fetching security questions:", error);
    }
  };
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      // console.log(user);
      fetchPasswords();
      fetchSecurityQuestions();
      setOriginalAnswer(decrypt(user.hashedAnswer, user.securityQuestion.$id));
    }
  }, [user, loading, router]);
  return (
    <Card className="max-w-4xl w-full text-primary bg-secondary/90 backdrop-blur-md min-h-screen">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size={"lg"} onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <div className="w-[90%] overflow-hidden truncate ">
            <CardTitle className="flex items-center gap-2 flex-wrap font-tomorrow text-2xl">
              {user?.name || "User"}'s Saved Passwords
            </CardTitle>
            <CardDescription className="font-tomorrow text-sm text-muted-foreground">
              View and manage all your saved passwords securely in one place.
            </CardDescription>
          </div>
          <Image
            src="/icons/saved-pass.webp"
            width={86}
            height={86}
            className="ml-auto object-cover"
            alt="KDSM Logo"
          />
        </div>
        <Separator />
      </CardHeader>

      <CardContent>
        {loadingPasswords ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            Loading passwords...
          </div>
        ) : null}
        {!loadingPasswords && passwords.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No saved passwords found. Start adding some!
          </div>
        ) : null}
        {!showSecurityDialog && <PasswordsDatatable passwords={passwords} />}
        <SecurityQuestionModal
          isOpen={showSecurityDialog}
          onClose={() => setShowSecurityDialog(false)}
          securityQuestions={securityQuestions}
          originalAnswer={originalAnswer}
          onCorrect={decryptPasswords}
        />
      </CardContent>
    </Card>
  );
}
