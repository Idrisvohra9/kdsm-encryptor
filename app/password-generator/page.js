"use client";

import { useRef, useState, useCallback } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { generateKey } from "@/utils/kdsm";
import VariableProximity from "@/components/ui/VariableProximity";
import LetterGlitch from "@/components/ui/LetterGlitch";
import ShinyText from "@/components/ui/ShinyText";
import Image from "next/image";
import {
  BrushCleaning,
  Check,
  Copy,
  Key,
  RefreshCw,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import ThemeToggle from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import Carousel from "@/components/ui/Carousel";

const COPY_TIMEOUT = 2000;

export default function PasswordGenerator() {
  const [formState, setFormState] = useState({
    length: [12],
    includeNumbers: true,
    includeSpecialChars: true,
    includeUppercase: true,
    includeLowercase: true,
    excludeSimilar: false,
    customChars: "",
    generatedPassword: "",
    showPassword: true,
  });
  const [copyState, setCopyState] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef(null);

  const handleOptionChange = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleLengthChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, length: value }));
  }, []);

  const generatePassword = useCallback(async () => {
    const {
      length,
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      customChars,
    } = formState;

    // Validate at least one character type is selected
    if (
      !customChars &&
      !includeNumbers &&
      !includeSpecialChars &&
      !includeUppercase &&
      !includeLowercase
    ) {
      toast.error("Invalid Options", {
        description:
          "Please select at least one character type or provide custom characters",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const options = {
        includeNumbers,
        includeSpecialChars,
        includeUppercase,
        includeLowercase,
        excludeSimilar,
        customChars: customChars || undefined,
      };

      const password = await generateKey(length[0], options);
      setFormState((prev) => ({ ...prev, generatedPassword: password }));

      toast.success("Password Generated", {
        description: `A ${length[0]}-character password has been generated successfully`,
      });
    } catch (error) {
      console.error("Password generation error:", error);
      toast.error("Generation Failed", {
        description:
          error.message || "An error occurred while generating the password",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [formState]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyState(true);
        setTimeout(() => {
          setCopyState(false);
        }, COPY_TIMEOUT);
        toast.success("Copied", {
          description: "Password copied to clipboard",
        });
      })
      .catch(() => {
        toast.error("Copy Failed", {
          description: "Could not copy to clipboard",
        });
      });
  }, []);

  const handleClear = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      generatedPassword: "",
      customChars: "",
    }));
    setCopyState(false);
    toast("Cleared", {
      description: "Generated password has been cleared",
    });
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setFormState((prev) => ({ ...prev, showPassword: !prev.showPassword }));
  }, []);

  const getPasswordStrength = useCallback((password) => {
    if (!password)
      return {
        strength: 0,
        label: "No password",
        color: "text-muted-foreground",
      };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2)
      return { strength: score, label: "Weak", color: "text-red-500" };
    if (score <= 4)
      return { strength: score, label: "Medium", color: "text-yellow-500" };
    return { strength: score, label: "Strong", color: "text-green-500" };
  }, []);

  const passwordStrength = getPasswordStrength(formState.generatedPassword);

  return (
    <div className="flex min-h-screen h-full flex-col items-center justify-between p-4 md:p-24">
      <div className="fixed inset-0 -z-10 w-screen h-screen">
        <LetterGlitch
          glitchSpeed={50}
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
                  <Image
                    src="/dark/6.png"
                    width={48}
                    height={48}
                    className="me-2 object-cover"
                    alt="KDSM Logo"
                  />
                <VariableProximity
                  label={"Password Generator"}
                  className={"sm:text-2xl text-lg"}
                  containerRef={containerRef}
                  radius={50}
                  falloff="linear"
                />
                <div className="ms-auto">
                  <ThemeToggle />
                </div>
              </div>
              <CardDescription>
                <VariableProximity
                  label={
                    "Generate secure passwords with customizable options using KDSM encryption"
                  }
                  className={"text-base"}
                  containerRef={containerRef}
                  radius={50}
                  falloff="linear"
                />
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Password Length */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Password Length</Label>
                  <span className="text-sm font-medium">
                    {formState.length[0]} characters
                  </span>
                </div>
                <Slider
                  value={formState.length}
                  onValueChange={handleLengthChange}
                  max={128}
                  min={4}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Character Options */}
              <div className="space-y-4">
                <Label>Character Types</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeUppercase"
                      checked={formState.includeUppercase}
                      onCheckedChange={(checked) =>
                        handleOptionChange("includeUppercase", checked)
                      }
                    />
                    <Label htmlFor="includeUppercase">Uppercase (A-Z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeLowercase"
                      checked={formState.includeLowercase}
                      onCheckedChange={(checked) =>
                        handleOptionChange("includeLowercase", checked)
                      }
                    />
                    <Label htmlFor="includeLowercase">Lowercase (a-z)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeNumbers"
                      checked={formState.includeNumbers}
                      onCheckedChange={(checked) =>
                        handleOptionChange("includeNumbers", checked)
                      }
                    />
                    <Label htmlFor="includeNumbers">Numbers (0-9)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSpecialChars"
                      checked={formState.includeSpecialChars}
                      onCheckedChange={(checked) =>
                        handleOptionChange("includeSpecialChars", checked)
                      }
                    />
                    <Label htmlFor="includeSpecialChars">
                      Special (!@#$%^&*())
                    </Label>
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <Label>Additional Options</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeSimilar"
                    checked={formState.excludeSimilar}
                    onCheckedChange={(checked) =>
                      handleOptionChange("excludeSimilar", checked)
                    }
                  />
                  <Label htmlFor="excludeSimilar">
                    Exclude similar characters (0, O, l, 1, I)
                  </Label>
                </div>
              </div>

              {/* Custom Characters */}
              <div className="space-y-2">
                <Label htmlFor="customChars">
                  Custom Characters (Optional)
                </Label>
                <Input
                  id="customChars"
                  placeholder="Enter custom characters to use instead of default sets"
                  value={formState.customChars}
                  onChange={(e) =>
                    handleOptionChange("customChars", e.target.value)
                  }
                />
                <span className="text-muted-foreground text-sm">
                  If provided, only these characters will be used (overrides
                  other options)
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 flex-row-reverse">
                <Button onClick={generatePassword} disabled={isGenerating}>
                  {isGenerating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Key className="w-5 h-5" />
                  )}
                  Generate Password
                </Button>
                <Button onClick={handleClear} variant="outline">
                  Clear
                  <BrushCleaning className="w-5 h-5" />
                </Button>
              </div>

              {/* Generated Password */}
              {formState.generatedPassword && (
                <div className="space-y-4 p-4 border rounded-md bg-muted/50">
                  <div className="flex justify-between items-center">
                    <Label>Generated Password</Label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${passwordStrength.color}`}
                      >
                        {passwordStrength.label}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePasswordVisibility}
                        title={
                          formState.showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {formState.showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formState.generatedPassword)
                        }
                      >
                        {copyState ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-background rounded border break-all font-mono">
                    {formState.showPassword
                      ? formState.generatedPassword
                      : "•".repeat(formState.generatedPassword.length)}
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>
                      Length: {formState.generatedPassword.length} characters
                    </span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>Strength: {passwordStrength.label}</span>
                    </div>
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
                  text="KDSM Password Generator by - Idris Vohra"
                  disabled={false}
                  speed={3}
                />
                <ShinyText
                  text="Secure • Customizable • Fast"
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
