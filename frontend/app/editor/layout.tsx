import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editor de PDF",
  description: "Edita texto, fuentes y colores de cualquier PDF directamente en el navegador. Sin instalación. Con mejora de texto por IA.",
  openGraph: {
    title: "Editor de PDF | DocuFlow",
    description: "Edita texto, fuentes y colores de cualquier PDF. Con IA integrada.",
    url: "/editor",
  },
};

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
