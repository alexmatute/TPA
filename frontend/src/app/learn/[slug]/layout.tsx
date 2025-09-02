import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PrivacyBar from "@/components/privacy";
import type { ReactNode } from "react";

// app/learn/[slug]/layout.tsx
export default function LearnPostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="py-10 md:py-14 bg-white">{children}</main>
      <Footer />
      <PrivacyBar />
    </>
  );
}
