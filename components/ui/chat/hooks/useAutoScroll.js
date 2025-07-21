import { useCallback, useEffect, useRef, useState } from "react";

export const useAutoScroll = ({ smooth = false, content }) => {
  const scrollRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, [smooth]);

  const checkIfAtBottom = () => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const threshold = 100; // pixels from bottom
      const atBottom =
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          scrollElement.clientHeight <
        threshold;
      setIsAtBottom(atBottom);
    }
  };

  const disableAutoScroll = () => {
    setAutoScrollEnabled(false);
    setTimeout(() => setAutoScrollEnabled(true), 1000);
  };

  useEffect(() => {
    if (autoScrollEnabled && isAtBottom) {
      scrollToBottom();
    }
  }, [content, autoScrollEnabled, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkIfAtBottom);
      return () => scrollElement.removeEventListener("scroll", checkIfAtBottom);
    }
  }, []);

  return {
    scrollRef,
    isAtBottom,
    autoScrollEnabled,
    scrollToBottom,
    disableAutoScroll,
  };
};
