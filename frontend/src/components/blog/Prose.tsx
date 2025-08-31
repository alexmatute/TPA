// components/blog/Prose.tsx
import { ReactNode } from "react";

export default function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="prose prose-neutral max-w-none">
      {children}
    </div>
  );
}
