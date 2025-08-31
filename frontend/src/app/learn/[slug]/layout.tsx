import Footer from "@/components/Footer"
// ⬇️ AJUSTA estas rutas a tus componentes reales
import Navbar from "@/components/Navbar"
import PrivacyBar from "@/components/privacy"
// app/learn/[slug]/layout.tsx
import type { ReactNode } from "react"

// tu navbar actual con menú fetch
             // tu footer actual
     // tu barra/aviso de privacidad (o quítalo si ya va dentro del Footer)

export default function LearnPostLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />        {/* usa tu menú actual (con su fetch interno si aplica) */}
      <main className="mx-auto max-w-5xl px-4 pb-20">{children}</main>
      <PrivacyBar />    {/* si tu footer ya incluye privacy, elimina esta línea */}
      <Footer />        {/* usa tu footer actual */}
    </>
  );
}
