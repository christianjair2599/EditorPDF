"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getActivities, getStats, timeAgo, type Activity } from "../../lib/activity";
import { useSubscription } from "../../lib/useSubscription";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const { isPremium, currentPeriodEnd } = useSubscription();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState({ total: 0, conversions: 0, edits: 0 });
  const [mounted, setMounted] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const handlePortal = async () => {
    if (!session?.user?.email) return;
    setPortalLoading(true);
    try {
      const res = await fetch("/api/customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    setStats(getStats());
    setActivities(getActivities());
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      </div>
    );
  }

  const handleExportHistory = () => {
    const activities = getActivities();
    let csv = "Fecha,Tipo,Archivo,Formato\n";
    activities.forEach((a) => {
      const date = new Date(a.date).toLocaleDateString("es");
      csv += `"${date}","${a.type}","${a.filename}","${a.format ?? ""}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-docuflow-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Inicia sesión para ver tu perfil</h1>
        <p className="text-gray-500 text-center max-w-sm">
          Conecta tu cuenta de Google para acceder a tu historial y preferencias.
        </p>
        <Link
          href="/"
          className="px-6 py-3 btn-gradient text-white font-bold rounded-2xl shadow-lg"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: "Archivos procesados",
      value: stats.total,
      icon: "📁",
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-100",
    },
    {
      label: "Conversiones",
      value: stats.conversions,
      icon: "🔄",
      gradient: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-100",
    },
    {
      label: "Sesiones de edición",
      value: stats.edits,
      icon: "✏️",
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="hero-bg relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-32 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-5">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Avatar"
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-full border-4 border-white/30 shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full btn-gradient flex items-center justify-center text-3xl font-black text-white border-4 border-white/30 shadow-2xl">
                {session.user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full border-2 border-white flex items-center justify-center text-xs">✓</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-1">
            {session.user?.name}
          </h1>
          <p className="text-white/60 text-sm">{session.user?.email}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
      </div>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-10">
        <div className="grid grid-cols-3 gap-4">
          {mounted && STAT_CARDS.map((s) => (
            <div
              key={s.label}
              className={`bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm ${s.shadow} text-center`}
            >
              <div
                className={`w-10 h-10 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-lg mx-auto mb-3 shadow-md`}
              >
                {s.icon}
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
          {!mounted && [0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-xl mx-auto mb-3" />
              <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-1" />
              <div className="h-3 bg-gray-100 rounded w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-2 gap-6">

        {/* Activity history */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Historial de actividad</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{activities.length} registros</span>
              {activities.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportHistory}
                  className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                >
                  📥 Exportar CSV
                </button>
              )}
            </div>
          </div>

          {!mounted || activities.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm text-gray-400">Sin actividad registrada aún.</p>
              <p className="text-xs text-gray-300 mt-1">
                Convierte o edita un PDF para empezar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-700 max-h-96 overflow-y-auto">
              {activities.map((a) => (
                <div key={a.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
                    a.type === "convert"
                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                      : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  }`}>
                    {a.type === "convert" ? "🔄" : "✏️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{a.filename}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {a.type === "convert"
                        ? `Convertido a ${a.format}`
                        : `${a.edits} bloque${a.edits !== 1 ? "s" : ""} editado${a.edits !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-300 dark:text-gray-600 flex-shrink-0">{timeAgo(a.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account info + actions */}
        <div className="flex flex-col gap-4">
          {/* Account card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Cuenta</h2>
            <div className="flex items-center gap-3 mb-4">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full btn-gradient flex items-center justify-center text-lg font-black text-white">
                  {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{session.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Sesión activa · Google</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Acceso rápido</h2>
            <div className="flex flex-col gap-2">
              <Link
                href="/editor"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-sm font-medium transition-colors"
              >
                <span className="text-lg">✏️</span>
                Ir al Editor de PDF
                <span className="ml-auto text-blue-400">→</span>
              </Link>
              <Link
                href="/converter"
                className="flex items-center gap-3 px-4 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium transition-colors"
              >
                <span className="text-lg">🔄</span>
                Ir al Convertidor
                <span className="ml-auto text-emerald-400">→</span>
              </Link>
            </div>
          </div>

          {/* Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Plan actual</h2>
            {isPremium ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/20 text-yellow-700 rounded-full text-xs font-bold">✨ Premium</span>
                  {currentPeriodEnd && (
                    <p className="text-xs text-gray-400 mt-1">
                      Renueva: {new Date(currentPeriodEnd).toLocaleDateString("es")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold disabled:opacity-50"
                >
                  {portalLoading ? "..." : "Gestionar →"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs font-bold">Free</span>
                <Link href="/pricing" className="text-xs text-yellow-600 hover:text-yellow-700 font-bold">Mejorar a Premium →</Link>
              </div>
            )}
          </div>

          {/* Sign out */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full py-3 border-2 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl text-sm font-semibold transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
