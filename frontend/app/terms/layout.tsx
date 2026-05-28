import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Condiciones de uso del servicio DocuFlow. Conoce tus derechos y obligaciones al usar nuestra plataforma.",
  openGraph: { title: "Términos y Condiciones | DocuFlow", url: "/terms" },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
