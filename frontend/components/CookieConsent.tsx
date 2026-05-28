"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "./LocaleProvider";

const STORAGE_KEY = "docuflow_cookie_consent";

export default function CookieConsent() {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it doesn't flash during hydration
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(STORAGE_KEY, "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t.cookies.message}
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up"
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 md:p-6">
          {/* Icon */}
          <div className="shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-xl">
            🍪
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {t.cookies.message}{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:underline font-medium whitespace-nowrap"
              >
                {t.cookies.learnMore}
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDecline}
              className="flex-1 md:flex-none px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t.cookies.decline}
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 md:flex-none px-5 py-2.5 text-sm font-bold text-white btn-gradient rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              {t.cookies.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
