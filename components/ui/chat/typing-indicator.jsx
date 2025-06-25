import MessageLoading from "./message-loading";
import { ChatBubble, ChatBubbleMessage } from "./chat-bubble";

export default function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].username} is typing`;
    } else if (users.length === 2) {
      return `${users[0].username} and ${users[1].username} are typing`;
    } else {
      return `${users[0].username} and ${users.length - 1} others are typing`;
    }
  };

  return (
    <ChatBubble variant="received">
      <ChatBubbleMessage variant="received" isLoading={true}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MessageLoading />
          {getTypingText()}
        </div>
      </ChatBubbleMessage>
    </ChatBubble>
  );
}