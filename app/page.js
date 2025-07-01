"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { encrypt, decrypt, generateKey } from "@/utils/kdsm";
import VariableProximity from "@/components/ui/VariableProximity";
import LetterGlitch from "@/components/ui/LetterGlitch";
import ShinyText from "@/components/ui/ShinyText";
import Image from "next/image";
import {
  BrushCleaning,
  Check,
  Copy,
  ExternalLink,
  Shield,
  ShieldOff,
} from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import Carousel from "@/components/ui/Carousel";
import DecryptedText from "@/components/ui/DecryptedText";
import { unstable_ViewTransition as ViewTransition } from "react";

// Define constants
const KEY_START_MARKER = "[KDSM_KEY_START]";
const KEY_END_MARKER = "[KDSM_KEY_END]";
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F18E}]|[\u{3030}]|[\u{2B50}]|[\u{2B55}]|[\u{2934}-\u{2935}]|[\u{2B05}-\u{2B07}]|[\u{2B1B}-\u{2B1C}]|[\u{3297}]|[\u{3299}]|[\u{303D}]|[\u{00A9}]|[\u{00AE}]|[\u{2122}]|[\u{23F3}]|[\u{24C2}]|[\u{23E9}-\u{23F3}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]/gu;
const COPY_TIMEOUT = 2000;

