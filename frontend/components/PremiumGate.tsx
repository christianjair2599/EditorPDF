"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { canUse, getPlan, canOperate, getDailyUsage, type PremiumFeature, FEATURE_INFO, FREE_DAILY_LIMIT } from "../lib/plan";

/* ── Modal ───────────────────────────────────────────────────────────────── */

interface PremiumModalProps {
  feature: PremiumFeature | "daily_limit";
  onClose: () => void;
}

export function PremiumModal({ feature, onClose }: PremiumModalProps) {
  const isDailyLimit = feature === "daily_limit";
  const info = isDailyLimit
    ? { icon: "⏳", title: "Límite diario alcanzado", desc: `El plan gratuito incluye ${FREE_DAILY_LIMIT} operaciones por día. Actualiza a Premium para uso ilimitado.` }
    : FEATURE_INFO[feature];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 animate-fade-in">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-orange-200">
          {info.icon}
        </div>

        {/* Crown badge */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-black rounded-full uppercase tracking-wide">
            👑 Premium
          </span>
        </div>

        <h2 className="text-xl font-black text-gray-900 dark:text-white text-center mb-2">
          {info.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6 leading-relaxed">
          {info.desc}
        </p>

        {/* Premium perks quick list */}
        <ul className="space-y-2 mb-7">
          {["Uso ilimitado · Sin restricciones diarias", "Todos los formatos y herramientas", "OCR · IA · Marca de agua · Compartir", "Archivos de hasta 50 MB"].map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500 font-bold">✓</span>
              {perk}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/pricing"
          onClick={onClose}
          className="block w-full py-3.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black rounded-2xl text-center text-sm shadow-lg shadow-orange-200 transition-all hover:scale-[1.02]"
        >
          Ver planes y precios →
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="block w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          Continuar con plan gratuito
        </button>
      </div>
    </div>
  );
}

/* ── Hook ────────────────────────────────────────────────────────────────── */

/**
 * Returns gate helpers for a premium feature.
 * Usage:
 *   const gate = usePremiumGate("ocr");
 *   <button onClick={gate.guard(handleOCR)}>OCR</button>
 *   {gate.modal}
 */
export function usePremiumGate(feature: PremiumFeature | "daily_limit") {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isLocked = useCallback(() => {
    if (!mounted) return false;
    if (feature === "daily_limit") return !canOperate();
    return !canUse(feature as PremiumFeature);
  }, [mounted, feature]);

  /** Wraps an action — shows modal if locked, otherwise runs it */
  const guard = useCallback(
    <T extends unknown[]>(fn: (...args: T) => void) =>
      (...args: T) => {
        if (isLocked()) { setOpen(true); return; }
        fn(...args);
      },
    [isLocked]
  );

  const modal = open ? (
    <PremiumModal feature={feature} onClose={() => setOpen(false)} />
  ) : null;

  return { isLocked, guard, modal, open, setOpen };
}

/* ── Wrapper component (for visual lock overlays) ────────────────────────── */

interface PremiumGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  /** If true, renders children but they are visually disabled */
  soft?: boolean;
}

export function PremiumGate({ feature, children, soft = false }: PremiumGateProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const locked = mounted && !canUse(feature);
  const info = FEATURE_INFO[feature];

  if (!locked) return <>{children}</>;

  if (soft) {
    return (
      <>
        {open && <PremiumModal feature={feature} onClose={() => setOpen(false)} />}
        <div className="relative cursor-pointer" onClick={() => setOpen(true)}>
          <div className="pointer-events-none opacity-40 select-none">{children}</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-md">
              👑 Premium
            </span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {open && <PremiumModal feature={feature} onClose={() => setOpen(false)} />}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full p-4 rounded-xl border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10 text-center hover:border-yellow-400 transition-all group"
      >
        <div className="text-2xl mb-1">{info.icon}</div>
        <p className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{info.title}</p>
        <p className="text-xs text-yellow-600/80 dark:text-yellow-500 mt-0.5">{info.desc}</p>
        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full group-hover:scale-105 transition-transform">
          👑 Desbloquear con Premium
        </span>
      </button>
    </>
  );
}

/* ── Daily usage banner ──────────────────────────────────────────────────── */

export function DailyUsageBanner() {
  const [mounted, setMounted] = useState(false);
  const [usage, setUsage] = useState({ used: 0, limit: FREE_DAILY_LIMIT, isPremium: false });

  useEffect(() => {
    setMounted(true);
    setUsage(getDailyUsage());
  }, []);

  if (!mounted || usage.isPremium) return null;

  const pct = Math.min(100, (usage.used / usage.limit) * 100);
  const remaining = usage.limit - usage.used;
  const isLow = remaining <= 3;

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium ${
      isLow
        ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
    }`}>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span>Operaciones hoy: {usage.used}/{usage.limit}</span>
          {isLow && (
            <Link href="/pricing" className="text-orange-600 dark:text-orange-400 font-bold hover:underline">
              Ampliar →
            </Link>
          )}
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isLow ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Plan badge (used in Navbar) ─────────────────────────────────────────── */

export function PlanBadge() {
  const [mounted, setMounted] = useState(false);
  const [plan, setPlanState] = useState<"free" | "premium">("free");

  useEffect(() => {
    setMounted(true);
    setPlanState(getPlan());
  }, []);

  if (!mounted) return null;

  if (plan === "premium") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-[10px] font-black rounded-full">
        👑 PRO
      </span>
    );
  }

  return (
    <Link
      href="/pricing"
      className="inline-flex items-center gap-1 px-2 py-0.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-bold rounded-full hover:border-orange-300 hover:text-orange-500 transition-colors"
    >
      ↑ Premium
    </Link>
  );
}
