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
import FlowingMenu from "@/components/ui/FlowingMenu";
import LetterGlitch from "@/components/ui/LetterGlitch";
const demoItems = [
  { link: "#", text: "FAST", image: "https://picsum.photos/600/400?random=1" },
  {
    link: "#",
    text: "SECURE",
    image: "https://picsum.photos/600/400?random=2",
  },
  {
    link: "#",
    text: "CUSTOM",
    image: "https://picsum.photos/600/400?random=3",
  },
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [encryptedResult, setEncryptedResult] = useState("");
  const [decryptedResult, setDecryptedResult] = useState("");
  const [lastUsedKey, setLastUsedKey] = useState("");

  const containerRef = useRef(null);
  const handleEncrypt = () => {
    if (!message) {
      toast("Error", {
        description: "Please enter a message to encrypt",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use provided key or generate one if empty
      const usedKey = key || generateKey();
      const result = encrypt(message, usedKey);

      setEncryptedResult(result);
      setLastUsedKey(usedKey);

      if (!key) {
        setKey(usedKey);
        toast("Key Generated", {
          description: "A random key was generated for encryption",
        });
      } else {
        toast("Success", {
          description: "Message encrypted successfully",
        });
      }
    } catch (error) {
      toast("Encryption Failed", {
        description: error.message || "An error occurred during encryption",
        variant: "destructive",
      });
    }
  };

  const handleDecrypt = () => {
    if (!encryptedResult) {
      toast("Error", {
        description: "Please encrypt a message first or enter encrypted text",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = decrypt(encryptedResult, key);
      setDecryptedResult(result);
      toast("Success", {
        description: "Message decrypted successfully",
      });
    } catch (error) {
      toast("Decryption Failed", {
        description: error.message || "An error occurred during decryption",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setMessage("");
    setKey("");
    setEncryptedResult("");
    setDecryptedResult("");
    setLastUsedKey("");
    toast("Cleared", {
      description: "All fields have been cleared",
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast("Copied!", {
          description: `${label} copied to clipboard`,
        });
      },
      (err) => {
        toast("Copy Failed", {
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      }
    );
  };

  const generateRandomKey = () => {
    const newKey = generateKey();
    setKey(newKey);
    toast("Key Generated", {
      description: "A new random key has been generated",
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="absolute inset-0 -z-10 w-full h-[165vh]">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      <div className="w-full max-w-3xl relative z-20">
        <Card className="w-full">
          <CardHeader>
            <div ref={containerRef} style={{ position: "relative" }}>
              <VariableProximity
                label={"KDSM Encryptor"}
                className={"text-2xl "}
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 1000, 'opsz' 40"
                containerRef={containerRef}
                radius={100}
                falloff="gaussian"
              />
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
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            {/* Key Input */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <Label htmlFor="key" className="whitespace-nowrap">Encryption Key (Optional)</Label>
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
              <Button onClick={handleEncrypt}>Encrypt</Button>
              <Button onClick={handleDecrypt} variant="secondary">
                Decrypt
              </Button>
              <Button onClick={handleClear} variant="outline">
                Clear All
              </Button>
            </div>

            {/* Results Section */}
            {encryptedResult && (
              <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                <div className="flex justify-between items-center">
                  <Label>Encrypted Result</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(encryptedResult, "Encrypted text")
                    }
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-background rounded border break-all">
                  {encryptedResult}
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
                      copyToClipboard(decryptedResult, "Decrypted text")
                    }
                  >
                    Copy
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
                    onClick={() => copyToClipboard(lastUsedKey, "Key")}
                  >
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-background rounded border break-all">
                  {lastUsedKey}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>KDSM Encryption</div>
            <div>Secure • Fast • Custom</div>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
