"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-4 text-center">Bienvenido a EditorPDF</h1>
      <p className="text-lg mb-6 text-center">Convierte y edita tus archivos PDF fácilmente.</p>

      <div className="flex flex-wrap gap-4">
        <Link href="/editor" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md transition">
          Ir al Editor
        </Link>
        <Link href="/converter" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md shadow-md transition">
          Ir al Convertidor
        </Link>
        {session ? (
          <Link href="/login" className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md shadow-md transition">
            Mi Cuenta
          </Link>
        ) : (
          <Link href="/login" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md shadow-md transition">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </div>
  );
}

