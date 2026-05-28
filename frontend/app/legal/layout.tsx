import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal de DocuFlow. Información sobre el titular del servicio, propiedad intelectual y responsabilidades.",
  openGraph: { title: "Aviso Legal | DocuFlow", url: "/legal" },
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
