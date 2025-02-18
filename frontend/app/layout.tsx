import { ReactNode } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Head>
        <title>EditorPDF - Convierte y edita PDFs online</title>
        <meta name="description" content="EditorPDF es una herramienta en línea para convertir y editar archivos PDF fácilmente." />
        <meta name="keywords" content="editar PDF, convertir PDF a Word, convertir PDF a imagen, herramienta PDF online" />
        <meta property="og:title" content="EditorPDF - Convierte y edita PDFs online" />
        <meta property="og:description" content="EditorPDF permite editar y convertir archivos PDF sin necesidad de software adicional." />
        <meta property="og:image" content="/public/preview-image.jpg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Navbar />
      <main className="container mx-auto p-6">{children}</main>
      <footer className="text-center p-4 text-gray-500">© 2025 EditorPDF. Todos los derechos reservados.</footer>
    </>
  );
}
