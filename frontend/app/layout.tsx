import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./global.css";
import Providers from "../components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL = "https://editorpdf-christian-mayangas-projects.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "DocuFlow — Edita y convierte PDFs con IA",
    template: "%s | DocuFlow",
  },
  description: "La herramienta más rápida para editar texto, convertir formatos y mejorar documentos PDF con inteligencia artificial. Gratis, sin instalación.",
  keywords: ["editor PDF", "convertir PDF", "PDF online", "editar PDF", "convertir documentos", "DocuFlow"],
  authors: [{ name: "DocuFlow" }],
  creator: "DocuFlow",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: BASE_URL,
    siteName: "DocuFlow",
    title: "DocuFlow — Edita y convierte PDFs con IA",
    description: "La herramienta más rápida para editar texto, convertir formatos y mejorar documentos PDF con inteligencia artificial.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "DocuFlow — Editor PDF con IA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuFlow — Edita y convierte PDFs con IA",
    description: "La herramienta más rápida para editar y convertir PDFs. Gratis.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
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
