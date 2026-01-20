import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useAuthStore from "@/store/authStore";
import { Check, Key, PencilLineIcon } from "lucide-react";
import Link from "next/link";
import { SocialIcon } from "react-social-icons";
import { socialIcons } from "@/utils/constants";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export default function SavePasswordPopover({ password = "" }) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const [form, setForm] = useState({
    platformName: null,
    email: user?.email || "",
    password: password,
    username: user?.name || "",
  });

  // Update form password when the password prop changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, password: password }));
  }, [password]);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(true);
  const [platformInput, setPlatformInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleSavePassword() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/saved-passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitting(false);
        toast.success(
          `Password saved successfully for ${data.data.platformName?.toUpperCase()}!`,
          {
            description: "You can view it in your profile.",
          }
        );
      } else {
        toast.error("Oopsie!", {
          description: data.error || "Failed to save password",
        });
        setSubmitting(false);
      }
    } catch (error) {
      toast.error("Oopsie!", {
        description:
          error.message || "An error occurred while saving the password.",
      });
      setSubmitting(false);
    }
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button disabled={submitting}>
          {submitting ? "Saving Password..." : "Save Password"}{" "}
          <Key className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {!loading && !user ? (
          <div className="text-sm text-center text-red-600">
            Please log in to save passwords.
            <Link href="/auth/login" className="text-blue-600 underline ml-1">
              Login
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 font-tomorrow text-sm">
            <div className="space-x-2 flex items-center">
              <div className="leading-none">Email:</div>
              {editingEmail ? (
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter email"
                />
              ) : (
                <p className="text-muted-foreground">{form.email}</p>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={() => setEditingEmail(!editingEmail)}
              >
                {editingEmail ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <PencilLineIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
            <div className="space-x-2 flex items-center">
              <div className="leading-none">Username:</div>
              {editingUsername ? (
                <Input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  placeholder="Enter username"
                />
              ) : (
                <p className="text-muted-foreground">{form.username}</p>
              )}
              <Button
                variant="link"
                size="sm"
                onClick={() => setEditingUsername(!editingUsername)}
              >
                {editingUsername ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <PencilLineIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
            {editingPlatform ? (
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Choose a platform..."
                  displayCancel={form.platformName !== null}
                  onCancel={() => setEditingPlatform(false)}
                  value={platformInput}
                  onValueChange={(value) => setPlatformInput(value)}
                />
                <CommandList>
                  <CommandEmpty>No platform found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    {platformInput.trim() &&
                      !socialIcons.some((icon) =>
                        icon.toLowerCase().includes(platformInput.toLowerCase())
                      ) && (
                        <CommandItem
                          key="custom-platform"
                          onClick={() => {
                            setForm({
                              ...form,
                              platformName: platformInput.trim(),
                            });
                            setEditingPlatform(false);
                          }}
                        >
                          <div className="size-12 flex justify-center items-center font-bold rounded-full bg-primary text-primary-foreground mr-2">
                            {platformInput.charAt(0).toUpperCase()}
                          </div>
                          {platformInput.charAt(0).toUpperCase() +
                            platformInput.slice(1)}
                        </CommandItem>
                      )}
                    {socialIcons
                      .filter(
                        (icon) =>
                          !platformInput.trim() ||
                          icon
                            .toLowerCase()
                            .includes(platformInput.toLowerCase())
                      )
                      .map((icon) => (
                        <CommandItem
                          key={icon}
                          onClick={() => {
                            setForm({ ...form, platformName: icon });
                            setEditingPlatform(false);
                          }}
                          selected={icon === form.platformName}
                        >
                          <SocialIcon network={icon} />
                          {icon.charAt(0).toUpperCase() + icon.slice(1)}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            ) : (
              <div className="space-x-2 flex items-center">
                <div className="leading-none">Platform:</div>
                <p className="text-muted-foreground uppercase">{form.platformName}</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setEditingPlatform(!editingPlatform)}
                >
                  {editingPlatform ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <PencilLineIcon className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
            <Separator />

            <div className="space-x-2 flex items-center">
              <div className="leading-none">Password:</div>
              <p className="text-muted-foreground break-all">{form.password}</p>
            </div>
            {submitting && (
              <p className="text-xs text-muted-foreground text-center">
                Your password will be stored encrypted only you will be able to
                access it using the answer to your security question.
              </p>
            )}
            <Button
              disabled={
                !form.platformName ||
                !form.email ||
                !form.password ||
                !form.username ||
                submitting
              }
              className="w-full"
              onClick={handleSavePassword}
            >
              {submitting ? "Saving Password..." : "Save Password"}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
