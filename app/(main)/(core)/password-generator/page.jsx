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
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { generateKey } from "@/utils/kdsm";
import VariableProximity from "@/components/ui/VariableProximity";
import ShinyText from "@/components/ui/ShinyText";
import Image from "next/image";
import {
  BrushCleaning,
  Check,
  Copy,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";
import FlowingMenu from "@/components/ui/FlowingMenu";
import TextType from "@/components/ui/TextType";
import Link from "next/link";
import UpdatesAccordion from "@/components/UpdatesAccordion";
import SteelSwitch from "@/components/ui/SteelSwitch";
import SavePasswordPopover from "@/components/SavePassPopover";
import { Separator } from "@/components/ui/separator";
// Todo: Secure vault for storing generated passwords with encryption and the ability to export/import securely with the key being the answer to a security question.

const COPY_TIMEOUT = 2000;

export default function PasswordGenerator() {
  const [formState, setFormState] = useState({
    length: [9],
    includeNumbers: true,
    includeSpecialChars: true,
    includeUppercase: true,
    includeLowercase: true,
    excludeSimilar: false,
    useCustomWord: false,
    useReadablePassword: false,
    customWorded: "",
    generatedPassword: "",
    showPassword: false,
  });
  const [copyState, setCopyState] = useState(false);
  const containerRef = useRef(null);

  const handleOptionChange = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []); // Empty deps - function doesn't depend on external values

  const handleLengthChange = useCallback((value) => {
    setFormState((prev) => ({ ...prev, length: value }));
  }, []); // Empty deps - function doesn't depend on external values

  const generatePassword = useCallback(async () => {
    const {
      length,
      includeNumbers,
      includeSpecialChars,
      includeUppercase,
      includeLowercase,
      excludeSimilar,
      useCustomWord,
      useReadablePassword,
      customWorded,
    } = formState;

    // Early validation checks
    if (
      !customWorded &&
      !useReadablePassword &&
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

    if (useCustomWord && !customWorded) {
      toast.error("Custom Word Required", {
        description:
          "Please enter a custom word or disable the custom word option",
      });
      return;
    }

    try {
      // Create options object with minimal overhead
      const options = {
        includeNumbers,
        includeSpecialChars,
        includeUppercase,
        includeLowercase,
        excludeSimilar,
        customWorded: useCustomWord && customWorded ? customWorded : undefined,
        useReadablePassword,
      };

      const password = await generateKey(length[0], options);

      // Batch state update
      setFormState((prev) => ({ ...prev, generatedPassword: password }));

      toast.success("Password Generated", {
        description: `A ${length[0]}-character password has been generated successfully`,
      });
    } catch (error) {
      console.error("Password generation error:", error);
      toast.error("Generation Failed", {
        description:
          error?.message || "An error occurred while generating the password",
      });
    }
  }, [formState]); // formState is the only dependency

  const copyToClipboard = useCallback((text) => {
    let timeoutId;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyState(true);
        timeoutId = setTimeout(() => {
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

    // Cleanup function to prevent memory leaks
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []); // Empty deps - stable reference

  const handleClear = useCallback(() => {
    setFormState((prev) => ({
      ...prev,
      generatedPassword: "",
      customWorded: "",
      useCustomWord: false,
      useReadablePassword: false,
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
    if (!password) {
      return {
        strength: 0,
        label: "No password",
        color: "text-muted-foreground",
      };
    }

    // Optimized strength calculation with single pass - O(n)
    let score = 0;
    const len = password.length;
    let hasLower = false,
      hasUpper = false,
      hasNumber = false,
      hasSpecial = false;

    if (len >= 8) score += 1;
    if (len >= 12) score += 1;

    // Single pass through string instead of multiple regex tests
    for (let i = 0; i < len; i++) {
      const code = password.charCodeAt(i);
      if (code >= 97 && code <= 122) hasLower = true;
      else if (code >= 65 && code <= 90) hasUpper = true;
      else if (code >= 48 && code <= 57) hasNumber = true;
      else hasSpecial = true;
    }

    if (hasLower) score += 1;
    if (hasUpper) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    if (score <= 2)
      return { strength: score, label: "Weak", color: "text-red-500" };
    if (score <= 4)
      return { strength: score, label: "Medium", color: "text-yellow-500" };
    return { strength: score, label: "Strong", color: "text-green-500" };
  }, []); // No dependencies - pure function

  // Memoize password strength calculation to prevent unnecessary recalculations
  const passwordStrength = useMemo(
    () => getPasswordStrength(formState.generatedPassword),
    [formState.generatedPassword, getPasswordStrength]
  );

  return (
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
              src="/icons/pass.webp"
              width={86}
              height={86}
              className="me-2 object-cover w-16 h-16 sm:w-20 sm:h-20 md:w-[86px] md:h-[86px] pointer-events-none"
              alt="KDSM Logo"
            />
            <div
              ref={containerRef}
              className="flex-1 flex flex-col text-center sm:text-left space-y-2 sm:space-y-4"
            >
              <VariableProximity
                label={"Password Generator"}
                className="text-lg sm:text-xl md:text-2xl"
                containerRef={containerRef}
                radius={50}
                falloff="linear"
              />
              <CardDescription>
                <VariableProximity
                  label={
                    "Generate secure passwords with customizable options using KDSM encryption"
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
            {/* Password Length */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm sm:text-base">Password Length</Label>
                <span className="text-xs sm:text-sm font-medium">
                  {formState.length[0]} characters
                </span>
              </div>
              <Slider
                value={formState.length}
                onValueChange={handleLengthChange}
                max={30}
                min={6}
                step={1}
                className="w-full"
              />
            </div>

            <Separator className="my-4" />

            {/* Character Options */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <Label className="text-sm sm:text-base">Character Types</Label>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Select all of them for best results!
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 font-tomorrow">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeUppercase"
                    checked={formState.includeUppercase}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeUppercase", checked)
                    }
                  />
                  <Label
                    htmlFor="includeUppercase"
                    className="text-xs sm:text-sm"
                  >
                    Uppercase (A-Z)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeLowercase"
                    checked={formState.includeLowercase}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeLowercase", checked)
                    }
                  />
                  <Label
                    htmlFor="includeLowercase"
                    className="text-xs sm:text-sm"
                  >
                    Lowercase (a-z)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeNumbers"
                    checked={formState.includeNumbers}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeNumbers", checked)
                    }
                  />
                  <Label
                    htmlFor="includeNumbers"
                    className="text-xs sm:text-sm"
                  >
                    Numbers (0-9)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSpecialChars"
                    checked={formState.includeSpecialChars}
                    onCheckedChange={(checked) =>
                      handleOptionChange("includeSpecialChars", checked)
                    }
                  />
                  <Label
                    htmlFor="includeSpecialChars"
                    className="text-xs sm:text-sm"
                  >
                    Special (!@#$%^&*())
                  </Label>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Additional Options */}
            <div className="space-y-3 sm:space-y-4">
              <Label className="text-sm sm:text-base">Additional Options</Label>
              <div className="space-y-3 font-tomorrow">
                <div className="flex items-center space-x-2">
                  <SteelSwitch
                    id="excludeSimilar"
                    checked={formState.excludeSimilar}
                    onCheckedChange={(checked) =>
                      handleOptionChange("excludeSimilar", checked)
                    }
                  />
                  <Label
                    htmlFor="excludeSimilar"
                    className="text-xs sm:text-sm"
                  >
                    Exclude similar characters (0, O, l, 1, I)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <SteelSwitch
                    id="useCustomWord"
                    checked={formState.useCustomWord}
                    onCheckedChange={(checked) => {
                      handleOptionChange("useCustomWord", checked);
                      if (checked) {
                        handleOptionChange("useReadablePassword", false);
                      }
                    }}
                  />
                  <Label htmlFor="useCustomWord" className="text-xs sm:text-sm">
                    Use custom word (3-14 characters)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <SteelSwitch
                    id="useReadablePassword"
                    checked={formState.useReadablePassword}
                    onCheckedChange={(checked) => {
                      handleOptionChange("useReadablePassword", checked);
                      if (checked) {
                        handleOptionChange("useCustomWord", false);
                        handleOptionChange("customWorded", "");
                      }
                    }}
                  />
                  <Label
                    htmlFor="useReadablePassword"
                    className="text-xs sm:text-sm"
                  >
                    Generate readable password (uses random word)
                  </Label>
                </div>
              </div>
            </div>

            {/* Custom Worded Input - Only show when useCustomWord is enabled */}
            {formState.useCustomWord && (
              <div className="space-y-2">
                <Label htmlFor="customWorded" className="text-sm sm:text-base">
                  Custom Word
                </Label>
                <Input
                  id="customWorded"
                  placeholder="Enter a custom word (3-14 characters)"
                  minLength={3}
                  maxLength={14}
                  value={formState.customWorded}
                  onChange={(e) =>
                    handleOptionChange("customWorded", e.target.value)
                  }
                  className="text-sm"
                />
                <span className="text-muted-foreground text-xs sm:text-sm">
                  This word will start your password and be followed by complex
                  characters
                </span>
              </div>
            )}

            <Separator className="my-4" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                onClick={generatePassword}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                <Key className="w-4 h-4 sm:w-5 sm:h-5" />
                Generate Password
              </Button>

              <Button
                onClick={handleClear}
                variant="outline"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Clear
                <BrushCleaning className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
            {/* Generated Password */}
            {formState.generatedPassword && (
              <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 border rounded-md bg-muted/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <Label className="text-sm sm:text-base">
                    Generated Password
                  </Label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs sm:text-sm font-medium ${passwordStrength.color}`}
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
                        <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
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
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-2 sm:p-3 bg-background rounded border break-all font-mono text-xs sm:text-sm">
                  {formState.showPassword
                    ? formState.generatedPassword
                    : "•".repeat(formState.generatedPassword.length)}
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span>
                    Length: {formState.generatedPassword.length} characters
                  </span>
                  <SavePasswordPopover password={formState.generatedPassword}/>
                </div>
              </div>
            )}
          </CardContent>

          <Separator />

          <UpdatesAccordion />

          <Separator />

          <Link
            className="border-primary/20 p-4 rounded-md text-center text-xl text-accent"
            href={"/docs#free-password-generation-api"}
            target="_blank"
          >
            <TextType
              text={[
                "Give the power to your projects to generate secure passwords []~(￣▽￣)~*",
                "For your projects with KDSM Password Generator!",
                "Happy coding!",
                "Enjoy free and secure password generation API!",
                "KDSM Encryptor - Your go-to for secure encryption!",
                "Ease of setup and use, no API key required!",
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
            />
          </Link>

          <Separator />

          <div>
            <FlowingMenu />
          </div>
          <CardFooter className="flex-col">
            <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-muted-foreground w-full gap-2 sm:gap-0 mt-8">
              <ShinyText
                text="KDSM Password Generator by - Idris Vohra"
                disabled={false}
                speed={3}
                className="text-center"
                link
              />
              <ShinyText
                text="Secure • Customizable • Fast"
                disabled={false}
                speed={3}
                className="text-center"
              />
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
