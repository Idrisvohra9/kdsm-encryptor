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
import LiquidChrome from "@/components/ui/LiquidChrome";
import GhostLoader from "@/components/ui/GhostLoader";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";
import { toast } from "sonner";
import { Copy, Plus, Trash2, Key, Code, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [apiKeys, setApiKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState(new Set());

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }

    if (user) {
      fetchApiKeys();
    }
  }, [user, loading, router]);

  const fetchApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const response = await fetch("/api/user/api-keys");
      const data = await response.json();

      if (data.success) {
        setApiKeys(data.data);
        // Initially hide all keys except newly created ones
        setHiddenKeys(new Set(data.data.map(key => key.$id)));
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
        await fetchApiKeys();
        // Show newly created key
        setHiddenKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.data.$id);
          return newSet;
        });
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
    setHiddenKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
        // Auto-hide key after 30 seconds
        setTimeout(() => {
          setHiddenKeys(current => new Set([...current, keyId]));
        }, 30000);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-primary">
        <GhostLoader />
      </div>
    );
  }

  const maskApiKey = (key) => {
    return `${key.slice(0, 5)}${'•'.repeat(36)}${key.slice(-8)}`;
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-4 relative">
      <div className="absolute inset-0" style={{ height: "600px" }}>
        <LiquidChrome />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card className="w-full max-w-4xl dark:border-white/30 backdrop-blur-md text-primary-foreground bg-primary/30">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <InitialsAvatar user={user} />
              <div>
                <CardTitle>{user?.name || "User"}</CardTitle>
                <CardDescription>
                  {user?.email || "user@example.com"}
                </CardDescription>
              </div>
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
                  <h3 className="text-sm font-medium">Account Details</h3>
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
                  <h3 className="text-sm font-medium">Session Information</h3>
                  <p className="text-sm">
                    Your session will expire in 3 days from login.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="developer" className="space-y-4">
                <div className="flex justify-center items-center w-full mb-5">
                  <Image
                    src="/dark/5.png"
                    width={120}
                    height={120}
                    className="me-2 object-cover"
                    alt="KDSM API"
                  />
                </div>
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
                        New Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New API Key</DialogTitle>
                        <DialogDescription>
                          Give your API key a descriptive name to help you
                          identify it later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="keyName">Key Name</Label>
                          <Input
                            id="keyName"
                            placeholder="e.g., My Project API"
                            value={newKeyName}
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

                <div className="space-y-3">
                  {loadingKeys ? (
                    <div className="text-center py-4 flex w-full justify-center">
                      <GhostLoader />
                    </div>
                  ) : apiKeys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No API keys created yet</p>
                      <p className="text-sm">
                        Create your first API key to get started
                      </p>
                    </div>
                  ) : (
                    apiKeys.map((key) => (
                      <Card key={key.$id} className="bg-background/50">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{key.keyName}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 font-mono text-sm">
                                <span className="w-40 lg:w-64 truncate">
                                  {hiddenKeys.has(key.$id)
                                    ? maskApiKey(key.apiKey)
                                    : key.apiKey}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleKeyVisibility(key.$id)}
                                >
                                  {!hiddenKeys.has(key.$id) ? (
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

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete API Key
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {key.keyName}"? This action cannot be
                                        undone and will immediately revoke
                                        access for any applications using this
                                        key.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteApiKey(key.$id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Created:{" "}
                                {new Date(key.$createdAt).toLocaleDateString()}
                                {key.lastUsed && (
                                  <span className="ml-4">
                                    Last used:{" "}
                                    {new Date(
                                      key.lastUsed
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                                {key.expiresAt && (
                                  <span className="ml-4">
                                    Expires At:{" "}
                                    {new Date(
                                      key.expiresAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Usage Limits</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Maximum 3 API keys per account</li>
                    <li>• 10 API calls per day per key</li>
                    <li>• Rate limits reset daily at midnight UTC</li>
                    <li>• API Key expires after 6 months of creation date</li>
                  </ul>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                    📚 API Documentation
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    Learn how to integrate KDSM encryption into your
                    applications.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/readme#api-documentation")}
                    className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/20"
                  >
                    View Documentation
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter>
            <Button onClick={handleLogout} variant="outline" className="w-full">
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
