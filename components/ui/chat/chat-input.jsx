import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

const ChatInput = React.forwardRef(
  ({ className, onSend, onTyping, disabled, placeholder, ...props }, ref) => {
    const [message, setMessage] = React.useState("");
    const [isTyping, setIsTyping] = React.useState(false);
    const typingTimeoutRef = React.useRef(null);

    const handleInputChange = (e) => {
      const value = e.target.value;
      setMessage(value);

      // Handle typing indicators
      if (onTyping && !isTyping && value.trim()) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      if (value.trim()) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          if (onTyping) onTyping(false);
        }, 1000);
      } else {
        setIsTyping(false);
        if (onTyping) onTyping(false);
      }
    };

    const handleSend = () => {
      if (!message.trim() || disabled) return;
      
      if (onSend) {
        onSend(message.trim());
        setMessage("");
        
        // Stop typing
        if (isTyping) {
          setIsTyping(false);
          if (onTyping) onTyping(false);
        }
        
        // Clear timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className="flex gap-2 items-center mx-5 mb-5 sticky bottom-5 z-10 ">
        <Textarea
          autoComplete="off"
          ref={ref}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || "Type your message..."}
          disabled={disabled}
          className={cn(
            "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-full flex items-center h-16 resize-none",
            className,
          )}
          {...props}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0 rounded-full"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    );
  },
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
