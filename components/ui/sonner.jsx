"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      closeButton={true}
      richColors={true}
      // Removed the generic style prop
      // toastOptions={{ // Added toastOptions for type-specific styling
      //   success: {
      //     style: {
      //       background: 'var(--success-background, #d4edda)', // Example success background
      //       color: 'var(--success-text, #155724)', // Example success text color
      //       border: 'var(--success-border, #c3e6cb)', // Example success border color
      //     },
      //   },
      //   error: {
      //     style: {
      //       background: 'var(--error-background, #f8d7da)', // Example error background
      //       color: 'var(--error-text, #721c24)', // Example error text color
      //       border: 'var(--error-border, #f5c6cb)', // Example error border color
      //     },
      //   },
      //   warning: {
      //     style: {
      //       background: 'var(--warning-background, #fff3cd)', // Example warning background
      //       color: 'var(--warning-text, #856404)', // Example warning text color
      //       border: 'var(--warning-border, #ffeeba)', // Example warning border color
      //     },
      //   },
      //   info: {
      //     style: {
      //       background: 'var(--info-background, #d1ecf1)', // Example info background
      //       color: 'var(--info-text, #0c5460)', // Example info text color
      //       border: 'var(--info-border, #bee5eb)', // Example info border color
      //     },
      //   },
      //   // Default style for toasts without a specific type
      //   // You can keep the original style here or define a new one
      //   default: {
      //      style: {
      //        background: "var(--popover)",
      //        color: "var(--popover-foreground)",
      //        border: "var(--border)"
      //      }
      //   }
      // }}
      {...props} />)
  );
}

export { Toaster }
