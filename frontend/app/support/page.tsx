"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "../../components/LocaleProvider";

const SUPPORT_EMAIL = "soporte@docuflow.app";

export default function SupportPage() {
  const { t } = useLocale();
  const s = t.support;

  const [form, setForm] = useState({ email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    // Build a mailto link as fallback (no backend endpoint needed)
    const body = encodeURIComponent(
      `De: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || "Soporte DocuFlow");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    // Show sent state after a short delay
    setTimeout(() => setStatus("sent"), 800);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-4">
            {s.badge}
          </span>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">{s.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">{s.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">

          {/* Contact form */}
          <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            {status === "sent" ? (
              <div className="flex flex-col items-center justify-center text-center py-8 gap-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl">
                  ✅
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{s.sent}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{s.sentDesc}</p>
                <button
                  type="button"
                  onClick={() => { setStatus("idle"); setForm({ email: "", subject: "", message: "" }); }}
                  className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {t.support.send} →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {s.emailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder={s.emailPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {s.subjectLabel}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    placeholder={s.subjectPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    {s.messageLabel}
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder={s.messagePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md"
                >
                  {status === "sending" ? s.sending : s.send}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar info */}
          <div className="md:col-span-2 flex flex-col gap-6">

            {/* Direct email */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{s.directEmail}</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-600 dark:text-blue-400 font-semibold text-sm hover:underline break-all"
              >
                {SUPPORT_EMAIL}
              </a>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">{s.responseTime}</p>
            </div>

            {/* Back link */}
            <Link
              href="/"
              className="text-center py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              ← {t.nav.editor}
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{s.faqTitle}</h2>
          <div className="flex flex-col gap-4">
            {s.faq.map((item, i) => (
              <details
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4 group"
              >
                <summary className="cursor-pointer font-semibold text-gray-900 dark:text-white text-sm list-none flex items-center justify-between gap-3">
                  {item.q}
                  <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">▾</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
