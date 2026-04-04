"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlan, setPlan, type Plan, FREE_DAILY_LIMIT, FREE_MAX_FILE_MB, PREMIUM_MAX_FILE_MB } from "../../lib/plan";
import { useLocale } from "../../components/LocaleProvider";
import { tpl } from "../../lib/i18n";

// Base USD price — displayed in the user's local currency
const BASE_PRICE_USD = 9;

export default function PricingPage() {
  const { t, price } = useLocale();
  const p = t.pricing;

  const [plan, setPlanState] = useState<Plan>("free");
  const [mounted, setMounted] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setPlanState(getPlan());
  }, []);

  const activateDemo = () => {
    setPlan("premium");
    setPlanState("premium");
    setDemoMsg(p.demoActivated);
  };

  const deactivateDemo = () => {
    setPlan("free");
    setPlanState("free");
    setDemoMsg(p.demoRestored);
  };

  const vars = { limit: FREE_DAILY_LIMIT, freeMB: FREE_MAX_FILE_MB, premiumMB: PREMIUM_MAX_FILE_MB };

  // Split freeFeatures into included (first 6) and locked (last 6)
  const freeIncluded = p.freeFeatures.slice(0, 6);
  const freeLocked   = p.freeFeatures.slice(6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="hero-bg relative overflow-hidden py-20 px-6">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-yellow-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 rounded-full text-sm font-semibold mb-6">
            {p.badge}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{p.title}</h1>
          <p className="text-white/60 text-lg">{p.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        {/* Demo notice */}
        {mounted && (
          <div className={`p-4 rounded-2xl text-sm font-medium text-center border ${
            plan === "premium"
              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
          }`}>
            {plan === "premium" ? (
              <span>
                <span dangerouslySetInnerHTML={{ __html: p.demoPremium }} />{" "}
                <button type="button" onClick={deactivateDemo} className="underline hover:no-underline ml-1">
                  {p.demoBack}
                </button>
              </span>
            ) : (
              <span>
                {p.demoTry}{" "}
                <button type="button" onClick={activateDemo} className="underline font-bold hover:no-underline ml-1">
                  Activar demo gratuito por 7 días →
                </button>
              </span>
            )}
          </div>
        )}
        {demoMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 rounded-xl text-sm text-center">
            {demoMsg}
          </div>
        )}

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 items-start">

          {/* Free */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8">
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{p.freeTier}</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-gray-900 dark:text-white">$0</span>
                <span className="text-gray-400 mb-2">{p.perMonth}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{p.freeDesc}</p>
            </div>

            <Link
              href="/converter"
              className="block w-full py-3 text-center rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all mb-8"
            >
              {p.freeCta}
            </Link>

            <ul className="space-y-3">
              {freeIncluded.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{tpl(f, vars)}</span>
                </li>
              ))}
              {freeLocked.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 flex items-center justify-center flex-shrink-0 text-xs">✕</span>
                  <span className="text-gray-400 dark:text-gray-600 line-through">{tpl(f, vars)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-yellow-400/30 p-8 shadow-2xl shadow-yellow-900/20">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-lg">
                {p.popularBadge}
              </span>
            </div>

            <div className="mb-6 mt-2">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2">{p.premiumTier}</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black text-white">
                  {mounted ? price(BASE_PRICE_USD) : `$${BASE_PRICE_USD}`}
                </span>
                <span className="text-gray-400 mb-2">{p.perMonth}</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{p.premiumDesc}</p>
            </div>

            <button
              type="button"
              onClick={activateDemo}
              className="block w-full py-3 text-center rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-900/30 hover:scale-[1.02] transition-all mb-8"
            >
              {mounted && plan === "premium" ? p.premiumActive : p.premiumCta}
            </button>

            <ul className="space-y-3">
              {p.premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  <span className="text-gray-200">{tpl(f, vars)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feature comparison table */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">{p.tableTitle}</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-6 py-4 text-gray-500 dark:text-gray-400 font-semibold">{p.tableFeature}</th>
                  <th className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold text-center">{p.tableFree}</th>
                  <th className="px-6 py-4 text-yellow-600 dark:text-yellow-400 font-bold text-center">{p.tablePremium}</th>
                </tr>
              </thead>
              <tbody>
                {p.tableRows.map(([feature, free, premium], i) => (
                  <tr
                    key={feature}
                    className={`border-b border-gray-50 dark:border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/30"}`}
                  >
                    <td className="px-6 py-3.5 text-gray-700 dark:text-gray-300 font-medium">{feature}</td>
                    <td className="px-6 py-3.5 text-center text-gray-500 dark:text-gray-500">
                      {tpl(free, vars) === "—" ? <span className="text-gray-300 dark:text-gray-600">—</span> : tpl(free, vars)}
                    </td>
                    <td className="px-6 py-3.5 text-center font-semibold text-yellow-600 dark:text-yellow-400">
                      {tpl(premium, vars)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 text-center">{p.faqTitle}</h2>
          <div className="space-y-3">
            {p.faq.map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{item.q}</span>
                  <span className={`text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▾</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="hero-bg rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-yellow-500/10 rounded-full blur-[60px] pointer-events-none" />
          <h2 className="text-3xl font-black text-white mb-3 relative">{p.ctaTitle}</h2>
          <p className="text-white/60 mb-8 relative">{p.ctaSubtitle}</p>
          <button
            type="button"
            onClick={activateDemo}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black rounded-2xl text-lg shadow-2xl shadow-orange-900/40 hover:scale-105 transition-all relative"
          >
            {p.ctaBtn}
          </button>
        </div>

      </div>
    </div>
  );
}