export default function Home() {
  // State management with useState hooks
  const [formState, setFormState] = useState({
    key: "",
    message: "",
    encryptedResult: "",
    decryptedResult: "",
    lastUsedKey: "",
  });

  const [copyStates, setCopyStates] = useState({
    encrypted: false,
    decrypted: false,
    key: false,
    encryptedWithKey: false,
  });

  // Refs
  const containerRef = useRef(null);
  const messageRef = useRef(null);

  // Memoized functions
  const containsEmoji = useMemo(() => (str) => EMOJI_REGEX.test(str), []);

  const handleMessageChange = useCallback((e) => {
    setFormState((prev) => ({ ...prev, message: e.target.value }));
  }, []);

  const handleKeyChange = useCallback((e) => {
    setFormState((prev) => ({ ...prev, key: e.target.value }));
  }, []);

  const handleEncrypt = useCallback(() => {
    const { message, key } = formState;

    if (!message) {
      toast.error("Oopsie!", {
        description: "Please enter a message to encrypt",
      });
      return;
    }

    let messageToEncrypt = message;
    if (!message.startsWith("http://") && !message.startsWith("https://")) {
      const messageWithoutEmojis = message.replace(EMOJI_REGEX, "");

      if (containsEmoji(message)) {
        toast.warning("Emojis Removed", {
          description:
            "Emojis were detected and removed from the message before encryption.",
        });
        messageToEncrypt = messageWithoutEmojis;
      }
    }

    try {
      const usedKey = key || generateKey();
      const result = encrypt(messageToEncrypt, usedKey);

      setFormState((prev) => ({
        ...prev,
        encryptedResult: result,
        lastUsedKey: usedKey,
        key: key || usedKey,
      }));

      toast.success(key ? "Success" : "Key Generated", {
        description: key
          ? "Message encrypted successfully"
          : "A random key was generated for encryption",
      });
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Encryption Failed", {
        description: error.message || "An error occurred during encryption",
      });
    }
  }, [formState, containsEmoji]);

  const handleDecrypt = useCallback(() => {
    const { message, key } = formState;

    if (!message) {
      toast.error("Oopsie!", {
        description: "Please enter encrypted text to decrypt",
      });
      return;
    }

    // Extract key from message if present
    const keyStartIndex = message.indexOf(KEY_START_MARKER);
    const keyEndIndex = message.indexOf(KEY_END_MARKER);

    let textToDecrypt = message;
    // Key detection logic for if the pasted message contains a key
    if (
      keyStartIndex !== -1 &&
      keyEndIndex !== -1 &&
      keyEndIndex > keyStartIndex
    ) {
      const extractedKey = message.substring(
        keyStartIndex + KEY_START_MARKER.length,
        keyEndIndex
      );
      const messageContent = message.substring(
        keyEndIndex + KEY_END_MARKER.length
      );

      setFormState((prev) => ({
        ...prev,
        key: extractedKey,
        message: messageContent,
      }));

      textToDecrypt = messageContent;
      toast("Key Detected", {
        description: "Key automatically placed in the Encryption Key field",
      });
    } else if (!key) {
      toast.error("Oopsie!", {
        description: "A key is required for decryption",
      });
      return;
    }

    try {
      const result = decrypt(textToDecrypt, key);
      setFormState((prev) => ({ ...prev, decryptedResult: result }));
      toast.success("Success", {
        description: "Message decrypted successfully",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Decryption Failed", {
        description: error.message || "An error occurred during decryption",
      });
    }
  }, [formState]);

  const handleClear = useCallback(() => {
    setFormState({
      key: "",
      message: "",
      encryptedResult: "",
      decryptedResult: "",
      lastUsedKey: "",
    });
    setCopyStates({
      encrypted: false,
      decrypted: false,
      key: false,
      encryptedWithKey: false,
    });
    toast("Cleared", {
      description: "All fields have been cleared",
    });
  }, []);

  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyStates((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => {
          setCopyStates((prev) => ({ ...prev, [type]: false }));
        }, COPY_TIMEOUT);
      })
      .catch(() => {
        toast.error("Copy Failed", {
          description: "Could not copy to clipboard",
        });
      });
  }, []);

  const copyEncryptedWithKey = useCallback(() => {
    const { encryptedResult, lastUsedKey } = formState;

    if (!encryptedResult || !lastUsedKey) {
      toast.error("Oopsie!", {
        description: "No encrypted message or key available to copy",
      });
      return;
    }

    const textToCopy = `${KEY_START_MARKER}${lastUsedKey}${KEY_END_MARKER}${encryptedResult}`;
    copyToClipboard(textToCopy, "encryptedWithKey");
    toast("Copied", {
      description: "Encrypted message and key copied to clipboard",
    });
  }, [formState, copyToClipboard]);

  const generateRandomKey = useCallback(() => {
    const newKey = generateKey();
    setFormState((prev) => ({ ...prev, key: newKey }));
    toast("Key Generated", {
      description: "A new random key has been generated",
    });
  }, []);

  const handlePaste = useCallback(
    async (event) => {
      event.preventDefault();

      try {
        const pastedText = await navigator.clipboard.readText();
        if (!pastedText) return;

        const keyStartIndex = pastedText.indexOf(KEY_START_MARKER);
        const keyEndIndex = pastedText.indexOf(KEY_END_MARKER);

        if (
          keyStartIndex !== -1 &&
          keyEndIndex !== -1 &&
          keyEndIndex > keyStartIndex
        ) {
          const key = pastedText.substring(
            keyStartIndex + KEY_START_MARKER.length,
            keyEndIndex
          );
          const messageContent = pastedText.substring(
            keyEndIndex + KEY_END_MARKER.length
          );

          setFormState((prev) => ({
            ...prev,
            key,
            message: messageContent,
          }));

          toast("Key Detected", {
            description: "Key automatically placed in the Encryption Key field",
          });
        } else if (messageRef.current) {
          const cursorPosition = messageRef.current.selectionStart;
          const newMessage =
            formState.message.substring(0, cursorPosition) +
            pastedText +
            formState.message.substring(messageRef.current.selectionEnd);

          setFormState((prev) => ({ ...prev, message: newMessage }));

          // Update cursor position
          requestAnimationFrame(() => {
            if (messageRef.current) {
              messageRef.current.selectionStart =
                messageRef.current.selectionEnd =
                  cursorPosition + pastedText.length;
            }
          });
        }
      } catch (err) {
        console.error("Failed to read clipboard contents: ", err);
        toast.error("Paste Failed", {
          description: "Could not read clipboard content.",
        });
      }
    },
    [formState.message]
  );

  // Render UI
  return (
    <div className="flex min-h-screen h-full flex-col items-center justify-between p-4 md:p-24">
      <div className="fixed inset-0 -z-10 w-screen h-screen">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </div>
      <div className="w-full max-w-3xl relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 0.2,
          }}
          className="dark:border-white/10 backdrop-blur-md"
        >
          <Card className="w-full text-primary bg-primary/10">
            <CardHeader>
              <div
                ref={containerRef}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ViewTransition name="kdsm-logo">
                  <Image
                    src="/dark/1.png"
                    width={48}
                    height={48}
                    className="me-2 object-cover"
                    alt="KDSM Logo"
                  />
                </ViewTransition>
                <VariableProximity
                  label={"KDSM Encryptor V - 0.2"}
                  className={"sm:text-2xl text-lg"}
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={containerRef}
                  radius={100}
                  falloff="gaussian"
                />
                <div className="ms-auto">
                  <ThemeToggle />
                </div>
              </div>
              <CardDescription>
                <VariableProximity
                  label={
                    "Secure your messages with Keyed Dynamic Shift Matrix encryption"
                  }
                  className={"text-base"}
                  fromFontVariationSettings="'wght' 400, 'opsz' 9"
                  toFontVariationSettings="'wght' 1000, 'opsz' 40"
                  containerRef={containerRef}
                  radius={100}
                  falloff="gaussian"
                />
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here or paste message with key..."
                  ref={messageRef}
                  value={formState.message}
                  onChange={handleMessageChange}
                  onPaste={handlePaste}
                  className="min-h-[120px]"
                />
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-yellow-500"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  For security reasons, emojis (if there are) will be
                  automatically removed from your message during encryption
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <Label htmlFor="key" className="whitespace-nowrap">
                    Encryption Key (Optional)
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomKey}
                    className="w-full sm:w-auto"
                  >
                    Generate Random Key
                  </Button>
                </div>
                <Input
                  id="key"
                  placeholder="Enter a key or leave blank for auto-generation"
                  value={formState.key}
                  onChange={handleKeyChange}
                  className="w-full"
                />
              </div>

              <div className="flex flex-wrap gap-4 flex-row-reverse">
                <Button onClick={handleEncrypt}>
                  Encrypt <Shield className="w-5 h-5" />
                </Button>
                <Button onClick={handleDecrypt} variant="secondary">
                  Decrypt <ShieldOff className="w-5 h-5" />
                </Button>
                <Button onClick={handleClear} variant="outline">
                  Clear All
                  <BrushCleaning className="w-5 h-5" />
                </Button>
              </div>

              {formState.encryptedResult && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Encrypted Result</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            formState.encryptedResult,
                            "encrypted"
                          )
                        }
                        title="Copy Encrypted Message Only"
                      >
                        {copyStates.encrypted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded border break-all">
                    {formState.encryptedResult}
                  </div>
                  <div className="w-full flex flex-row-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEncryptedWithKey}
                      title="Copy with Key"
                    >
                      {copyStates.encryptedWithKey ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}{" "}
                      With Key
                    </Button>
                  </div>
                </div>
              )}

              {formState.decryptedResult && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Decrypted Result</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formState.decryptedResult, "decrypted")
                      }
                    >
                      {copyStates.decrypted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-background rounded border break-all">
                    <DecryptedText
                      text={formState.decryptedResult}
                      animateOn="view"
                      revealDirection="start"
                      speed={200}
                      useOriginalCharsOnly={true}
                    />
                  </div>
                  {formState.decryptedResult.includes("https://") && (
                    <div className="flex flex-row-reverse">
                      <Button
                        size="sm"
                        onClick={() =>
                          window.open(formState.decryptedResult, "_blank")
                        }
                        title="Open link in new tab"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {formState.lastUsedKey && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Last Used Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formState.lastUsedKey, "key")
                      }
                    >
                      {copyStates.key ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-background rounded border break-all">
                    {formState.lastUsedKey}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col">
              <div className="flex justify-center items-center mb-3">
                <Carousel
                  autoplay={true}
                  autoplayDelay={3000}
                  pauseOnHover={true}
                  loop={true}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground w-full">
                <ShinyText
                  text="KDSM Encryptor by - Idris Vohra"
                  disabled={false}
                  speed={3}
                />
                <ShinyText
                  text="OP • Super Fast • One of a kind"
                  disabled={false}
                  speed={3}
                />
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
