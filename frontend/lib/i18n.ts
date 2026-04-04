// ─── Supported locales ────────────────────────────────────────────────────────
export type Locale = "es" | "en";

// ─── Currency mapping ─────────────────────────────────────────────────────────
// Maps browser locale → ISO 4217 currency code
const LOCALE_CURRENCY: Record<string, string> = {
  "en-US": "USD", "en-CA": "CAD", "en-GB": "GBP", "en-AU": "AUD",
  "en-NZ": "NZD", "en-IN": "INR", "en-ZA": "ZAR", "en-SG": "SGD",
  "es-ES": "EUR", "es-AR": "ARS", "es-MX": "MXN", "es-CO": "COP",
  "es-CL": "CLP", "es-PE": "PEN", "es-VE": "VES", "es-EC": "USD",
  "es-BO": "BOB", "es-PY": "PYG", "es-UY": "UYU", "es-CR": "CRC",
  "es-GT": "GTQ", "es-HN": "HNL", "es-NI": "NIO", "es-PA": "USD",
  "es-DO": "DOP", "es-CU": "CUP", "es-PR": "USD",
  "pt-BR": "BRL", "pt-PT": "EUR",
  "fr-FR": "EUR", "fr-BE": "EUR", "fr-CH": "CHF", "fr-CA": "CAD",
  "de-DE": "EUR", "de-AT": "EUR", "de-CH": "CHF",
  "it-IT": "EUR", "nl-NL": "EUR", "pl-PL": "PLN",
  "ru-RU": "RUB", "ja-JP": "JPY", "ko-KR": "KRW",
  "zh-CN": "CNY", "zh-TW": "TWD", "zh-HK": "HKD",
  "tr-TR": "TRY", "sv-SE": "SEK", "no-NO": "NOK", "da-DK": "DKK",
};

// Fallback by language prefix
const LANG_CURRENCY: Record<string, string> = {
  en: "USD", es: "USD", pt: "BRL", fr: "EUR", de: "EUR",
  it: "EUR", nl: "EUR", ru: "RUB", ja: "JPY", ko: "KRW",
  zh: "CNY", tr: "TRY", sv: "SEK", no: "NOK", da: "DKK",
  pl: "PLN", ar: "USD",
};

export function getCurrency(browserLocale?: string): string {
  const loc = browserLocale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
  return LOCALE_CURRENCY[loc] ?? LANG_CURRENCY[loc.split("-")[0]] ?? "USD";
}

export function formatPrice(amount: number, currency: string, browserLocale?: string): string {
  const loc = browserLocale ?? (typeof navigator !== "undefined" ? navigator.language : "en-US");
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Language detection ───────────────────────────────────────────────────────
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "es";
  const lang = navigator.language?.split("-")[0]?.toLowerCase();
  if (lang === "en") return "en";
  return "es"; // default Spanish
}

// ─── Translations ─────────────────────────────────────────────────────────────
export interface T {
  nav: {
    editor: string; converter: string; tools: string; pricing: string;
    signIn: string; signOut: string; myProfile: string; pdfEditor: string; converter2: string;
  };
  home: {
    badge: string; heading1: string; heading2: string; subtitle: string;
    ctaStart: string; ctaConvert: string;
    featuresLabel: string; featuresTitle: string; featuresSubtitle: string;
    processLabel: string; processTitle: string; processSubtitle: string;
    step1Title: string; step1Desc: string;
    step2Title: string; step2Desc: string;
    step3Title: string; step3Desc: string;
    formatsLabel: string; formatsTitle: string;
    pricingLabel: string; pricingTitle: string; pricingSubtitle: string;
    freeTier: string; freeDesc: string; freeOps: (n: number) => string; freeSize: (n: number) => string; freeFeatures: string; freeLocked: string;
    premiumTier: string; premiumDesc: string; premiumOps: string; premiumSize: (n: number) => string; premiumFeatures: string; premiumShare: string;
    freeCta: string; premiumCta: string; popularBadge: string;
    ctaTitle: (name?: string) => string; ctaSubtitle: (loggedIn: boolean) => string;
    goEditor: string; goConverter: string;
    footerRights: string; footerStatus: string;
  };
  pricing: {
    badge: string; title: string; subtitle: string;
    demoPremium: string; demoBack: string; demoTry: string;
    demoActivated: string; demoRestored: string;
    freeTier: string; freeDesc: string; freeCta: string;
    premiumTier: string; premiumDesc: string; premiumCta: string; premiumActive: string;
    popularBadge: string; perMonth: string;
    freeFeatures: string[]; premiumFeatures: string[];
    tableTitle: string; tableFeature: string; tableFree: string; tablePremium: string;
    tableRows: [string, string, string][];
    faqTitle: string;
    faq: { q: string; a: string }[];
    ctaTitle: string; ctaSubtitle: string; ctaBtn: string;
  };
  gate: {
    modalTitle: (featureName: string) => string;
    modalDesc: string; modalCta: string;
    bannerFree: (used: number, limit: number) => string;
    bannerPremium: string; bannerLimit: string;
    limitTitle: string; limitDesc: (limit: number) => string; limitCta: string;
    fileSizeTitle: string; fileSizeDesc: (maxMb: number) => string; fileSizeCta: string;
  };
  support: {
    badge: string; title: string; subtitle: string;
    emailLabel: string; emailPlaceholder: string;
    subjectLabel: string; subjectPlaceholder: string;
    messageLabel: string; messagePlaceholder: string;
    send: string; sending: string; sent: string; sentDesc: string;
    directEmail: string; responseTime: string;
    faqTitle: string;
    faq: { q: string; a: string }[];
    navLink: string;
  };
}

