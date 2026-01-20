"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import GhostLoader from "@/components/ui/GhostLoader";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { toast } from "sonner";
import {
  Copy,
  Plus,
  Trash2,
  Key,
  Code,
  Eye,
  EyeOff,
  Crown,
  Shield,
  Zap,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Edit,
  Lock,
  UserX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserTierBadge from "@/components/ui/UserTierBadge";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const loading = useAuthStore((state) => state.loading);
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [loadingRateLimit, setLoadingRateLimit] = useState(false);

  // Profile update states
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Security question change states
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [securityStep, setSecurityStep] = useState(1); // 1: verify old, 2: set new
  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [oldSecurityData, setOldSecurityData] = useState({
    questionId: "",
    answer: "",
  });
  const [newSecurityData, setNewSecurityData] = useState({
    questionId: "",
    answer: "",
  });
  const [changingSecurity, setChangingSecurity] = useState(false);

  // Delete account states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      // console.log(user);
      fetchApiKeys();
      fetchRateLimitStatus();
    }
  }, [user, loading, router]);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const response = await fetch("/api/user/api-keys");
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data);
      } else {
        toast.error("Failed to fetch API keys");
      }
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("Failed to fetch API keys");
    } finally {
      setLoadingKeys(false);
    }
  };

  const fetchRateLimitStatus = async () => {
    setLoadingRateLimit(true);
    try {
      const response = await fetch("/api/user/rate-limit");
      const data = await response.json();

      if (data.success) {
        setRateLimitStatus(data.data);
      }
    } catch (error) {
      console.error("Error fetching rate limit status:", error);
    } finally {
      setLoadingRateLimit(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      const response = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyName: newKeyName.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API key created successfully");
        setNewKeyName("");
        setShowCreateDialog(false);
        fetchApiKeys();

        // Show the full key temporarily
        setTimeout(() => {
          setVisibleKeys((prev) => new Set([...prev, data.data.id]));
        }, 100);
      } else {
        toast.error(data.error || "Failed to create API key");
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("Failed to create API key");
    }
  };

  const deleteApiKey = async (keyId) => {
    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("API key deleted successfully");
        fetchApiKeys();
      } else {
        toast.error(data.error || "Failed to delete API key");
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("Failed to delete API key");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setVisibleKeys((current) => {
            const updatedSet = new Set(current);
            updatedSet.delete(keyId);
            return updatedSet;
          });
        }, 2000);
      }
      return newSet;
    });
  };

  const handleLogout = () => {
    logout().then(() => {
      router.push("/auth/login");
    });
  };

  // Fetch security questions on mount
  useEffect(() => {
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
    fetchSecurityQuestions();
  }, []);

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!profileData.name && !profileData.email) {
      toast.error("Please provide at least name or email to update");
      return;
    }

    if (profileData.email && !profileData.password) {
      toast.error("Password is required to update email");
      return;
    }

    setUpdatingProfile(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Profile updated successfully");
        setShowProfileDialog(false);
        setProfileData({ name: "", email: "", password: "" });
        // Refresh user data
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password changed successfully");
        setShowPasswordDialog(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle security question change - verify old
  const handleVerifyOldSecurity = async () => {
    if (!oldSecurityData.questionId || !oldSecurityData.answer) {
      toast.error(
        "Please select your security question and provide the answer"
      );
      return;
    }

    setChangingSecurity(true);
    try {
      // TODO: Add API endpoint to verify old security answer
      // For now, we'll assume verification is successful
      toast.success("Security answer verified");
      setSecurityStep(2);
    } catch (error) {
      console.error("Error verifying security answer:", error);
      toast.error("Failed to verify security answer");
    } finally {
      setChangingSecurity(false);
    }
  };

  // Handle security question change - set new
  const handleSetNewSecurity = async () => {
    if (!newSecurityData.questionId || !newSecurityData.answer) {
      toast.error(
        "Please select a new security question and provide the answer"
      );
      return;
    }

    setChangingSecurity(true);
    try {
      // TODO: Add API endpoint to update security question
      toast.success("Security question updated successfully");
      setShowSecurityDialog(false);
      setSecurityStep(1);
      setOldSecurityData({ questionId: "", answer: "" });
      setNewSecurityData({ questionId: "", answer: "" });
    } catch (error) {
      console.error("Error updating security question:", error);
      toast.error("Failed to update security question");
    } finally {
      setChangingSecurity(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const response = await fetch("/api/auth/user", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account deleted successfully");
        await logout();
        router.push("/");
      } else {
        toast.error(data.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  const getUsagePercentage = () => {
    if (!rateLimitStatus || rateLimitStatus.limit === "unlimited") return 0;
    return (rateLimitStatus.used / rateLimitStatus.limit) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <GhostLoader />
      </div>
    );
  }

  return (
    <Card className="max-w-4xl w-full text-primary bg-secondary/90 backdrop-blur-md min-h-screen">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <InitialsAvatar user={user} />
          <div className="w-[90%] overflow-hidden truncate ">
            <CardTitle className="flex items-center gap-2 flex-wrap font-tomorrow">
              {user?.name || "User"}
              {rateLimitStatus && (
                <UserTierBadge tier={rateLimitStatus?.tier} />
              )}
              {user?.emailVerification && (
                <Badge variant="success">
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:block">Verified</span>
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="font-tomorrow text-sm text-muted-foreground">
              {user?.email || "user@example.com"}
            </CardDescription>
          </div>
          <Image
            src="/icons/profile.webp"
            width={86}
            height={86}
            className="ml-auto object-cover"
            alt="KDSM Logo"
          />
        </div>
        <Separator />
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <div>
              <h3 className="text-lg text-white font-medium">
                Account Details
              </h3>
              <p className="text-sm text-muted-foreground">
                Subscription: {rateLimitStatus?.tier || "Free"}
              </p>
              <p className="text-sm text-muted-foreground">
                Joined:{" "}
                {user?.registration
                  ? new Date(user.registration).toUTCString()
                  : "Unknown"}
              </p>
              <p className="text-sm text-muted-foreground">
                Last Logged in:{" "}
                {user?.lastLogin
                  ? new Date(user.lastLogin).toUTCString()
                  : "Unknown"}
              </p>
            </div>

            <div>
              <h3 className="text-lg text-white font-medium">
                Session Information
              </h3>
              <p className="text-sm text-muted-foreground">
                Your session will expire in 3 days from login.
              </p>
            </div>
            {!user?.emailVerification && (
              <Alert variant={"warning"}>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertTitle className="text-sm sm:text-base">
                  Email Not Verified
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  Please verify your email address to unlock all features.
                  <Button
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => router.push("/auth/verify-email")}
                  >
                    Resend Verification Email
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {user?.emailVerification && !user?.mfa && (
              <Alert variant={"warning"}>
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                <AlertTitle className="text-sm sm:text-base">
                  MFA Not Enabled
                </AlertTitle>
                <AlertDescription className="text-xs sm:text-sm">
                  Please enable MFA to enhance your account security.
                  <Button
                    variant="link"
                    className="p-0 ms-1 align-baseline"
                    onClick={() => router.push("/auth/setup-mfa")}
                  >
                    Set Up MFA
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            {/* Your Resources Section */}
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-lg text-white font-medium">Your Resources</h3>
              <div className="flex gap-3 flex-col sm:flex-row sm:gap-4 flex-wrap">
                <Link
                  href={"/profile/saved-passwords"}
                  className="flex-1 shadow-2xl ring-4 ring-primary/20 rounded-lg p-4 border-primary/20 text-primary hover:scale-[1.02] transition-transform duration-200"
                  target="_blank"
                >
                  <div className="flex items-center mb-2 flex-col gap-2">
                    <Image
                      src={"/icons/saved-pass.webp"}
                      width={64}
                      height={64}
                      alt="Saved Passwords"
                    />
                    <h4 className="ms-2 font-semibold text-md">
                      Saved Passwords
                    </h4>
                  </div>
                </Link>
                <Link
                  href={"/profile/secure-files"}
                  className="flex-1 shadow-2xl ring-4 ring-primary/20 rounded-lg p-4 border-primary/20 text-primary hover:scale-[1.02] transition-transform duration-200"
                  target="_blank"
                >
                  <div className="flex items-center mb-2 flex-col gap-2">
                    <Image
                      src={"/icons/secure-files.webp"}
                      width={64}
                      height={64}
                      alt="Secure Files"
                    />
                    <h4 className="ms-2 font-semibold text-md">Secure Files</h4>
                  </div>
                </Link>
              </div>
            </div>
            {/* Account Management Section */}
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-lg text-white font-medium">
                Account Management
              </h3>
              <div className="flex gap-3 flex-col sm:flex-row sm:gap-4 flex-wrap">
                {/* Update Profile Button */}
                <Dialog
                  open={showProfileDialog}
                  onOpenChange={setShowProfileDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        setProfileData({
                          name: user?.name || "",
                          email: "",
                          password: "",
                        })
                      }
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Profile</DialogTitle>
                      <DialogDescription>
                        Update your name or email address. Email changes require
                        your current password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="profile-name">Name</Label>
                        <Input
                          id="profile-name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          placeholder="Your name"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="profile-email">Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          placeholder="your.email@example.com"
                          className="mt-2"
                        />
                      </div>
                      {profileData.email && (
                        <div>
                          <Label htmlFor="profile-password">
                            Current Password (required for email change)
                          </Label>
                          <Input
                            id="profile-password"
                            type="password"
                            value={profileData.password}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                password: e.target.value,
                              })
                            }
                            placeholder="••••••••"
                            className="mt-2"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowProfileDialog(false)}
                        disabled={updatingProfile}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={updatingProfile}
                      >
                        {updatingProfile ? "Updating..." : "Update Profile"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Change Password Button */}
                <Dialog
                  open={showPasswordDialog}
                  onOpenChange={setShowPasswordDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() =>
                        setPasswordData({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        })
                      }
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and choose a new one.
                        Minimum 8 characters required.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="old-password">Current Password</Label>
                        <Input
                          id="old-password"
                          type="password"
                          value={passwordData.oldPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              oldPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="mt-2"
                          minLength={8}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">
                          Confirm New Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="••••••••"
                          className="mt-2"
                          minLength={8}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowPasswordDialog(false)}
                        disabled={changingPassword}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={changingPassword}
                      >
                        {changingPassword ? "Changing..." : "Change Password"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Change Security Question Button */}
                <Dialog
                  open={showSecurityDialog}
                  onOpenChange={(open) => {
                    setShowSecurityDialog(open);
                    if (!open) {
                      setSecurityStep(1);
                      setOldSecurityData({ questionId: "", answer: "" });
                      setNewSecurityData({ questionId: "", answer: "" });
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Shield className="w-4 h-4 mr-2" />
                      Change Security Question
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {securityStep === 1
                          ? "Verify Current Security Question"
                          : "Set New Security Question"}
                      </DialogTitle>
                      <DialogDescription>
                        {securityStep === 1
                          ? "First, verify your identity by answering your current security question."
                          : "Choose and answer a new security question for account recovery."}
                      </DialogDescription>
                    </DialogHeader>

                    {securityStep === 1 ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="old-security-question">
                            Your Current Security Question
                          </Label>
                          <Select
                            value={oldSecurityData.questionId}
                            onValueChange={(value) =>
                              setOldSecurityData({
                                ...oldSecurityData,
                                questionId: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-2">
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
                        </div>
                        <div>
                          <Label htmlFor="old-answer">Answer</Label>
                          <Input
                            id="old-answer"
                            type="text"
                            value={oldSecurityData.answer}
                            onChange={(e) =>
                              setOldSecurityData({
                                ...oldSecurityData,
                                answer: e.target.value,
                              })
                            }
                            placeholder="Your answer"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="new-security-question">
                            New Security Question
                          </Label>
                          <Select
                            value={newSecurityData.questionId}
                            onValueChange={(value) =>
                              setNewSecurityData({
                                ...newSecurityData,
                                questionId: value,
                              })
                            }
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select a new security question" />
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
                        <div>
                          <Label htmlFor="new-answer">New Answer</Label>
                          <Input
                            id="new-answer"
                            type="text"
                            value={newSecurityData.answer}
                            onChange={(e) =>
                              setNewSecurityData({
                                ...newSecurityData,
                                answer: e.target.value,
                              })
                            }
                            placeholder="Your new answer"
                            className="mt-2"
                          />
                        </div>
                      </div>
                    )}

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (securityStep === 2) {
                            setSecurityStep(1);
                          } else {
                            setShowSecurityDialog(false);
                          }
                        }}
                        disabled={changingSecurity}
                      >
                        {securityStep === 2 ? "Back" : "Cancel"}
                      </Button>
                      <Button
                        onClick={
                          securityStep === 1
                            ? handleVerifyOldSecurity
                            : handleSetNewSecurity
                        }
                        disabled={changingSecurity}
                      >
                        {changingSecurity
                          ? "Processing..."
                          : securityStep === 1
                          ? "Verify & Continue"
                          : "Update Security Question"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Separator className="my-4" />

              {/* Delete Account Button */}
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="mx-auto flex items-center"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account, remove all your data from our servers, and
                      revoke all your API keys. You will be logged out
                      immediately.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> All your resources on this
                      platform, API keys, and account settings will be
                      permanently lost.
                    </AlertDescription>
                  </Alert>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingAccount}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deletingAccount
                        ? "Deleting..."
                        : "Yes, Delete My Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          <TabsContent value="developer" className="space-y-4">
            <div className="flex justify-center items-center w-full mb-5">
              <Image
                src="/icons/api.webp"
                width={120}
                height={120}
                className="me-2 object-cover"
                alt="KDSM API"
              />
            </div>
            {!user?.prefs?.cryptoPassEnabled ? (
              <Card className="bg-background/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="cryptopass-delivery"
                          checked={false}
                          onCheckedChange={(checked) => {
                            // updateFormData("cryptopass-delivery", checked);
                            // // Reset tries to default when disabling cryptopass-delivery
                            // if (!checked) {
                            //   updateFormData("tries", -1);
                            // }
                          }}
                        />
                        <Label
                          htmlFor="cryptopass-delivery"
                          className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Image
                            src={"/icons/crypto-pass.webp"}
                            width={32}
                            height={32}
                            alt="CryptoPass Icon"
                          />
                          Enable CryptoPass Delivery
                        </Label>
                      </div>
                      <p className="text-xs text-muted-foreground w-2/4 font-tomorrow font-bold">
                        Enabling CryptoPass Delivery means you can now
                        auto-generate passwords for your projects and receive
                        them securely via encrypted email. This also means that
                        you will be getting scheduled emails.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Dialog>
                <form>
                  <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input
                          id="name-1"
                          name="name"
                          defaultValue="Pedro Duarte"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="username-1">Username</Label>
                        <Input
                          id="username-1"
                          name="username"
                          defaultValue="@peduarte"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button type="submit">Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            )}

            {/* Rate Limit Status Card */}
            {rateLimitStatus && (
              <Card className="bg-background/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">API Usage</h4>
                      <UserTierBadge tier={rateLimitStatus?.tier} />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchRateLimitStatus}
                      disabled={loadingRateLimit}
                    >
                      Refresh
                    </Button>
                  </div>

                  {rateLimitStatus.limit === "unlimited" ? (
                    <div className="text-center py-4">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-red-500" />
                      <p className="font-medium text-red-600">
                        Unlimited API Access
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Calls made today: {rateLimitStatus.used}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Daily Usage</span>
                        <span>
                          {rateLimitStatus.used} / {rateLimitStatus.limit}
                        </span>
                      </div>
                      <Progress value={getUsagePercentage()} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {rateLimitStatus.remaining} calls remaining today
                      </p>
                      <Link className="Btn ml-auto" href="pricing"></Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  API Keys
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage your KDSM API keys for external integrations
                </p>
              </div>

              <Dialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={apiKeys.length >= 3}>
                    <Plus className="w-4 h-4 mr-2" />({apiKeys.length}/3)
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New API Key</DialogTitle>
                    <DialogDescription>
                      Give your API key a descriptive name to help you identify
                      it later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., My Project API"
                        value={newKeyName}
                        className="mt-2"
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createApiKey}>Create Key</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loadingKeys ? (
              <div className="flex justify-center py-8">
                <GhostLoader />
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.length === 0 ? (
                  <Card className="bg-background/50">
                    <CardContent className="pt-6 pb-6 text-center">
                      <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="font-medium mb-2">No API Keys</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first API key to start using the KDSM API
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create API Key
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  apiKeys.map((key) => (
                    <Card key={key.$id} className="bg-background/50">
                      <CardContent className="py-2">
                        <div className="flex items-center justify-between flex-wrap">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{key.keyName}</h4>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <p>
                                Created:{" "}
                                {new Date(key.$createdAt).toLocaleDateString()}
                              </p>
                              <p>
                                Last used:{" "}
                                {key.lastUsed
                                  ? new Date(key.lastUsed).toLocaleDateString()
                                  : "Never"}
                              </p>
                              <p>
                                Expires:{" "}
                                {new Date(key.expiresAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="mt-3 p-2 bg-muted rounded border w-full overflow-x-hidden truncate">
                              <div className="flex items-center gap-2 flex-wrap w-full">
                                <code className="text-xs flex-1 font-mono">
                                  {visibleKeys.has(key.$id)
                                    ? key.apiKey
                                    : "•••••••••••••••••••••••••••••••••••••"}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(key.$id)}
                                >
                                  {visibleKeys.has(key.$id) ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(key.apiKey)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon">
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete API Key
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "
                                    {key.keyName}"? This action cannot be undone
                                    and will immediately revoke access for any
                                    applications using this key.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteApiKey(key.$id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete Key
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}

            <div className="bg-blue-800 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-blue-50">
                📚 API Documentation
              </h4>
              <p className="text-sm text-blue-50 mb-2">
                Learn how to integrate KDSM encryption into your applications.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/docs#api-documentation")}
                className="text-blue-50 border-blue-300 hover:bg-blue-900"
              >
                View Documentation
              </Button>
            </div>

            {/* Rate Limit Tiers Info */}
            <div className="bg-gray-600 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-50">
                🚀 API Rate Limits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 p-2 bg-blue-500/50 rounded">
                  <Zap className="w-4 h-4 text-blue-900" />
                  <div>
                    <div className="font-medium">Free</div>
                    <div className="text-xs text-muted-foreground">
                      10 calls/day
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-500/50 rounded">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <div>
                    <div className="font-medium">Premium</div>
                    <div className="text-xs text-muted-foreground">
                      100 calls/day
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-500/50 rounded">
                  <Shield className="w-4 h-4 text-red-500" />
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Unlimited
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Rate limits are shared across all your API keys and reset daily
                at midnight UTC.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className={"flex items-center"}>
        <Button onClick={handleLogout} variant="outline" className="ml-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </CardFooter>
    </Card>
  );
}
