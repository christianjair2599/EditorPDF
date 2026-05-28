import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convertidor Universal",
  description: "Convierte PDF, Word, Excel, PowerPoint, imágenes y más a cualquier formato. Gratis, rápido y sin registro.",
  openGraph: {
    title: "Convertidor Universal | DocuFlow",
    description: "Convierte entre PDF, Word, Excel, PowerPoint, imágenes y más de 20 formatos.",
    url: "/converter",
  },
};

export default function ConverterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