// ─── Spanish ──────────────────────────────────────────────────────────────────
const es: T = {
  nav: {
    editor: "Editor", converter: "Convertidor", tools: "Herramientas",
    pricing: "Precios", signIn: "Iniciar sesión", signOut: "Cerrar sesión",
    myProfile: "Mi Perfil", pdfEditor: "Editor de PDF", converter2: "Convertidor",
  },
  home: {
    badge: "Powered by Claude AI · Gratis para empezar",
    heading1: "Edita y Convierte", heading2: "PDFs al instante",
    subtitle: "La herramienta más rápida para editar texto, convertir formatos y mejorar documentos con inteligencia artificial.",
    ctaStart: "🚀 Empezar gratis", ctaConvert: "🔄 Convertir PDF",
    featuresLabel: "Herramientas", featuresTitle: "Todo lo que necesitas", featuresSubtitle: "Tres herramientas poderosas en una sola plataforma",
    processLabel: "Proceso", processTitle: "Así de fácil", processSubtitle: "Tres pasos para transformar tus documentos",
    step1Title: "Sube tu PDF", step1Desc: "Arrastra o selecciona tu archivo.",
    step2Title: "Edita o Convierte", step2Desc: "Modifica texto, fuentes o cambia de formato.",
    step3Title: "Descarga listo", step3Desc: "Tu archivo procesado al instante.",
    formatsLabel: "Compatibilidad", formatsTitle: "Formatos soportados",
    pricingLabel: "Planes", pricingTitle: "Simple y transparente", pricingSubtitle: "Empieza gratis. Sin tarjeta de crédito.",
    freeTier: "Gratuito", freeDesc: "Para explorar y uso ocasional.",
    freeOps: (n: number) => `${n} operaciones por día`,
    freeSize: (n: number) => `Archivos hasta ${n} MB`,
    freeFeatures: "Conversión, edición, dividir/comprimir",
    freeLocked: "OCR, IA, marca de agua, lote...",
    premiumTier: "Premium", premiumDesc: "Para productividad sin límites.",
    premiumOps: "Operaciones ilimitadas",
    premiumSize: (n: number) => `Archivos hasta ${n} MB`,
    premiumFeatures: "OCR · IA · Marca de agua · Lote",
    premiumShare: "Compartir con enlace público",
    freeCta: "Empezar gratis →", premiumCta: "👑 Ver Premium →", popularBadge: "⭐ Más popular",
    ctaTitle: (name?: string) => name ? `Listo, ${name} 🚀` : "¿Listo para empezar?",
    ctaSubtitle: (loggedIn: boolean) => loggedIn ? "Tus herramientas están esperando." : "Sin registro obligatorio. Sin tarjeta de crédito. Sube y transforma.",
    goEditor: "✏️ Ir al Editor", goConverter: "🔄 Ir al Convertidor",
    footerRights: "© 2025 DocuFlow · Todos los derechos reservados",
    footerStatus: "Todos los sistemas operativos",
  },
  pricing: {
    badge: "👑 Planes y Precios", title: "Elige tu plan",
    subtitle: "Empieza gratis. Actualiza cuando necesites más potencia.",
    demoPremium: "👑 Estás en modo <strong>Premium Demo</strong>.",
    demoBack: "Volver al plan gratuito",
    demoTry: "🔍 ¿Quieres probar Premium?",
    demoActivated: "✅ Plan Premium activado en modo demo. Recarga cualquier herramienta para verlo activo.",
    demoRestored: "Plan gratuito restaurado.",
    freeTier: "Gratuito", freeDesc: "Para uso ocasional y exploración.", freeCta: "Continuar gratis",
    premiumTier: "Premium", premiumDesc: "Para productividad sin límites.",
    premiumCta: "Activar Premium → (Demo)", premiumActive: "👑 Plan activo",
    popularBadge: "⭐ Más popular", perMonth: "/ mes",
    freeFeatures: [
      `{limit} operaciones por día`, `Archivos hasta {freeMB} MB`,
      "Conversión de formato (1 archivo)", "Editor de texto PDF",
      "Fusionar hasta 2 PDFs", "Dividir y comprimir PDFs",
      "Conversión en lote", "OCR (texto desde imágenes)",
      "Mejora con IA (Claude)", "Marca de agua personalizada",
      "Compartir con enlace", `Archivos hasta {premiumMB} MB`,
    ],
    premiumFeatures: [
      "Operaciones ilimitadas", `Archivos hasta {premiumMB} MB`,
      "Conversión en lote (múltiples archivos)", "Editor de texto PDF completo",
      "Fusionar PDFs sin límite", "Dividir y comprimir PDFs",
      "OCR (texto desde imágenes)", "Mejora con IA (Claude)",
      "Marca de agua personalizada", "Compartir con enlace público",
      "Soporte prioritario", "Nuevas funciones antes que nadie",
    ],
    tableTitle: "Comparativa completa",
    tableFeature: "Función", tableFree: "Gratuito", tablePremium: "Premium",
    tableRows: [
      ["Operaciones diarias", "{limit}", "Ilimitadas"],
      ["Tamaño de archivo", "{freeMB} MB", "{premiumMB} MB"],
      ["Conversión de archivos", "1 a la vez", "En lote"],
      ["Todos los formatos", "✓", "✓"],
      ["Editor de texto PDF", "✓", "✓"],
      ["Dividir y comprimir PDF", "✓", "✓"],
      ["Fusionar PDFs", "Hasta 2", "Ilimitados"],
      ["OCR", "—", "✓"],
      ["Mejora con IA", "—", "✓"],
      ["Marca de agua", "—", "✓"],
      ["Compartir con enlace", "—", "✓"],
      ["Soporte", "Comunidad", "Prioritario"],
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Puedo cancelar en cualquier momento?", a: "Sí. Cancelas cuando quieras desde tu perfil, sin cargos adicionales." },
      { q: "¿Mis archivos están seguros?", a: "Todos los archivos se procesan en tu sesión y se eliminan automáticamente del servidor después de la descarga." },
      { q: "¿Qué pasa con mis conversiones si vuelvo al plan gratuito?", a: "Conservas todos los archivos que ya descargaste. Solo se aplican los límites del plan gratuito en nuevas operaciones." },
      { q: "¿Hay período de prueba?", a: "Puedes explorar todas las funciones premium durante 7 días de forma gratuita activando el modo demo desde esta página." },
    ],
    ctaTitle: "¿Listo para más potencia?",
    ctaSubtitle: "Activa el demo y descubre todo lo que Premium tiene para ti.",
    ctaBtn: "👑 Probar Premium gratis →",
  },
  gate: {
    modalTitle: (f) => `${f} · Función Premium`,
    modalDesc: "Actualiza tu plan para desbloquear esta función y muchas más.",
    modalCta: "Ver planes y precios →",
    bannerFree: (used, limit) => `${used} / ${limit} operaciones usadas hoy`,
    bannerPremium: "👑 Premium · Sin límites",
    bannerLimit: "Has alcanzado el límite diario",
    limitTitle: "Límite diario alcanzado",
    limitDesc: (n) => `El plan gratuito incluye ${n} operaciones por día. Actualiza para continuar sin límites.`,
    limitCta: "Ver planes →",
    fileSizeTitle: "Archivo demasiado grande",
    fileSizeDesc: (mb) => `El plan gratuito admite archivos de hasta ${mb} MB. Actualiza para subir archivos más grandes.`,
    fileSizeCta: "Ver planes →",
  },
  support: {
    badge: "💬 Soporte",
    title: "¿Necesitas ayuda?",
    subtitle: "Estamos aquí para ayudarte. Cuéntanos tu problema y te responderemos lo antes posible.",
    emailLabel: "Tu correo electrónico",
    emailPlaceholder: "tu@email.com",
    subjectLabel: "Asunto",
    subjectPlaceholder: "Describe brevemente tu problema",
    messageLabel: "Mensaje",
    messagePlaceholder: "Cuéntanos con detalle qué está pasando...",
    send: "Enviar mensaje",
    sending: "Enviando...",
    sent: "¡Mensaje enviado!",
    sentDesc: "Hemos recibido tu mensaje. Te responderemos en menos de 24 horas.",
    directEmail: "O escríbenos directamente a",
    responseTime: "⏱ Tiempo de respuesta: menos de 24 h",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { q: "¿Por qué no puedo subir mi archivo?", a: "El plan gratuito admite archivos de hasta 5 MB. Si tu archivo es mayor, actualiza a Premium o comprime el PDF antes de subirlo." },
      { q: "Se me acabaron las operaciones diarias", a: "El plan gratuito incluye 4 operaciones al día. El contador se reinicia automáticamente a medianoche. También puedes activar Premium para tener operaciones ilimitadas." },
      { q: "La conversión falló o el resultado tiene errores", a: "Algunos PDFs con elementos especiales (formularios, firmas digitales) pueden causar problemas. Intenta con otro formato de destino o contáctanos con el archivo." },
      { q: "¿Mis archivos están seguros?", a: "Sí. Los archivos se procesan en tu sesión y se eliminan del servidor automáticamente tras la descarga." },
      { q: "No recuerdo mi contraseña / no puedo iniciar sesión", a: "DocuFlow usa Google como proveedor de identidad. Usa el mismo correo Google con el que te registraste." },
    ],
    navLink: "Soporte",
  },
};

