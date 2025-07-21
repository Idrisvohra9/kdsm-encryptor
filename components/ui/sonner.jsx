"use client"

import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {

  return (
    <Sonner
      theme={"dark"}
      className="toaster group"
      closeButton={true}
      richColors={true}
      
      {...props} />
  );
}

export { Toaster }
