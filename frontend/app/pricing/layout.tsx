import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes y Precios",
  description: "Empieza gratis con 4 operaciones diarias o activa Premium para acceso ilimitado, OCR, IA y más. Sin tarjeta de crédito.",
  openGraph: {
    title: "Planes y Precios | DocuFlow",
    description: "Plan gratuito y Premium para edición y conversión de PDFs sin límites.",
    url: "/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
