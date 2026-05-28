"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { FREE_DAILY_LIMIT, FREE_MAX_FILE_MB, PREMIUM_MAX_FILE_MB } from "../lib/plan";
import { useLocale } from "../components/LocaleProvider";

const BASE_PRICE_USD = 9;

const FORMATS = [
  { ext: "PDF",  icon: "📕", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30" },
  { ext: "DOCX", icon: "📝", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30" },
  { ext: "XLSX", icon: "📗", color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30" },
  { ext: "PPTX", icon: "📊", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30" },
  { ext: "JPG",  icon: "🖼️", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30" },
  { ext: "PNG",  icon: "🎨", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30" },
  { ext: "CSV",  icon: "📊", color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-100 dark:border-teal-900/30" },
  { ext: "TXT",  icon: "📄", color: "text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800" },
  { ext: "HTML", icon: "🌐", color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30" },
];

export default function HomePage() {
  const { data: session } = useSession();
  const { t, price } = useLocale();
  const h = t.home;

  const FEATURES = [
    { icon: "✏️", gradient: "from-blue-500 to-cyan-400",     shadow: "shadow-blue-200",    href: "/editor",      title: "Editor Pro",              desc: h.subtitle.split(".")[0] + ".", cta: h.ctaStart },
    { icon: "🔄", gradient: "from-emerald-500 to-teal-400",  shadow: "shadow-emerald-200", href: "/converter",   title: t.nav.converter, desc: h.subtitle, cta: h.ctaConvert },
    { icon: "✨", gradient: "from-purple-500 to-pink-500",   shadow: "shadow-purple-200",  href: "/editor",      title: "IA integrada",            desc: h.subtitle, cta: h.ctaStart },
    { icon: "🛠️", gradient: "from-indigo-500 to-purple-500", shadow: "shadow-indigo-200",  href: "/merge-split", title: h.featuresTitle,           desc: h.featuresSubtitle, cta: h.ctaConvert },
  ];

  const STEPS = [
    { n: "01", icon: "📤", title: h.step1Title, desc: h.step1Desc },
    { n: "02", icon: "⚡", title: h.step2Title, desc: h.step2Desc },
    { n: "03", icon: "📥", title: h.step3Title, desc: h.step3Desc },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ══════════════ HERO ══════════════ */}
      <section className="hero-bg relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 glass text-white/90 px-4 py-1.5 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {h.badge}
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight animate-slide-up">
            {h.heading1}<br />
            <span className="gradient-text">{h.heading2}</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up-delay">
            {h.subtitle}
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16 animate-slide-up-delay2">
            <Link href="/editor" className="px-8 py-4 btn-gradient text-white font-bold rounded-2xl text-lg shadow-2xl">
              {h.ctaStart}
            </Link>
            <Link href="/converter" className="px-8 py-4 glass text-white font-semibold rounded-2xl text-lg hover:bg-white/20 transition-all">
              {h.ctaConvert}
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3 animate-fade-in">
            {FORMATS.map((f) => (
              <span key={f.ext} className="flex items-center gap-2 glass text-white/80 px-4 py-2 rounded-xl text-sm font-medium">
                {f.icon} {f.ext}
              </span>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 dark:from-gray-950/60 to-transparent" />
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section className="bg-gray-50 dark:bg-gray-950/60 pt-24 pb-20 px-6 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">{h.featuresLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{h.featuresTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">{h.featuresSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800/80 card-lift shadow-sm group">
                <div className={`w-12 h-12 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-xl mb-5 shadow-lg ${f.shadow} group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-4 text-xs line-clamp-3">{f.desc}</p>
                <Link
                  href={f.href}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${f.gradient} text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all`}
                >
                  {f.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section className="bg-white dark:bg-gray-900 py-24 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-purple-600 font-semibold text-sm uppercase tracking-widest mb-3">{h.processLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{h.processTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{h.processSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-blue-200 dark:from-blue-900/40 via-purple-200 dark:via-purple-900/40 to-emerald-200 dark:to-emerald-900/40" />
            {STEPS.map((s) => (
              <div key={s.n} className="text-center group">
                <div className="relative inline-block mb-5">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2 border-blue-100 dark:border-blue-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto relative z-10 group-hover:scale-110 transition-transform">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-black rounded-full flex items-center justify-center z-20">
                    {s.n.slice(-1)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FORMATS ══════════════ */}
      <section className="bg-gray-50 dark:bg-gray-950/60 py-20 px-6 transition-colors duration-300">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-3">{h.formatsLabel}</p>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10">{h.formatsTitle}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {FORMATS.map((f) => (
              <div key={f.ext} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-bold card-lift ${f.color}`}>
                <span className="text-2xl">{f.icon}</span>
                <span>{f.ext}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRICING TEASER ══════════════ */}
      <section className="bg-white dark:bg-gray-900 py-24 px-6 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-yellow-600 font-semibold text-sm uppercase tracking-widest mb-3">{h.pricingLabel}</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">{h.pricingTitle}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{h.pricingSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-gray-50 dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-300">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{h.freeTier}</p>
              <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">
                {price(0)}<span className="text-lg text-gray-400 font-normal"> {t.pricing.perMonth}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{h.freeDesc}</p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex gap-2"><span className="text-green-500">✓</span>{h.freeOps(FREE_DAILY_LIMIT)}</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span>{h.freeSize(FREE_MAX_FILE_MB)}</li>
                <li className="flex gap-2"><span className="text-green-500">✓</span>{h.freeFeatures}</li>
                <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-700">✕</span><span className="text-gray-400 dark:text-gray-500">{h.freeLocked}</span></li>
              </ul>
              <Link href="/editor" className="block w-full py-3 text-center rounded-2xl border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm hover:border-gray-400 dark:hover:border-gray-600 transition-all">
                {h.freeCta}
              </Link>
            </div>

            {/* Premium */}
            <div className="relative bg-gradient-to-br from-gray-900 to-gray-950 rounded-3xl border border-yellow-400/30 p-8 shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full shadow-lg">
                  {h.popularBadge}
                </span>
              </div>
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-2 mt-2">{h.premiumTier}</p>
              <div className="text-4xl font-black text-white mb-1">
                {price(BASE_PRICE_USD)}
                <span className="text-lg text-gray-400 font-normal"> {t.pricing.perMonth}</span>
              </div>
              <p className="text-sm text-gray-400 mb-6">{h.premiumDesc}</p>
              <ul className="space-y-2 text-sm text-gray-300 mb-8">
                <li className="flex gap-2"><span className="text-yellow-400">✓</span>{h.premiumOps}</li>
                <li className="flex gap-2"><span className="text-yellow-400">✓</span>{h.premiumSize(PREMIUM_MAX_FILE_MB)}</li>
                <li className="flex gap-2"><span className="text-yellow-400">✓</span>{h.premiumFeatures}</li>
                <li className="flex gap-2"><span className="text-yellow-400">✓</span>{h.premiumShare}</li>
              </ul>
              <Link href="/pricing" className="block w-full py-3 text-center rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-black text-sm shadow-lg hover:scale-[1.02] transition-all">
                {h.premiumCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section className="hero-bg relative overflow-hidden py-24 px-6">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            {h.ctaTitle(session?.user?.name?.split(" ")[0])}
          </h2>
          <p className="text-white/60 text-lg mb-10">
            {h.ctaSubtitle(!!session)}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/editor" className="px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:scale-105 transition-all shadow-2xl text-lg">
              {h.goEditor}
            </Link>
            <Link href="/converter" className="px-8 py-4 glass text-white font-semibold rounded-2xl hover:bg-white/20 transition-all text-lg">
              {h.goConverter}
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
