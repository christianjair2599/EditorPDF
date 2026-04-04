import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./global.css";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "DocuFlow — Edita y convierte PDFs con IA",
  description: "La herramienta más rápida para editar texto, convertir formatos y mejorar documentos PDF con inteligencia artificial.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body suppressHydrationWarning className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
