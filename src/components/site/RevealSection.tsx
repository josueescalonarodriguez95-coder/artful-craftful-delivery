import { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

export const RevealSection = ({ children }: { children: ReactNode }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
};
