import { Dock } from "@/components/Dock";

export default function layout({ children }) {
  return (
    <>
      {children}
      <Dock />
    </>
  );
}