// ─── English ──────────────────────────────────────────────────────────────────
const en: T = {
  nav: {
    editor: "Editor", converter: "Converter", tools: "Tools",
    pricing: "Pricing", signIn: "Sign in", signOut: "Sign out",
    myProfile: "My Profile", pdfEditor: "PDF Editor", converter2: "Converter",
  },
  home: {
    badge: "Powered by Claude AI · Free to start",
    heading1: "Edit and Convert", heading2: "PDFs instantly",
    subtitle: "The fastest tool to edit text, convert formats and improve documents with artificial intelligence.",
    ctaStart: "🚀 Start for free", ctaConvert: "🔄 Convert PDF",
    featuresLabel: "Tools", featuresTitle: "Everything you need", featuresSubtitle: "Three powerful tools in one platform",
    processLabel: "Process", processTitle: "That easy", processSubtitle: "Three steps to transform your documents",
    step1Title: "Upload your PDF", step1Desc: "Drag or select your file.",
    step2Title: "Edit or Convert", step2Desc: "Modify text, fonts or change format.",
    step3Title: "Download ready", step3Desc: "Your processed file instantly.",
    formatsLabel: "Compatibility", formatsTitle: "Supported formats",
    pricingLabel: "Plans", pricingTitle: "Simple and transparent", pricingSubtitle: "Start free. No credit card required.",
    freeTier: "Free", freeDesc: "For occasional use and exploration.",
    freeOps: (n: number) => `${n} operations per day`,
    freeSize: (n: number) => `Files up to ${n} MB`,
    freeFeatures: "Conversion, editing, split/compress",
    freeLocked: "OCR, AI, watermark, batch...",
    premiumTier: "Premium", premiumDesc: "For unlimited productivity.",
    premiumOps: "Unlimited operations",
    premiumSize: (n: number) => `Files up to ${n} MB`,
    premiumFeatures: "OCR · AI · Watermark · Batch",
    premiumShare: "Share with public link",
    freeCta: "Start free →", premiumCta: "👑 View Premium →", popularBadge: "⭐ Most popular",
    ctaTitle: (name?: string) => name ? `Ready, ${name} 🚀` : "Ready to get started?",
    ctaSubtitle: (loggedIn: boolean) => loggedIn ? "Your tools are waiting." : "No sign-up required. No credit card. Upload and transform.",
    goEditor: "✏️ Go to Editor", goConverter: "🔄 Go to Converter",
    footerRights: "© 2025 DocuFlow · All rights reserved",
    footerStatus: "All systems operational",
  },
  pricing: {
    badge: "👑 Plans & Pricing", title: "Choose your plan",
    subtitle: "Start free. Upgrade when you need more power.",
    demoPremium: "👑 You're on <strong>Premium Demo</strong> mode.",
    demoBack: "Switch back to free plan",
    demoTry: "🔍 Want to try Premium?",
    demoActivated: "✅ Premium plan activated in demo mode. Reload any tool to see it active.",
    demoRestored: "Free plan restored.",
    freeTier: "Free", freeDesc: "For occasional use and exploration.", freeCta: "Continue free",
    premiumTier: "Premium", premiumDesc: "For unlimited productivity.",
    premiumCta: "Activate Premium → (Demo)", premiumActive: "👑 Plan active",
    popularBadge: "⭐ Most popular", perMonth: "/ mo",
    freeFeatures: [
      `{limit} operations per day`, `Files up to {freeMB} MB`,
      "Format conversion (1 file)", "PDF text editor",
      "Merge up to 2 PDFs", "Split and compress PDFs",
      "Batch conversion", "OCR (text from images)",
      "AI improvement (Claude)", "Custom watermark",
      "Share with link", `Files up to {premiumMB} MB`,
    ],
    premiumFeatures: [
      "Unlimited operations", `Files up to {premiumMB} MB`,
      "Batch conversion (multiple files)", "Full PDF text editor",
      "Merge unlimited PDFs", "Split and compress PDFs",
      "OCR (text from images)", "AI improvement (Claude)",
      "Custom watermark", "Share with public link",
      "Priority support", "New features first",
    ],
    tableTitle: "Full comparison",
    tableFeature: "Feature", tableFree: "Free", tablePremium: "Premium",
    tableRows: [
      ["Daily operations", "{limit}", "Unlimited"],
      ["File size", "{freeMB} MB", "{premiumMB} MB"],
      ["File conversion", "1 at a time", "Batch"],
      ["All formats", "✓", "✓"],
      ["PDF text editor", "✓", "✓"],
      ["Split & compress PDF", "✓", "✓"],
      ["Merge PDFs", "Up to 2", "Unlimited"],
      ["OCR", "—", "✓"],
      ["AI improvement", "—", "✓"],
      ["Watermark", "—", "✓"],
      ["Share with link", "—", "✓"],
      ["Support", "Community", "Priority"],
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Can I cancel at any time?", a: "Yes. Cancel whenever you want from your profile, with no extra charges." },
      { q: "Are my files safe?", a: "All files are processed in your session and automatically deleted from the server after download." },
      { q: "What happens to my conversions if I return to the free plan?", a: "You keep all files you already downloaded. Only free plan limits apply to new operations." },
      { q: "Is there a trial period?", a: "You can explore all premium features for 7 days for free by activating demo mode from this page." },
    ],
    ctaTitle: "Ready for more power?",
    ctaSubtitle: "Activate the demo and discover everything Premium has to offer.",
    ctaBtn: "👑 Try Premium free →",
  },
  gate: {
    modalTitle: (f) => `${f} · Premium Feature`,
    modalDesc: "Upgrade your plan to unlock this feature and many more.",
    modalCta: "View plans and pricing →",
    bannerFree: (used, limit) => `${used} / ${limit} operations used today`,
    bannerPremium: "👑 Premium · No limits",
    bannerLimit: "You've reached the daily limit",
    limitTitle: "Daily limit reached",
    limitDesc: (n) => `The free plan includes ${n} operations per day. Upgrade to continue without limits.`,
    limitCta: "View plans →",
    fileSizeTitle: "File too large",
    fileSizeDesc: (mb) => `The free plan supports files up to ${mb} MB. Upgrade to upload larger files.`,
    fileSizeCta: "View plans →",
  },
  support: {
    badge: "💬 Support",
    title: "Need help?",
    subtitle: "We're here for you. Tell us your issue and we'll get back to you as soon as possible.",
    emailLabel: "Your email address",
    emailPlaceholder: "you@email.com",
    subjectLabel: "Subject",
    subjectPlaceholder: "Briefly describe your issue",
    messageLabel: "Message",
    messagePlaceholder: "Tell us in detail what's happening...",
    send: "Send message",
    sending: "Sending...",
    sent: "Message sent!",
    sentDesc: "We've received your message. We'll reply within 24 hours.",
    directEmail: "Or email us directly at",
    responseTime: "⏱ Response time: under 24 h",
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Why can't I upload my file?", a: "The free plan supports files up to 5 MB. If your file is larger, upgrade to Premium or compress the PDF before uploading." },
      { q: "I ran out of daily operations", a: "The free plan includes 4 operations per day. The counter resets automatically at midnight. You can also activate Premium for unlimited operations." },
      { q: "The conversion failed or the result has errors", a: "Some PDFs with special elements (forms, digital signatures) can cause issues. Try a different target format or contact us with the file." },
      { q: "Are my files safe?", a: "Yes. Files are processed in your session and automatically deleted from the server after download." },
      { q: "I can't log in / forgot my password", a: "DocuFlow uses Google as the identity provider. Use the same Google account you signed up with." },
    ],
    navLink: "Support",
  },
};

export const translations: Record<Locale, T> = { es, en };

/** Replaces {limit}, {freeMB}, {premiumMB} template tokens */
export function tpl(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
