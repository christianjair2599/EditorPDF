"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "./LocaleProvider";

export default function Footer() {
  const { t, locale } = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image 
                src="/new_logo.png" 
                alt="DocuFlow Logo" 
                width={32} 
                height={32} 
                className="rounded-xl shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
              />
              <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-white transition-colors duration-300">
                Docu
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Flow</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-extrabold animate-pulse">.</span>
              </span>
            </Link>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {locale === "es" 
                ? "La solución SaaS definitiva y optimizada con Inteligencia Artificial para editar, convertir y potenciar tus documentos PDF de manera instantánea y segura."
                : "The ultimate AI-powered SaaS solution to instantly and securely edit, convert, and supercharge your PDF documents."}
            </p>
            {/* Social handles */}
            <div className="flex gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center border border-gray-100 dark:border-gray-800 text-sm hover:scale-105 transition-all" aria-label="Twitter">
                🐦
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center border border-gray-100 dark:border-gray-800 text-sm hover:scale-105 transition-all" aria-label="LinkedIn">
                💼
              </a>
              <a href="#" className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center justify-center border border-gray-100 dark:border-gray-800 text-sm hover:scale-105 transition-all" aria-label="GitHub">
                🐙
              </a>
            </div>
          </div>

          {/* Links 1: Tools */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {locale === "es" ? "Herramientas" : "Tools"}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/editor" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>✏️</span> {t.nav.pdfEditor || "Editor PDF"}
                </Link>
              </li>
              <li>
                <Link href="/converter" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>🔄</span> {t.nav.converter2 || "Convertidor Universal"}
                </Link>
              </li>
              <li>
                <Link href="/merge-split" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>🛠️</span> {t.nav.tools || "Fusionar & Dividir"}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>👑</span> {t.nav.pricing || "Planes & Precios"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links 2: Support & Company */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {locale === "es" ? "Soporte & Ayuda" : "Support"}
            </h4>
            <ul className="space-y-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/support" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>💬</span> {t.support?.navLink || "Centro de Ayuda"}
                </Link>
              </li>
              <li>
                <a href="mailto:soporte@docuflow.com" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <span>✉️</span> soporte@docuflow.com
                </a>
              </li>
              <li>
                <span className="flex items-center gap-1.5 opacity-80 cursor-default">
                  <span>🟢</span> {locale === "es" ? "Servicio Online" : "Service Online"}
                </span>
              </li>
            </ul>
          </div>

          {/* Links 3: Premium Newsletter */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {locale === "es" ? "Boletín de novedades" : "Newsletter"}
            </h4>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
              {locale === "es" 
                ? "Recibe actualizaciones de funciones de IA y ofertas exclusivas."
                : "Receive updates on AI features and exclusive offers."}
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert(locale === "es" ? "¡Gracias por suscribirte!" : "Thank you for subscribing!"); }} className="flex gap-2">
              <input 
                type="email" 
                required
                placeholder={locale === "es" ? "Tu correo..." : "Your email..."}
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:border-blue-500 transition-colors text-gray-900 dark:text-white"
              />
              <button 
                type="submit"
                className="px-3.5 py-2 btn-gradient text-white text-xs font-bold rounded-xl shadow-md hover:scale-102 active:scale-98 transition-all"
              >
                ➔
              </button>
            </form>
          </div>

        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 dark:border-gray-800/80 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          <div>
            © {currentYear} DocuFlow Inc. {locale === "es" ? "Todos los derechos reservados." : "All rights reserved."}
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/terms" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {locale === "es" ? "Términos de Servicio" : "Terms of Service"}
            </Link>
            <Link href="/privacy" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
            </Link>
            <Link href="/legal" className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              {locale === "es" ? "Aviso Legal" : "Legal Notice"}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
