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
      <main className="py-10 md:py-14 bg-white">{children}</main>
      <Footer />        {/* usa tu footer actual */}
      <PrivacyBar />    {/* si tu footer ya incluye privacy, elimina esta línea */}
    </>
  );
}
