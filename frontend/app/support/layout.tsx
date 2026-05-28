import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soporte",
  description: "¿Tienes algún problema? Contáctanos y te responderemos en menos de 24 horas.",
  openGraph: {
    title: "Soporte | DocuFlow",
    description: "Contacta con el equipo de DocuFlow. Respuesta en menos de 24 h.",
    url: "/support",
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
