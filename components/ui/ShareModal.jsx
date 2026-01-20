import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/chats/Modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Copy, Check, Clock, Lock, LogIn, Loader2, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import useAuthStore from "@/store/authStore";
import { createSharedMessage } from "@/lib/shareEncryptedMsgs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SocialIcon } from "react-social-icons";
import { Checkbox } from "./checkbox";

const ShareModal = ({ isOpen, onClose, encryptedMessage, encryptionKey }) => {
  const [copiedPlatform, setCopiedPlatform] = useState(null);
  const [shareUrl, setShareUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    duration: 300,
    hangman: false,
    tries: -1,
  });
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const autoCloseTimerRef = useRef(null);

  // Clear auto-close timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  // Function to start auto-close timer
  const startAutoCloseTimer = useCallback(() => {
    // Clear any existing timer
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
    }

    // Set new timer for 10 seconds
    autoCloseTimerRef.current = setTimeout(() => {
      onClose();
    }, 10000);
  }, [onClose]);
  // Handle form data changes
  const updateFormData = useCallback((key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Check if user is premium
  const isPremium = useMemo(() => {
    return user?.labels?.includes("premium") || false;
  }, [user]);

  // Define expiry duration options
  const expiryOptions = useMemo(
    () => [
      { label: "5 minutes", value: 300, enabled: true },
      { label: "10 minutes", value: 600, enabled: true },
      {
        label: "30 minutes",
        value: 1800,
        enabled: isPremium,
      },
      {
        label: "1 hour",
        value: 3600,
        enabled: isPremium,
      },
      {
        label: "10 hours",
        value: 36000,
        enabled: isPremium,
      },
      {
        label: "1 day",
        value: 86400,
        enabled: isPremium,
      },
    ],
    [isPremium]
  );

  // Memoized share message without encryption key
  const shareMessage = useMemo(() => {
    if (!shareUrl) return "";
    const baseMessage = `(^_^) Try decrypting this message using KDSM Encryptor!\n\n 
    ${formData.hangman ? "Play Hangman to guess the decryption key!" : ""}\n\n
    Click the link below to decrypt:\n${shareUrl}\n\n Secure. Simple. Powerful.\n\n#KDSMEncryptor #Encryption #Security`;
    return baseMessage;
  }, [shareUrl, formData.hangman]);

  // Memoized platform configurations
  const platforms = useMemo(
    () => [
      {
        name: "WhatsApp",
        color: "bg-green-500 hover:bg-green-600",
        Icon: <SocialIcon network="whatsapp" className="size-12" />,
        url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
        description: "Share via WhatsApp",
      },
      {
        name: "X (Twitter)",
        color: "bg-black hover:bg-gray-800",
        Icon: <SocialIcon network="twitter" className="size-12" />,
        url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          shareMessage
        )}`,
        description: "Share on X",
      },
      {
        name: "Telegram",
        color: "bg-blue-500 hover:bg-blue-600",
        Icon: <SocialIcon network="telegram" className="size-12" />,
        url: `https://t.me/share/url?text=${encodeURIComponent(shareMessage)}`,
        description: "Share on Telegram",
      },
    ],
    [shareMessage]
  );

  // Generate shareable link
  const generateShareLink = useCallback(async () => {
    if (!user?.$id) {
      toast.error("Authentication Required", {
        description: "Please log in to generate a shareable link",
      });
      return;
    }

    // Validate tries if hangman is enabled
    if (formData.hangman && formData.tries !== -1) {
      if (formData.tries < 6 || formData.tries > 10) {
        toast.error("Invalid Tries", {
          description: "Tries must be between 6 and 10, or -1 for infinite",
        });
        return;
      }
    }

    setIsGenerating(true);
    try {
      const result = await createSharedMessage(
        encryptedMessage,
        encryptionKey,
        formData.duration,
        formData.hangman,
        formData.tries
      );

      setShareUrl(result.shareUrl);
      toast.success("Link Generated", {
        description: `Your link will expire in ${
          expiryOptions.find((opt) => opt.value === formData.duration)?.label
        }${formData.hangman ? " with Hangman mode enabled" : ""}`,
      });
    } catch (error) {
      console.error("Generate link error:", error);
      toast.error("Failed to Generate Link", {
        description: error.message || "Could not create shareable link",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [user, encryptedMessage, encryptionKey, formData, expiryOptions]);

  // Handle platform share with optimized copy functionality
  const handleShare = useCallback(
    async (platform) => {
      if (!shareUrl) {
        toast.error("No Link", {
          description: "Please generate a shareable link first",
        });
        return;
      }

      try {
        if (platform.url) {
          // Open social media platform
          window.open(platform.url, "_blank", "noopener,noreferrer");
          toast.success("Redirected", {
            description: `Opened ${platform.name} to share your encrypted message. Modal will close in 10 seconds.`,
          });
          startAutoCloseTimer();
        } else {
          // Copy to clipboard for platforms without direct URL support
          await navigator.clipboard.writeText(shareMessage);
          setCopiedPlatform(platform.name);

          setTimeout(() => {
            setCopiedPlatform(null);
          }, 2000);

          toast.success("Copied", {
            description: `Message copied for ${platform.name}. Paste it manually! Modal will close in 10 seconds.`,
          });
          startAutoCloseTimer();
        }
      } catch (error) {
        console.error("Share error:", error);
        toast.error("Share Failed", {
          description: `Could not share to ${platform.name}`,
        });
      }
    },
    [shareMessage, shareUrl]
  );

  // Copy entire message to clipboard
  const copyMessage = useCallback(async () => {
    if (!shareUrl) {
      toast.error("No Link", {
        description: "Please generate a shareable link first",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopiedPlatform("clipboard");

      setTimeout(() => {
        setCopiedPlatform(null);
      }, 2000);

      toast.success("Copied", {
        description:
          "Share message copied to clipboard. Modal will close in 10 seconds.",
      });
      startAutoCloseTimer();
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Copy Failed", {
        description: "Could not copy message to clipboard",
      });
    }
  }, [shareMessage, shareUrl]);

  // Copy direct URL
  const copyUrl = useCallback(async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("URL Copied", {
        description:
          "Share link copied to clipboard. Modal will close in 10 seconds.",
      });
      startAutoCloseTimer();
    } catch (error) {
      console.error("Copy URL error:", error);
      toast.error("Copy Failed", {
        description: "Could not copy URL to clipboard",
      });
    }
  }, [shareUrl]);

  // If not logged in, show login prompt
  if (!loading && !user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="space-y-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto bg-orange-500/10 rounded-full flex items-center justify-center"
          >
            <Lock className="w-8 h-8 text-orange-500" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              You need to be logged in to generate shareable links for your
              encrypted messages
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                onClose();
                window.location.href = "/auth/login";
              }}
              className="w-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-row items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="w-12 h-12 shrink-0 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Send className="w-6 h-6 text-primary" />
          </motion.div>
          <div className="flex-1 text-left space-y-1 font-tomorrow">
            <h2 className="text-xl font-bold text-foreground font-tomorrow">
              Share Encrypted Message
            </h2>
            <p className="text-muted-foreground text-sm">
              Generate a secure link to share your encrypted message
            </p>
          </div>
        </div>

        {/* Form Settings */}
        {!shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {/* Expiry Duration */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Link Expiry Duration
              </Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => updateFormData("duration", parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expiry duration" />
                </SelectTrigger>
                <SelectContent>
                  {expiryOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value.toString()}
                      disabled={!option.enabled}
                    >
                      {option.label} {!option.enabled && "(Premium Only)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The link will automatically expire after the selected duration
              </p>
            </div>

            {/* Hangman Mode */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hangman"
                  checked={formData.hangman}
                  onCheckedChange={(checked) => {
                    updateFormData("hangman", checked);
                    // Reset tries to default when disabling hangman
                    if (!checked) {
                      updateFormData("tries", -1);
                    }
                  }}
                />
                <Label
                  htmlFor="hangman"
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Gamepad2 className="w-4 h-4" />
                  Enable Hangman Mode
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients will play a hangman game to reveal the decryption key
              </p>
            </div>

            {/* Tries (only shown when hangman is enabled) */}
            {formData.hangman && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="tries" className="text-sm font-medium">
                  Number of Tries
                </Label>
                <Select
                  value={formData.tries.toString()}
                  onValueChange={(value) => updateFormData("tries", parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of tries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-1">Infinite</SelectItem>
                    <SelectItem value="6">6 tries</SelectItem>
                    <SelectItem value="7">7 tries</SelectItem>
                    <SelectItem value="8">8 tries</SelectItem>
                    <SelectItem value="9">9 tries</SelectItem>
                    <SelectItem value="10">10 tries</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Set to infinite for unlimited attempts, or 6-10 for limited tries
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Generate Link Button */}
        {!shareUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              onClick={generateShareLink}
              disabled={isGenerating}
              className="w-full h-12"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Generate Shareable Link
                </>
              )}
            </Button>
          </motion.div>
        )}

        {/* Share URL Display */}
        {shareUrl && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                  ✓ Link Generated Successfully
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-background rounded p-2 flex-1 overflow-x-auto">
                    {shareUrl}
                  </code>
                  <Button
                    onClick={copyUrl}
                    size="sm"
                    variant="ghost"
                    className="shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 bg-muted/50 rounded-lg border"
            >
              <p className="text-sm text-muted-foreground mb-2">
                Share Message Preview:
              </p>
              <div className="text-xs bg-background rounded p-3 border max-h-32 overflow-y-auto font-tomorrow">
                {shareMessage}
              </div>
            </motion.div>
          </>
        )}

        {/* Platform Buttons */}
        {shareUrl && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-evenly items-center gap-2"
            >
              {platforms.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Button
                    onClick={() => handleShare(platform)}
                    className={`size-14 text-white relative overflow-hidden group`}
                    variant="ghost"
                    size="icon"
                    aria-label={platform.description}
                  >
                    <div className="flex items-center gap-2">
                      <span className="sr-only">{platform.name}</span>
                      {platform.Icon}
                    </div>

                    {/* Success indicator */}
                    {copiedPlatform === platform.name && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-green-500 flex items-center justify-center"
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Copy Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={copyMessage}
                variant="outline"
                className="w-full h-12 border-dashed border-2 hover:border-solid transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  {copiedPlatform === "clipboard" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  <span>Copy Share Message</span>
                </div>
              </Button>
            </motion.div>
          </>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: shareUrl ? 0.7 : 0.4 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            {shareUrl
              ? "Recipients can click the link to instantly decrypt your message"
              : "Your link will be secure and expire automatically"}
          </p>
        </motion.div>
      </div>
    </Modal>
  );
};

export default ShareModal;
