"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-3xl font-bold mb-4">Iniciar Sesión</h1>
      {session ? (
        <>
          <p className="mb-4">Bienvenido, {session.user?.name}</p>
          <button onClick={() => signOut()} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md shadow-md transition">
            Cerrar Sesión
          </button>
        </>
      ) : (
        <button onClick={() => signIn("google")} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md shadow-md transition">
          Iniciar con Google
        </button>
      )}
    </div>
  );
}
