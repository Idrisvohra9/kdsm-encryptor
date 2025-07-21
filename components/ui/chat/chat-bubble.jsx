import { useState, useCallback, Children, forwardRef, useMemo, isValidElement, useEffect, useRef, cloneElement } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MessageLoading from "./message-loading";
import { Eye, EyeOff, AlertTriangle, Timer } from "lucide-react";

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

const ChatBubble = forwardRef(
  ({ className, variant, layout, children, ...props }, ref) => (
    <div
      className={cn(
        chatBubbleVariant({ variant, layout, className }),
        "relative group"
      )}
      ref={ref}
      {...props}
    >
      {Children.map(children, (child) =>
        isValidElement(child) && typeof child.type !== "string"
          ? cloneElement(child, {
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

// ChatBubbleMessage - Enhanced for encryption with auto-encryption feature
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

const ChatBubbleMessage = forwardRef(
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
      autoEncryptEnabled = false,
      onHideDecrypted,
      ...props
    },
    ref
  ) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    
    // Refs for cleanup
    const autoEncryptTimerRef = useRef(null);
    const countdownTimerRef = useRef(null);

    // Calculate word count and auto-encryption duration
    const autoEncryptDuration = useMemo(() => {
      if (!children || typeof children !== 'string') return 0;
      const wordCount = children.trim().split(/\s+/).length;
      return wordCount * 1000; // 1 second per word
    }, [children]);

    // Clear all timers on component unmount
    useEffect(() => {
      return () => {
        if (autoEncryptTimerRef.current) {
          clearTimeout(autoEncryptTimerRef.current);
        }
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }
      };
    }, []);

    // Start auto-encryption timer - only when autoDecrypt is false and autoEncryptEnabled is true
    const startAutoEncryptTimer = useCallback(() => {
      // Only start timer if autoDecrypt is false, autoEncryptEnabled is true, and message is encrypted
      if (autoDecrypt || !autoEncryptEnabled || !encrypted || !isDecrypted) return;

      // Clear existing timers
      if (autoEncryptTimerRef.current) {
        clearTimeout(autoEncryptTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      // Set initial countdown time
      setTimeRemaining(Math.ceil(autoEncryptDuration / 1000));
      setIsCountingDown(true);

      // Start countdown display
      countdownTimerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsCountingDown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start auto-encryption timer
      autoEncryptTimerRef.current = setTimeout(() => {
        if (onHideDecrypted) {
          onHideDecrypted();
        }
        setIsCountingDown(false);
        setTimeRemaining(0);
      }, autoEncryptDuration);
    }, [autoEncryptDuration, autoDecrypt, autoEncryptEnabled, encrypted, isDecrypted, onHideDecrypted]);

    // Stop auto-encryption timer
    const stopAutoEncryptTimer = useCallback(() => {
      if (autoEncryptTimerRef.current) {
        clearTimeout(autoEncryptTimerRef.current);
        autoEncryptTimerRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setIsCountingDown(false);
      setTimeRemaining(0);
    }, []);

    // Start timer when message becomes decrypted (only if conditions are met)
    useEffect(() => {
      if (isDecrypted && !autoDecrypt && autoEncryptEnabled && encrypted) {
        startAutoEncryptTimer();
      } else {
        stopAutoEncryptTimer();
      }
    }, [isDecrypted, autoDecrypt, autoEncryptEnabled, encrypted, startAutoEncryptTimer, stopAutoEncryptTimer]);

    // Handle hide decrypted message
    const handleHideDecrypted = useCallback(() => {
      if (onHideDecrypted) {
        onHideDecrypted();
      }
      stopAutoEncryptTimer();
    }, [onHideDecrypted, stopAutoEncryptTimer]);

    // Handle show decrypted message - always go through modal
    const handleShowDecrypted = useCallback(() => {
      if (onDecrypt) {
        onDecrypt();
      }
    }, [onDecrypt]);

    // Memoized custom button styles for better performance
    const customButtonStyles = useMemo(
      () => ({
        base: "absolute w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95",
        sent: "left-1 bg-secondary/80 hover:bg-secondary text-secondary-foreground shadow-sm",
        received:
          "right-1 bg-primary/80 hover:bg-primary text-primary-foreground shadow-sm",
        disabled: "opacity-50 cursor-not-allowed hover:scale-100",
        error:
          "bg-destructive/80 hover:bg-destructive text-destructive-foreground",
        timer: "w-8 h-5 rounded-md bg-warning/80 text-warning-foreground text-xs font-mono flex items-center justify-center",
      }),
      []
    );

    // Memoized countdown display component - only show when conditions are met
    const CountdownDisplay = useMemo(() => {
      if (!isCountingDown || timeRemaining <= 0 || autoDecrypt || !autoEncryptEnabled) return null;

      return (
        <div
          className={cn(
            customButtonStyles.timer,
            variant === "sent" ? "left-1" : "right-1"
          )}
          title={`Message will auto-encrypt in ${timeRemaining} seconds`}
        >
          <Timer className="h-2 w-2 mr-1" />
          {timeRemaining}
        </div>
      );
    }, [isCountingDown, timeRemaining, autoDecrypt, autoEncryptEnabled, customButtonStyles.timer, variant]);

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
          {isDecrypted ? (
            <div className="space-y-2">
              <div className="font-mono text-xs break-all pr-6">{children}</div>
              <div className="flex items-center gap-2">
                {/* Countdown Timer Display - only show when not autoDecrypt and autoEncryptEnabled */}
                {CountdownDisplay}
                {/* Hide/Encrypt Button */}
                <div
                  className={cn(
                    customButtonStyles.base,
                    variant === "sent"
                      ? customButtonStyles.sent
                      : customButtonStyles.received
                  )}
                  onClick={handleHideDecrypted}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleHideDecrypted();
                    }
                  }}
                  aria-label="Hide decrypted message"
                >
                  <EyeOff className="h-2.5 w-2.5" />
                </div>
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
                    variant === "sent"
                      ? customButtonStyles.sent
                      : customButtonStyles.received
                  )}
                  onClick={handleShowDecrypted}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleShowDecrypted();
                    }
                  }}
                  aria-label="Show decrypted message"
                >
                  <Eye className="h-2.5 w-2.5" />
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
const ChatBubbleAction = forwardRef(
  (
    { icon, onClick, className, variant = "ghost", size = "icon", ...props },
    ref
  ) => {
    // Memoized custom action button styles
    const actionStyles = useMemo(
      () => ({
        base: "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95",
        ghost:
          "bg-background/80 hover:bg-background text-foreground shadow-sm border border-border/50",
        primary:
          "bg-primary/80 hover:bg-primary text-primary-foreground shadow-sm",
        secondary:
          "bg-secondary/80 hover:bg-secondary text-secondary-foreground shadow-sm",
      }),
      []
    );

    return (
      <div
        ref={ref}
        className={cn(
          actionStyles.base,
          variant === "ghost"
            ? actionStyles.ghost
            : variant === "primary"
            ? actionStyles.primary
            : actionStyles.secondary,
          className
        )}
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && onClick) {
            onClick();
          }
        }}
        {...props}
      >
        {cloneElement(icon, { className: "h-3 w-3" })}
      </div>
    );
  }
);
ChatBubbleAction.displayName = "ChatBubbleAction";

const ChatBubbleActionWrapper = forwardRef(
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
