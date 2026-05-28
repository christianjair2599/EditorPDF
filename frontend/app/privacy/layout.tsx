import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de DocuFlow. Cumplimiento con el RGPD.",
  openGraph: { title: "Política de Privacidad | DocuFlow", url: "/privacy" },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
