"use client";

import React from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DocsCodeBlock({ children }) {
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  return (
    <div className="relative bg-secondary rounded-lg p-4">
      <pre className="text-gray-100 text-sm overflow-x-auto">
        <code className="whitespace-pre-wrap break-words">
          {children}
        </code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
        onClick={() => copyToClipboard(children)}
      >
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}