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
import {
  BrushCleaning,
  Check,
  Copy,
  ExternalLink,
  Shield,
  ShieldOff,
} from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { motion } from "framer-motion"; // Import motion
import Carousel from "@/components/ui/Carousel";
import DecryptedText from "@/components/ui/DecryptedText";
import { unstable_ViewTransition as ViewTransition } from "react";

// Define a unique marker for the key within the copied string
const KEY_START_MARKER = "[KDSM_KEY_START]";
const KEY_END_MARKER = "[KDSM_KEY_END]";

export default function Home() {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState(""); // Add state for the message input
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
  const messageRef = useRef(null); // Keep ref for cursor position in paste handler

  function containsEmoji(str) {
    // Updated regex to match a broader range of Unicode emoji blocks and sequences
    const emojiRegex =
      /(\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
    return emojiRegex.test(str);
  }

  const handleEncrypt = () => {
    let currentMessage = message; // Use state value
    if (!currentMessage) {
      toast.error("Oopsie!", {
        description: "Please enter a message to encrypt",
      });
      return;
    }

    let messageToEncrypt = currentMessage;
    // Only remove emojis if it's not a URL (basic check)
    if (
      !currentMessage.startsWith("http://") &&
      !currentMessage.startsWith("https://")
    ) {
      const emojiRegex =
        /(\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/gu;
      const messageWithoutEmojis = currentMessage.replace(emojiRegex, "");

      if (containsEmoji(currentMessage)) {
        toast.warning("Emojis Removed", {
          description:
            "Emojis were detected and removed from the message before encryption.",
        });
        messageToEncrypt = messageWithoutEmojis;
      }
    }

    try {
      const usedKey = key || generateKey();
      const result = encrypt(messageToEncrypt, usedKey); // Use messageToEncrypt

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
    const textToDecrypt = message; // Use state value

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
      const result = decrypt(textToDecrypt, key); // Use text from state
      setDecryptedResult(result);
      toast("Success", {
        description: "Message decrypted successfully",
      });
    } catch (error) {
      console.error("Decryption error:", error);
      toast.error("Decryption Failed", {
        description: error.message || "An error occurred during decryption",
      });
    }
  };

  const handleClear = () => {
    setMessage(""); // Clear message state
    setKey("");
    setEncryptedResult("");
    setDecryptedResult("");
    setLastUsedKey("");
    setCopyStates({
      encrypted: false,
      decrypted: false,
      key: false,
      encryptedWithKey: false, // Reset this state too
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
          description: "Could not copy to clipboard",
        });
      }
    );
  };

  // New function to copy encrypted result with key
  const copyEncryptedWithKey = () => {
    if (!encryptedResult || !lastUsedKey) {
      toast.error("Oopsie!", {
        description: "No encrypted message or key available to copy",
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
  const handlePaste = async (event) => {
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
          const messageContent = pastedText.substring(
            keyEndIndex + KEY_END_MARKER.length
          );

          // Set the key input value
          setKey(key);
          // Set the message state value
          setMessage(messageContent);

          toast("Key Detected", {
            description: "Key automatically placed in the Encryption Key field",
          });
        } else {
          // If markers are not found, paste the text normally into the state
          if (messageRef.current) {
            const currentMessage = message; // Use state value
            const cursorPosition = messageRef.current.selectionStart;
            const newMessage =
              currentMessage.substring(0, cursorPosition) +
              pastedText +
              currentMessage.substring(messageRef.current.selectionEnd);

            setMessage(newMessage); // Update state

            // Restore cursor position after state update
            // Need a small delay or use a state variable for cursor position
            // For simplicity, we'll just set it directly, might not be perfect
            messageRef.current.selectionStart =
              messageRef.current.selectionEnd =
                cursorPosition + pastedText.length;
          } else {
            // Fallback if ref is not available, just append
            setMessage((prevMessage) => prevMessage + pastedText);
          }
        }
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      toast.error("Paste Failed", {
        description: "Could not read clipboard content.",
      });
    }
  };

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
              {/* Message Input */}

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message here or paste message with key..."
                  ref={messageRef} // Keep ref for cursor position
                  value={message} // Bind value to state
                  onChange={(e) => setMessage(e.target.value)} // Update state on change
                  onPaste={handlePaste} // Add paste handler
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
                    {/* Example 2: Customized speed and characters */}
                    <DecryptedText
                      text={decryptedResult}
                      animateOn="view"
                      revealDirection="start"
                      speed={200}
                      useOriginalCharsOnly={true}
                    />
                  </div>
                  {decryptedResult.includes("https://") && (
                    <div className="flex flex-row-reverse">
                      <Button
                        size="sm"
                        onClick={() => window.open(decryptedResult, "_blank")}
                        title="Open link in new tab"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
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
        </motion.div>{" "}
        {/* Close motion.div */}
      </div>
    </div>
  );
}
