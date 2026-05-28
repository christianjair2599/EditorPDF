"use client";

import { useSession } from "next-auth/react";
import { useSubscription } from "../../lib/useSubscription";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "../../components/LocaleProvider";

export default function TestPage() {
  const { data: session } = useSession();
  const { isPremium, status, isTester, loading: subLoading } = useSubscription();
  const { currency, setGeoOverride } = useLocale();

  const [localStatus, setLocalStatus] = useState(status);
  const [localPremium, setLocalPremium] = useState(isPremium);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  // Sync state with hook values on initial load
  useEffect(() => {
    setLocalStatus(status);
    setLocalPremium(isPremium);
  }, [status, isPremium]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setSuccessMsg("");
    } else {
      setSuccessMsg(msg);
      setErrorMsg("");
    }
    setTimeout(() => {
      setSuccessMsg("");
      setErrorMsg("");
    }, 4000);
  };

  const handleTogglePremium = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/test/toggle-premium`, {
        method: "POST",
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
      });

      if (!res.ok) throw new Error("Error al alternar membresía de prueba");
      const data = await res.json();
      
      setLocalStatus(data.premium_status);
      setLocalPremium(data.premium_status === "active");
      
      // Update local storage so editor instantly unlocks
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("docuflow_plan");
        if (raw) {
          const state = JSON.parse(raw);
          state.plan = data.premium_status === "active" ? "premium" : "free";
          localStorage.setItem("docuflow_plan", JSON.stringify(state));
        }
      }

      showNotification(`Estado de suscripción cambiado a: ${data.premium_status.toUpperCase()}`);
    } catch (err) {
      const error = err as Error;
      showNotification(error.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetLimits = async () => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/test/reset-limits`, {
        method: "POST",
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
      });

      if (!res.ok) throw new Error("Error al reiniciar los límites diarios");
      await res.json();

      // Reset local storage usage counter
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("docuflow_plan");
        if (raw) {
          const state = JSON.parse(raw);
          state.dailyOps = 0;
          localStorage.setItem("docuflow_plan", JSON.stringify(state));
        }
      }

      showNotification("Operaciones diarias reiniciadas exitosamente a 0.");
    } catch (err) {
      const error = err as Error;
      showNotification(error.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateWebhook = async (eventType: "order_created" | "subscription_cancelled") => {
    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append("event_type", eventType);

      const res = await fetch(`${API_URL}/test/mock-webhook`, {
        method: "POST",
        headers: {
          "X-User-Email": session?.user?.email || "",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al simular webhook");
      const data = await res.json();

      setLocalStatus(data.premium_status);
      setLocalPremium(data.premium_status === "active");

      // Update local storage
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("docuflow_plan");
        if (raw) {
          const state = JSON.parse(raw);
          state.plan = data.premium_status === "active" ? "premium" : "free";
          localStorage.setItem("docuflow_plan", JSON.stringify(state));
        }
      }

      showNotification(
        `Webhook '${eventType}' simulado. Estado en base de datos actualizado a: ${data.premium_status.toUpperCase()}`
      );
    } catch (err) {
      const error = err as Error;
      showNotification(error.message, true);
    } finally {
      setActionLoading(false);
    }
  };

  if (subLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Validando perfil de pruebas (Tester)...</p>
      </div>
    );
  }

  if (!isTester) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-24 h-24 bg-purple-100 dark:bg-purple-950/40 text-purple-500 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-purple-500/10">
          🧪
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Perfil No Autorizado</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Tu cuenta actual no cuenta con privilegios de **QA / Tester**. Contacta a tu administrador para solicitar acceso a las herramientas de simulación.
        </p>
        <Link
          href="/"
          className="px-6 py-3 btn-gradient text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-purple-500/15 border border-purple-500/30 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
            🧪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/10 text-purple-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-wider">
                Entorno de Pruebas
              </span>
            </div>
            <h1 className="text-3xl font-black">Consola del <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">QA Tester</span></h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Simula pasarelas, toggles de pago y reset de consumo diario instantáneamente sin usar tarjetas reales.</p>
          </div>
        </div>

        {/* Status indicator card */}
        <div className="bg-gradient-to-br from-gray-900 to-purple-950 text-white rounded-3xl p-6 mb-8 border border-purple-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <p className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">Estado de tu Sesión en Tiempo Real</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-300">Usuario: <span className="font-bold text-white">{session?.user?.email}</span></p>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">
                  <span>Membresía:</span>
                  <span className={`font-black ${localPremium ? "text-purple-400" : "text-gray-400"}`}>
                    {localStatus.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs">
                  <span>Modo Premium:</span>
                  <span className={`font-black ${localPremium ? "text-emerald-400" : "text-red-400"}`}>
                    {localPremium ? "DESBLOQUEADO" : "BLOQUEADO"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full ${localPremium ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="text-xs font-bold text-gray-200">
                {localPremium ? "Pasarela Simulada Abierta" : "Pasarela Simulada Cerrada"}
              </span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 rounded-2xl p-4 mb-8 flex items-center gap-3 animate-fade-in">
            <span>✓</span>
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-300 rounded-2xl p-4 mb-8 flex items-center gap-3 animate-fade-in">
            <span>⚠️</span>
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}

        {/* Grid of simulators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Simulator 1: Plan State */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg">1. Compuerta de Pago Directa</h3>
                <span className="text-xl">💳</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Fuerza el estado de tu membresía de forma directa en la base de datos entre Gratis y Activo. Permite corroborar que los límites de tamaño y herramientas premium se activan y bloquean dinámicamente.
              </p>
            </div>
            <button
              disabled={actionLoading}
              onClick={handleTogglePremium}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-md ${
                localPremium
                  ? "bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-900/30 hover:bg-red-100"
                  : "bg-purple-500 text-white hover:bg-purple-600 hover:scale-[1.01]"
              }`}
            >
              {actionLoading ? "Procesando..." : localPremium ? "Fijar Plan GRATUITO (Free)" : "Fijar Plan PREMIUM (Pro)"}
            </button>
          </div>

          {/* Simulator 2: Daily Operations Limit */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg">2. Consumo de Uso Diario</h3>
                <span className="text-xl">🔄</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                DocuFlow restringe el plan gratuito a 4 operaciones de conversión/procesamiento diarias. Presiona este botón para restablecer tu contador diario local a 0 para simular pruebas desde limpio en segundos.
              </p>
            </div>
            <button
              disabled={actionLoading}
              onClick={handleResetLimits}
              className="w-full py-3 bg-white dark:bg-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              {actionLoading ? "Procesando..." : "Resetear Operaciones Diarias"}
            </button>
          </div>

          {/* Simulator 3: Webhookorder_created */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg">3. Webhook de Compra (Mock)</h3>
                <span className="text-xl">🔔</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Simula la llamada asíncrona de Lemon Squeezy o Stripe al backend para registrar un nuevo pago. Verifica que el backend reciba la orden de compra y actualice el plan al instante en segundo plano.
              </p>
            </div>
            <button
              disabled={actionLoading}
              onClick={() => handleSimulateWebhook("order_created")}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.01]"
            >
              {actionLoading ? "Procesando..." : "Simular Webhook: order_created"}
            </button>
          </div>

          {/* Simulator 4: Webhook subscription_cancelled */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg">4. Webhook de Cancelación (Mock)</h3>
                <span className="text-xl">🚫</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Simula la cancelación o expiración de la suscripción de un cliente en Lemon Squeezy / Stripe. Comprueba que el backend procese la baja del servicio, bloqueando el acceso premium de inmediato.
              </p>
            </div>
            <button
              disabled={actionLoading}
              onClick={() => handleSimulateWebhook("subscription_cancelled")}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:scale-[1.01]"
            >
              {actionLoading ? "Procesando..." : "Simular Webhook: subscription_cancelled"}
            </button>
          </div>

          {/* Simulator 5: Geo/Currency Override */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between md:col-span-2 transition-all duration-300">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg">5. Simulador de Región y Moneda Local</h3>
                <span className="text-xl">🌐</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Fuerza la localización geográfica y moneda de tu sesión para verificar cómo cambian y se adaptan los precios de suscripción en todo el sitio web de forma instantánea.
              </p>
              
              <div className="flex items-center gap-2 mb-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200/50 dark:border-purple-900/30 px-4 py-2.5 rounded-2xl text-xs">
                <span>Visualización actual:</span>
                <span className="font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">{currency}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => { setGeoOverride(null); showNotification("Moneda restablecida a la autodetectada nativa."); }}
                className="py-2.5 px-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                🔄 Autodetectar
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'PEN', browserLocale: 'es-PE' }); showNotification("Moneda forzada a Soles (Perú)."); }}
                className="py-2.5 px-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇵🇪 Perú (PEN)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'EUR', browserLocale: 'es-ES' }); showNotification("Moneda forzada a Euros (España)."); }}
                className="py-2.5 px-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-850 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇪🇸 España (EUR)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'USD', browserLocale: 'en-US' }); showNotification("Moneda forzada a Dólares (USA)."); }}
                className="py-2.5 px-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-850 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇺🇸 USA (USD)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'MXN', browserLocale: 'es-MX' }); showNotification("Moneda forzada a Pesos (México)."); }}
                className="py-2.5 px-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-850 text-yellow-700 dark:text-yellow-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇲🇽 México (MXN)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'COP', browserLocale: 'es-CO' }); showNotification("Moneda forzada a Pesos (Colombia)."); }}
                className="py-2.5 px-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-850 text-orange-700 dark:text-orange-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇨🇴 Colombia (COP)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'CLP', browserLocale: 'es-CL' }); showNotification("Moneda forzada a Pesos (Chile)."); }}
                className="py-2.5 px-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-850 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇨🇱 Chile (CLP)
              </button>
              <button
                type="button"
                onClick={() => { setGeoOverride({ currency: 'BRL', browserLocale: 'pt-BR' }); showNotification("Moneda forzada a Reales (Brasil)."); }}
                className="py-2.5 px-3 bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-850 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
              >
                🇧🇷 Brasil (BRL)
              </button>
            </div>
          </div>

        </div>

        {/* Footer info box */}
        <div className="mt-12 bg-purple-50 dark:bg-purple-950/15 border border-purple-200 dark:border-purple-900/30 rounded-3xl p-6 text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
          💡 **Consejo de QA:** Abre tu consola de red en el navegador y ve a la página principal `/editor` tras presionar &apos;Fijar Plan Premium&apos;. Verás que todos los controles de OCR, Marca de agua y IA se desbloquean instantáneamente gracias al sincronizador global del Navbar sin recargar la página.
        </div>

      </div>
    </div>
  );
}
