import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageLoading from "./message-loading";
import { Eye, EyeOff, Shield, AlertTriangle, Lock } from "lucide-react";

// ChatBubble
const chatBubbleVariant = cva(
  "flex gap-2 max-w-[60%] items-end relative group",
  {
    variants: {
      variant: {
        received: "self-start",
        sent: "self-end flex-row-reverse",
      },
      layout: {
        default: "",
        ai: "max-w-full w-full items-center",
      },
    },
    defaultVariants: {
      variant: "received",
      layout: "default",
    },
  }
);

const ChatBubble = React.forwardRef(
  ({ className, variant, layout, children, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleVariant({ variant, layout, className }),
        "relative group"
      )}
      ref={ref}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && typeof child.type !== "string"
          ? React.cloneElement(child, {
              variant,
              layout,
            })
          : child
      )}
    </div>
  )
);
ChatBubble.displayName = "ChatBubble";

// ChatBubbleAvatar
const ChatBubbleAvatar = ({ src, fallback, className }) => (
  <Avatar className={className}>
    <AvatarImage src={src} alt="Avatar" />
    <AvatarFallback>{fallback}</AvatarFallback>
  </Avatar>
);

// ChatBubbleMessage - Enhanced for encryption with custom styled controls
const chatBubbleMessageVariants = cva("p-4 relative", {
  variants: {
    variant: {
      received:
        "bg-secondary text-secondary-foreground rounded-r-lg rounded-tl-lg",
      sent: "bg-primary text-primary-foreground rounded-l-lg rounded-tr-lg",
    },
    layout: {
      default: "",
      ai: "border-t w-full rounded-none bg-transparent",
    },
  },
  defaultVariants: {
    variant: "received",
    layout: "default",
  },
});

const ChatBubbleMessage = React.forwardRef(
  (
    {
      className,
      variant,
      layout,
      isLoading = false,
      children,
      encrypted = false,
      encryptedContent,
      onDecrypt,
      isDecrypted = false,
      decryptError = false,
      autoDecrypt = false,
      ...props
    },
    ref
  ) => {
    const [showDecrypted, setShowDecrypted] = React.useState(
      isDecrypted || autoDecrypt
    );
    const [isDecrypting, setIsDecrypting] = React.useState(false);

    // Handle decryption process with error handling
    const handleDecrypt = React.useCallback(async () => {
      if (!onDecrypt) return;

      setIsDecrypting(true);
      try {
        await onDecrypt();
        setShowDecrypted(true);
      } catch (error) {
        console.error("Decryption failed:", error);
      } finally {
        setIsDecrypting(false);
      }
    }, [onDecrypt]);

    // Toggle between encrypted and decrypted view
    const toggleDecryption = React.useCallback(() => {
      if (showDecrypted) {
        setShowDecrypted(false);
      } else {
        handleDecrypt();
      }
    }, [showDecrypted, handleDecrypt]);

    // Memoized custom button styles for better performance
    const customButtonStyles = React.useMemo(() => ({
      base: "absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95",
      sent: "left-1 bg-secondary/80 hover:bg-secondary text-secondary-foreground shadow-sm",
      received: "right-1 bg-primary/80 hover:bg-primary text-primary-foreground shadow-sm",
      disabled: "opacity-50 cursor-not-allowed hover:scale-100",
      error: "bg-destructive/80 hover:bg-destructive text-destructive-foreground"
    }), []);

    if (isLoading) {
      return (
        <div
          className={cn(
            chatBubbleMessageVariants({ variant, layout, className }),
            "break-words max-w-full whitespace-pre-wrap"
          )}
          ref={ref}
          {...props}
        >
          <div className="flex items-center space-x-2">
            <MessageLoading />
          </div>
        </div>
      );
    }

    if (encrypted) {
      return (
        <div
          className={cn(
            chatBubbleMessageVariants({ variant, layout, className }),
            "break-words max-w-full whitespace-pre-wrap"
          )}
          ref={ref}
          {...props}
        >
          {showDecrypted ? (
            <div className="space-y-2">
              <div className="font-mono text-xs break-all pr-6">{children}</div>
              <div
                className={cn(
                  customButtonStyles.base,
                  variant === "sent" ? customButtonStyles.sent : customButtonStyles.received
                )}
                onClick={() => setShowDecrypted(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setShowDecrypted(false);
                  }
                }}
                aria-label="Hide decrypted message"
              >
                <EyeOff className="h-2.5 w-2.5" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="font-mono text-xs break-all pr-6">
                {encryptedContent}
              </div>
              {decryptError ? (
                <div className="flex items-center gap-2 text-destructive text-xs">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Failed to decrypt
                </div>
              ) : (
                <div
                  className={cn(
                    customButtonStyles.base,
                    variant === "sent" ? customButtonStyles.sent : customButtonStyles.received,
                    isDecrypting && customButtonStyles.disabled
                  )}
                  onClick={isDecrypting ? undefined : toggleDecryption}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isDecrypting) {
                      toggleDecryption();
                    }
                  }}
                  aria-label={isDecrypting ? "Decrypting message" : "Show decrypted message"}
                >
                  {isDecrypting ? (
                    <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Eye className="h-2.5 w-2.5" />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          chatBubbleMessageVariants({ variant, layout, className }),
          "break-words max-w-full whitespace-pre-wrap"
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ChatBubbleTimestamp
const ChatBubbleTimestamp = ({ timestamp, className, ...props }) => (
  <div className={cn("text-xs mt-2 text-right", className)} {...props}>
    {timestamp}
  </div>
);

// ChatBubbleAction - Updated with custom styling
const ChatBubbleAction = React.forwardRef(
  ({ icon, onClick, className, variant = "ghost", size = "icon", ...props }, ref) => {
    // Memoized custom action button styles
    const actionStyles = React.useMemo(() => ({
      base: "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95",
      ghost: "bg-background/80 hover:bg-background text-foreground shadow-sm border border-border/50",
      primary: "bg-primary/80 hover:bg-primary text-primary-foreground shadow-sm",
      secondary: "bg-secondary/80 hover:bg-secondary text-secondary-foreground shadow-sm"
    }), []);

    return (
      <div
        ref={ref}
        className={cn(
          actionStyles.base,
          variant === "ghost" ? actionStyles.ghost : 
          variant === "primary" ? actionStyles.primary : actionStyles.secondary,
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && onClick) {
            onClick();
          }
        }}
        {...props}
      >
        {React.cloneElement(icon, { className: "h-3 w-3" })}
      </div>
    );
  }
);
ChatBubbleAction.displayName = "ChatBubbleAction";

const ChatBubbleActionWrapper = React.forwardRef(
  ({ variant, className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        variant === "sent"
          ? "-left-1 -translate-x-full flex-row-reverse"
          : "-right-1 translate-x-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
ChatBubbleActionWrapper.displayName = "ChatBubbleActionWrapper";

export {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
  chatBubbleVariant,
  chatBubbleMessageVariants,
  ChatBubbleAction,
  ChatBubbleActionWrapper,
};
