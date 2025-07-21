"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [rateLimitStatus, setRateLimitStatus] = useState(null);
  const [loadingRateLimit, setLoadingRateLimit] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
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

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case "admin":
        return <Shield className="w-4 h-4 text-red-500" />;
      case "premium":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "premium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
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
    <Card className="w-full text-primary bg-secondary/50 backdrop-blur-md min-h-screen">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <InitialsAvatar user={user} />
          <div>
            <CardTitle className="flex items-center gap-2">
              {user?.name || "User"}
              {rateLimitStatus && (
                <Badge
                  className={`${getTierColor(
                    rateLimitStatus.tier
                  )} flex items-center gap-1 capitalize font-tomorrow`}
                >
                  {getTierIcon(rateLimitStatus.tier)}
                  {rateLimitStatus.tier}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="font-tomorrow text-sm">
              {user?.email || "user@example.com"}
            </CardDescription>
          </div>
          <Image
            src="/icons/3.png"
            width={86}
            height={86}
            className="ml-auto object-cover"
            alt="KDSM Logo"
          />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <div>
              <h3 className="text-base font-medium">Account Details</h3>
              <p className="text-sm">
                Subscription: {user?.subscriptionTier || "Free"}
              </p>
              <p className="text-sm">
                Joined:{" "}
                {user?.$createdAt
                  ? new Date(user.$createdAt).toLocaleDateString()
                  : "Unknown"}
              </p>
            </div>

            <div>
              <h3 className="text-base font-medium">Session Information</h3>
              <p className="text-sm">
                Your session will expire in 3 days from login.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="developer" className="space-y-4">
            <div className="flex justify-center items-center w-full mb-5">
              <Image
                src="/icons/5.png"
                width={120}
                height={120}
                className="me-2 object-cover"
                alt="KDSM API"
              />
            </div>
            {/* Rate Limit Status Card */}
            {rateLimitStatus && (
              <Card className="bg-background/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">API Usage</h4>
                      <Badge
                        className={`${getTierColor(
                          rateLimitStatus.tier
                        )} flex items-center gap-1`}
                      >
                        {getTierIcon(rateLimitStatus.tier)}
                        {rateLimitStatus.tier.charAt(0).toUpperCase() +
                          rateLimitStatus.tier.slice(1)}
                      </Badge>
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
                      <div className="flex justify-between text-sm">
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
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={apiKeys.length >= 3}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Key ({apiKeys.length}/3)
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
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
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

                            <div className="mt-3 p-2 bg-muted rounded border">
                              <div className="flex items-center gap-2">
                                <code className="text-xs flex-1 font-mono">
                                  {visibleKeys.has(key.$id)
                                    ? key.apiKey
                                    : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
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
                                <Button variant="ghost" size="sm">
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
                onClick={() => router.push("/readme#api-documentation")}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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
