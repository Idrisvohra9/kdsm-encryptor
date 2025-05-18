"use client";

import { useRef, useState } from "react";
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
import { BrushCleaning, Check, Copy, Shield, ShieldOff } from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { motion } from "framer-motion"; // Import motion

// Define a unique marker for the key within the copied string
const KEY_START_MARKER = "[KDSM_KEY_START]";
const KEY_END_MARKER = "[KDSM_KEY_END]";
// TODO: Make it work well with links and automatically detect link in decryped result

export default function Home() {
  const [key, setKey] = useState("");
  const [encryptedResult, setEncryptedResult] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [lastUsedKey, setLastUsedKey] = useState("");
  const [copyStates, setCopyStates] = useState({
    encrypted: false,
    decrypted: false,
    key: false,
    encryptedWithKey: false, // Add state for the new copy button
  });

  const containerRef = useRef(null);
  const messageRef = useRef(null); // Add ref for the message textarea

  function containsEmoji(str) {
    // Updated regex to match a broader range of Unicode emoji blocks and sequences
    const emojiRegex =
      /(\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
    return emojiRegex.test(str);
  }

  const handleEncrypt = () => {
    let message = messageRef.current?.value || ""; // Read value from ref
    if (!message) {
      toast.error("Oopsie!", {
        description: "Please enter a message to encrypt",
      });
      return;
    }

    // Remove emojis from the message string
    const emojiRegex =
      /(\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
    message = message.replace(emojiRegex, ""); // Replace emojis with an empty string

    // Optional: Show a warning if emojis were removed
    if (containsEmoji(messageRef.current?.value || "")) {
      // Check original message for emojis
      toast.warning("Emojis Removed", {
        description:
          "Emojis were detected and removed from the message before encryption.",
      });
    }
    try {
      // Use provided key or generate one if empty
      const usedKey = key || generateKey();

      // Measure encryption time for performance monitoring
      const startTime = performance.now();
      const result = encrypt(message, usedKey); // Encrypt the message without emojis
      const endTime = performance.now();

      // Log performance in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Encryption time: ${(endTime - startTime).toFixed(2)}ms for ${
            message.length
          } characters`
        );
      }

      setEncryptedResult(result);
      setLastUsedKey(usedKey);

      if (!key) {
        setKey(usedKey);
        toast.success("Key Generated", {
          description: "A random key was generated for encryption",
        });
      } else {
        toast.success("Success", {
          description: "Message encrypted successfully",
        });
      }
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Encryption Failed", {
        description: error.message || "An error occurred during encryption",
      });
    }
  };

  const handleDecrypt = () => {
    // Read the text directly from the message textarea using the ref
    const textToDecrypt = messageRef.current?.value || "";

    if (!textToDecrypt) {
      toast.error("Oopsie!", {
        description: "Please enter encrypted text to decrypt", // Updated error message
      });
      return;
    }

    if (!key) {
      toast.error("Oopsie!", {
        description: "A key is required for decryption",
      });
      return;
    }

    try {
      // Measure decryption time for performance monitoring
      const startTime = performance.now();
      const result = decrypt(textToDecrypt, key); // Use text from ref
      const endTime = performance.now();

      // Log performance in development
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Decryption time: ${(endTime - startTime).toFixed(2)}ms for ${
            textToDecrypt.length
          } characters`
        );
      }

      setDecryptedResult(result);
      toast("Success", {
        description: "Message decrypted successfully",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Decryption Failed", {
        // Changed to toast.error
        description: error.message || "An error occurred during decryption",
        // Removed variant: "destructive"
      });
    }
  };

  const handleClear = () => {
    if (messageRef.current) {
      messageRef.current.value = ""; // Clear input using ref
    }
    setKey("");
    setEncryptedResult("");
    setDecryptedResult("");
    setLastUsedKey("");
    setCopyStates({
      encrypted: false,
      decrypted: false,
      key: false,
    });
    toast("Cleared", {
      description: "All fields have been cleared",
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyStates((prev) => ({ ...prev, [type]: true }));
        setTimeout(() => {
          setCopyStates((prev) => ({ ...prev, [type]: false }));
        }, 2000);
      },
      (err) => {
        toast.error("Copy Failed", {
          // Changed to toast.error
          description: "Could not copy to clipboard",
          // Removed variant: "destructive"
        });
      }
    );
  };

  // New function to copy encrypted result with key
  const copyEncryptedWithKey = () => {
    if (!encryptedResult || !lastUsedKey) {
      toast.error("Oopsie!", {
        // Changed to toast.error
        description: "No encrypted message or key available to copy",
        // Removed variant: "destructive"
      });
      return;
    }
    // Format the string with markers
    const textToCopy = `${KEY_START_MARKER}${lastUsedKey}${KEY_END_MARKER}${encryptedResult}`;
    copyToClipboard(textToCopy, "encryptedWithKey");
    toast("Copied", {
      description: "Encrypted message and key copied to clipboard",
    });
  };

  const generateRandomKey = () => {
    const newKey = generateKey();
    setKey(newKey);
    toast("Key Generated", {
      description: "A new random key has been generated",
    });
  };

  // Handle paste event on the message textarea
  const handlePaste = async (event) => { // Mark function as async
    // Prevent default paste behavior initially, we'll handle it manually
    event.preventDefault();

    try {
      // Use navigator.clipboard.readText() for more reliable access
      const pastedText = await navigator.clipboard.readText();

      if (pastedText) {
        // Check if the pasted text contains the key markers
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
          const message = pastedText.substring(
            keyEndIndex + KEY_END_MARKER.length
          );

          // Set the key input value
          setKey(key);

          // Set the message textarea value using the ref
          if (messageRef.current) {
            messageRef.current.value = message;
          }

          toast("Key Detected", {
            description: "Key automatically placed in the Encryption Key field",
          });
        } else {
           // If markers are not found, paste the text normally
           if (messageRef.current) {
             const currentMessage = messageRef.current.value;
             const cursorPosition = messageRef.current.selectionStart;
             const newMessage = currentMessage.substring(0, cursorPosition) + pastedText + currentMessage.substring(messageRef.current.selectionEnd);
             messageRef.current.value = newMessage;
             // Optionally restore cursor position
             messageRef.current.selectionStart = messageRef.current.selectionEnd = cursorPosition + pastedText.length;
           }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      toast.error("Paste Failed", {
        description: "Could not read clipboard content.",
      });
      // Fallback: Allow default paste if reading clipboard fails
      // Note: This might still fail on some mobile browsers if clipboardData is also unavailable
      // event.target.dispatchEvent(new Event('paste', { bubbles: true })); // This might cause infinite loops or other issues, better to just log error.
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="absolute inset-0 -z-10 w-full h-[165vh]">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={false}
          outerVignette={false}
          smooth={true}
        />
      </div>
      <div className="w-full max-w-3xl relative z-20">
        {/* Wrap the Card with motion.div */}
        <motion.div
          initial={{ opacity: 0, y: -50 }} // Start slightly above and invisible
          animate={{ opacity: 1, y: 0 }} // End at original position and fully visible
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 10,
            delay: 0.2,
          }} // Spring animation
          className="dark:border-white/10 backdrop-blur-md"
        >
          <Card className="w-full text-primary bg-background/10">
            <CardHeader>
              <div
                ref={containerRef}
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Image
                  src="/dark/1.png"
                  width={48}
                  height={48}
                  className="me-2 object-cover"
                  alt="KDSM Logo"
                />
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
              {/* Message Input */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here or paste message with key..."
                  ref={messageRef} // Attach ref to the textarea
                  onPaste={handlePaste} // Add paste handler
                  className="min-h-[120px]"
                />
              </div>

              {/* Key Input */}
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
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
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

              {/* Results Section */}
              {encryptedResult && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Encrypted Result</Label>
                    <div className="flex gap-2">
                      {" "}
                      {/* Container for copy buttons */}
                      {/* Original "Copy" button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(encryptedResult, "encrypted")
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
                    {encryptedResult}
                  </div>
                  {/* New "Copy with key" button */}
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

              {decryptedResult && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Decrypted Result</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(decryptedResult, "decrypted")
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
                    {decryptedResult}
                  </div>
                </div>
              )}

              {lastUsedKey && (
                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Last Used Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(lastUsedKey, "key")}
                    >
                      {copyStates.key ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  <div className="p-3 bg-background rounded border break-all">
                    {lastUsedKey}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between text-sm text-muted-foreground">
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
            </CardFooter>
          </Card>
        </motion.div>{" "}
        {/* Close motion.div */}
      </div>
    </main>
  );
}
