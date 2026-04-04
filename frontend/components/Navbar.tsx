"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import DarkModeToggle from "./DarkModeToggle";
import { PlanBadge } from "./PremiumGate";
import { useLocale } from "./LocaleProvider";
import type { Locale } from "../lib/i18n";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { t, locale, setLocale } = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const NAV_LINKS = [
    { href: "/editor",      label: t.nav.editor,    icon: "✏️" },
    { href: "/converter",   label: t.nav.converter,  icon: "🔄" },
    { href: "/merge-split", label: t.nav.tools,      icon: "🛠️" },
    { href: "/pricing",     label: t.nav.pricing,    icon: "👑" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isHome = pathname === "/";
  const toggleLocale = () => setLocale(locale === "es" ? "en" : "es" as Locale);

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled || !isHome
          ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-sm border-b border-gray-200/60 dark:border-gray-700/60"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 btn-gradient rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
            <img src="/icon.svg" alt="DocuFlow icon" className="w-5 h-5" />
          </div>
          <span className={`font-black text-lg tracking-tight ${isHome && !scrolled ? "text-white" : "text-gray-900 dark:text-white"}`}>
            Docu
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Flow</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : isHome && !scrolled
                    ? "text-white/80 hover:text-white hover:bg-white/10"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span>{icon}</span>
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <PlanBadge />

          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              isHome && !scrolled
                ? "border-white/20 text-white/70 hover:text-white hover:bg-white/10"
                : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {locale === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
          </button>

          <DarkModeToggle />

          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-2xl hover:bg-white/10 transition-all"
                aria-label={t.nav.myProfile}
              >
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full border-2 border-white/30 shadow"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full btn-gradient flex items-center justify-center text-sm font-black text-white">
                    {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <span className={`hidden md:block text-sm font-semibold ${isHome && !scrolled ? "text-white/90" : "text-gray-700 dark:text-gray-200"}`}>
                  {session.user?.name?.split(" ")[0]}
                </span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""} ${isHome && !scrolled ? "text-white/60" : "text-gray-400"}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 overflow-hidden animate-fade-in">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {session.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full btn-gradient flex items-center justify-center font-black text-white">
                          {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-sm">👤</span>
                      {t.nav.myProfile}
                    </Link>
                    <Link
                      href="/editor"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="w-7 h-7 bg-blue-50 dark:bg-blue-900/40 rounded-lg flex items-center justify-center text-sm">✏️</span>
                      {t.nav.pdfEditor}
                    </Link>
                    <Link
                      href="/converter"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center text-sm">🔄</span>
                      {t.nav.converter2}
                    </Link>

                    <Link
                      href="/support"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <span className="w-7 h-7 bg-violet-50 dark:bg-violet-900/40 rounded-lg flex items-center justify-center text-sm">💬</span>
                      {t.support.navLink}
                    </Link>

                    {/* Language switcher in dropdown (mobile) */}
                    <button
                      type="button"
                      onClick={() => { toggleLocale(); setDropdownOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors sm:hidden"
                    >
                      <span className="w-7 h-7 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-sm">🌐</span>
                      {locale === "es" ? "Switch to English" : "Cambiar a Español"}
                    </button>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-gray-50 dark:border-gray-700 pt-1">
                    <button
                      type="button"
                      onClick={() => { setDropdownOpen(false); signOut(); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <span className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-sm">🚪</span>
                      {t.nav.signOut}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signIn("google")}
              className="px-5 py-2 btn-gradient text-white text-sm font-bold rounded-xl shadow-lg"
            >
              {t.nav.signIn}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
