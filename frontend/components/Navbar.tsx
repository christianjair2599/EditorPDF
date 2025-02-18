"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">EditorPDF</Link>
        <div className="flex gap-4">
          <Link href="/editor" className="hover:underline">Editor</Link>
          <Link href="/converter" className="hover:underline">Convertidor</Link>
          <Link href="/login" className="hover:underline">Cuenta</Link>
        </div>
      </div>
    </nav>
  );
}
