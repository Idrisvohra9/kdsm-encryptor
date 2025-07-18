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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { encrypt, decrypt, generateKey } from "@/utils/kdsm";
import VariableProximity from "@/components/ui/VariableProximity";
import LetterGlitch from "@/components/ui/LetterGlitch";
import ShinyText from "@/components/ui/ShinyText";
import DecryptedText from "@/components/ui/DecryptedText";
import Image from "next/image";
import {
  BrushCleaning,
  Check,
  Copy,
  ExternalLink,
  Shield,
  ShieldOff,
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import FlowingMenu from "@/components/ui/FlowingMenu";

// Define constants with corrected emoji regex
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

  // Refs for DOM elements
  const containerRef = useRef(null);
  const messageRef = useRef(null);

  // Memoized function to check if string contains emojis
  const containsEmoji = useMemo(() => (str) => EMOJI_REGEX.test(str), []);

  // Memoized function to remove emojis from string
  const removeEmojis = useMemo(() => (str) => str.replace(EMOJI_REGEX, ""), []);

  // Handle message input changes with emoji detection
  const handleMessageChange = useCallback(
    (e) => {
      const newMessage = e.target.value;
      if (containsEmoji(newMessage)) {
        toast.warning("Emojis Detected", {
          description:
            "Emojis will be automatically removed during encryption for security reasons",
        });
      }
      setFormState((prev) => ({ ...prev, message: newMessage }));
    },
    [containsEmoji]
  );

  // Handle key input changes
  const handleKeyChange = useCallback((e) => {
    setFormState((prev) => ({ ...prev, key: e.target.value }));
  }, []);

  // Handle paste events with automatic key extraction
  const handlePaste = useCallback((e) => {
    const pastedText = e.clipboardData.getData("text");
    const keyStartIndex = pastedText.indexOf(KEY_START_MARKER);
    const keyEndIndex = pastedText.indexOf(KEY_END_MARKER);

    if (keyStartIndex !== -1 && keyEndIndex !== -1) {
      const extractedKey = pastedText.substring(
        keyStartIndex + KEY_START_MARKER.length,
        keyEndIndex
      );
      const messageWithoutKey = pastedText
        .replace(KEY_START_MARKER + extractedKey + KEY_END_MARKER, "")
        .trim();

      setFormState((prev) => ({
        ...prev,
        message: messageWithoutKey,
        key: extractedKey,
      }));

      toast.success("Key Extracted", {
        description:
          "Encryption key was automatically extracted from the pasted message",
      });
      e.preventDefault();
    }
  }, []);

  // Generate a random encryption key
  const generateRandomKey = useCallback(async () => {
    try {
      const randomKey = await generateKey(12);
      setFormState((prev) => ({ ...prev, key: randomKey }));
      toast.success("Key Generated", {
        description: "A new random encryption key has been generated",
      });
    } catch (error) {
      console.error("Key generation error:", error);
      toast.error("Generation Failed", {
        description: "Could not generate a random key",
      });
    }
  }, []);

  // Handle encryption process
  const handleEncrypt = useCallback(async () => {
    if (!formState.message.trim()) {
      toast.error("Empty Message", {
        description: "Please enter a message to encrypt",
      });
      return;
    }

    try {
      const cleanMessage = removeEmojis(formState.message);
      const encryptedMessage = encrypt(
        cleanMessage,
        formState.key || undefined
      );
      const keyUsed = formState.key || "Auto-generated";

      setFormState((prev) => ({
        ...prev,
        encryptedResult: encryptedMessage,
        lastUsedKey: keyUsed,
        decryptedResult: "",
      }));

      toast.success("Message Encrypted", {
        description: "Your message has been encrypted successfully",
      });
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Encryption Failed", {
        description: error.message || "An error occurred during encryption",
      });
    }
  }, [formState.message, formState.key, removeEmojis]);

  // Handle decryption process
  const handleDecrypt = useCallback(async () => {
    if (!formState.message.trim()) {
      toast.error("Empty Message", {
        description: "Please enter a message to decrypt",
      });
      return;
    }

    if (!formState.key.trim()) {
      toast.error("Missing Key", {
        description: "Please enter the decryption key",
      });
      return;
    }

    try {
      const decryptedMessage = decrypt(formState.message, formState.key);
      setFormState((prev) => ({
        ...prev,
        decryptedResult: decryptedMessage,
        encryptedResult: "",
      }));

      toast.success("Message Decrypted", {
        description: "Your message has been decrypted successfully",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Decryption Failed", {
        description:
          error.message ||
          "An error occurred during decryption. Please check your key.",
      });
    }
  }, [formState.message, formState.key]);

  // Copy text to clipboard with feedback
  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyStates((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => {
          setCopyStates((prev) => ({ ...prev, [type]: false }));
        }, COPY_TIMEOUT);
        toast.success("Copied", {
          description: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } copied to clipboard`,
        });
      })
      .catch(() => {
        toast.error("Copy Failed", {
          description: "Could not copy to clipboard",
        });
      });
  }, []);

  // Copy encrypted message with key
  const copyEncryptedWithKey = useCallback(() => {
    const textWithKey = `${formState.encryptedResult}${KEY_START_MARKER}${formState.lastUsedKey}${KEY_END_MARKER}`;
    copyToClipboard(textWithKey, "encryptedWithKey");
  }, [formState.encryptedResult, formState.lastUsedKey, copyToClipboard]);

  // Clear all form data
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

  return (
    <div className="flex min-h-screen h-full flex-col items-center justify-between p-4 md:p-24">
      <LetterGlitch />
      <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-3xl relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 0.2,
          }}
          className="backdrop-blur-md"
        >
          <Card className="w-full text-primary bg-primary/10 gap-0">
            <CardHeader className="flex flex-col sm:flex-row-reverse items-center gap-3 sm:gap-4">
              <Image
                src="/icons/1.png"
                width={86}
                height={86}
                className="me-2 object-cover w-16 h-16 sm:w-20 sm:h-20 md:w-[86px] md:h-[86px]"
                alt="KDSM Logo"
              />
              <div
                ref={containerRef}
                className="flex-1 flex flex-col text-center sm:text-left space-y-2 sm:space-y-4"
              >
                <VariableProximity
                  label={"KDSM Encryptor V - 0.5"}
                  className="text-lg sm:text-xl md:text-2xl"
                  containerRef={containerRef}
                  radius={50}
                  falloff="linear"
                />
                <CardDescription>
                  <VariableProximity
                    label={
                      "Secure your messages with Keyed Dynamic Shift Matrix encryption"
                    }
                    className="text-sm sm:text-base"
                    containerRef={containerRef}
                    radius={50}
                    falloff="linear"
                  />
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm sm:text-base">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here or paste message with key..."
                  ref={messageRef}
                  value={formState.message}
                  onChange={handleMessageChange}
                  onPaste={handlePaste}
                  className="min-h-[120px] text-sm sm:text-base"
                  autoFocus
                />
                <Alert>
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <AlertTitle className="text-sm sm:text-base">
                    Security Notice
                  </AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    For security reasons, emojis will be automatically removed
                    from your message during encryption
                  </AlertDescription>
                </Alert>
              </div>

              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                  <Label
                    htmlFor="key"
                    className="text-sm sm:text-base whitespace-nowrap"
                  >
                    Encryption Key (Optional)
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateRandomKey}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    Generate Random Key
                  </Button>
                </div>
                <Input
                  id="key"
                  placeholder="Enter a key or leave blank for auto-generation"
                  value={formState.key}
                  onChange={handleKeyChange}
                  className="w-full text-sm sm:text-base"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                  inputMode="text"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleEncrypt}
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Encrypt <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  onClick={handleDecrypt}
                  variant="secondary"
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Decrypt <ShieldOff className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base"
                >
                  Clear All
                  <BrushCleaning className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {formState.encryptedResult && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md bg-muted/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Label className="text-sm sm:text-base">
                      Encrypted Result
                    </Label>
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
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        ) : (
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 bg-background rounded border break-all font-tomorrow text-xs sm:text-sm">
                    {formState.encryptedResult}
                  </div>
                  <div className="w-full flex flex-row-reverse">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyEncryptedWithKey}
                      title="Copy with Key"
                      className="text-xs sm:text-sm"
                    >
                      {copyStates.encryptedWithKey ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      )}{" "}
                      With Key
                    </Button>
                  </div>
                </div>
              )}

              {formState.decryptedResult && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md bg-muted/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Label className="text-sm sm:text-base">
                      Decrypted Result
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formState.decryptedResult, "decrypted")
                      }
                    >
                      {copyStates.decrypted ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-2 sm:p-3 bg-background rounded border break-all font-tomorrow text-xs sm:text-sm">
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
                        className="text-xs sm:text-sm"
                      >
                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {formState.lastUsedKey && (
                <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md bg-muted/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Label className="text-sm sm:text-base">
                      Last Used Key
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formState.lastUsedKey, "key")
                      }
                    >
                      {copyStates.key ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-2 sm:p-3 bg-background rounded border break-all font-tomorrow text-xs sm:text-sm">
                    {formState.lastUsedKey}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex-col p-4 sm:p-6">
              <FlowingMenu />
              <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground w-full gap-2 sm:gap-0">
                <ShinyText
                  text="KDSM Encryptor by - Idris Vohra"
                  disabled={false}
                  speed={3}
                  className="text-center"
                />
                <ShinyText
                  text="OP • Super Fast • One of a kind"
                  disabled={false}
                  speed={3}
                  className="text-center"
                />
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
