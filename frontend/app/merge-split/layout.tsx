import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Herramientas PDF",
  description: "Fusiona, divide, comprime, aplica OCR y marca de agua a tus PDFs. Todo en un solo lugar, gratis.",
  openGraph: {
    title: "Herramientas PDF | DocuFlow",
    description: "Fusiona, divide, comprime, aplica OCR y añade marca de agua a tus PDFs.",
    url: "/merge-split",
  },
};

export default function MergeSplitLayout({ children }: { children: React.ReactNode }) {
  return children;
}
