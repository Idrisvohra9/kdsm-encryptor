import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FilesIcon, Images, Plus, Send, Sticker } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { forwardRef, useRef, useState } from "react";
import { KAOMOJIS } from "@/utils/constants";

const ChatInput = forwardRef(
  ({ className, onSend, onTyping, disabled, placeholder, ...props }, ref) => {
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

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

    const handleKaomojiSelect = (kaomoji) => {
      setMessage((prev) => prev + kaomoji);
    };

    return (
      <div className="flex gap-2 items-center px-5 sticky bottom-0 z-10 bg-gradient-to-t from-background/75 to-transparent py-5 rounded-xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"icon"} className="p-2">
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start">
            <DropdownMenuItem>
              <FilesIcon className="mr-2 h-4 w-4" />
              Documents
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Images className="mr-2 h-4 w-4" />
              Photos & Videos
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"icon"} className="p-2">
              <Sticker className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[600px] max-h-96 overflow-y-auto"
            align="start"
          >
            <div className="p-2">
              <div className="grid grid-cols-6 gap-1">
                {KAOMOJIS.map((kaomoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleKaomojiSelect(kaomoji)}
                    className="p-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center min-h-[2rem] flex items-center justify-center"
                    title={kaomoji}
                  >
                    {kaomoji}
                  </button>
                ))}
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Textarea
          autoComplete="off"
          ref={ref}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || "Type your message..."}
          disabled={disabled}
          className={cn(
            "max-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-full flex items-center h-16 resize-none font-tomorrow",
            className
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
  }
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
