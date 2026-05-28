"use client";

import Link from "next/link";
import { useLocale } from "../../components/LocaleProvider";

export default function PrivacyPage() {
  const { locale } = useLocale();
  const isEs = locale === "es";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors">
            ← {isEs ? "Volver al inicio" : "Back to home"}
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold mb-4">
            🔒 {isEs ? "Privacidad" : "Privacy"}
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            {isEs ? "Política de Privacidad y Protección de Datos" : "Privacy Policy & Data Protection"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEs ? "Última actualización: enero 2025" : "Last updated: January 2025"}
          </p>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5">
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
              {isEs
                ? "En DocuFlow nos tomamos muy en serio la privacidad de tus datos. Esta política explica qué información recopilamos, cómo la usamos y los derechos que tienes sobre ella, de conformidad con el Reglamento General de Protección de Datos (RGPD) y demás normativa aplicable."
                : "At DocuFlow we take your data privacy seriously. This policy explains what information we collect, how we use it, and your rights regarding it, in compliance with the General Data Protection Regulation (GDPR) and other applicable regulations."}
            </p>
          </div>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "1. Responsable del tratamiento" : "1. Data Controller"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "El responsable del tratamiento de tus datos personales es DocuFlow. Para cualquier consulta relacionada con la privacidad, puedes contactarnos a través de nuestra página de soporte."
                : "The data controller for your personal data is DocuFlow. For any privacy-related inquiries, you can contact us through our support page."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "2. Datos que recopilamos" : "2. Data We Collect"}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {isEs ? "Datos de cuenta (si te registras):" : "Account data (if you register):"}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {(isEs ? [
                    "Nombre y dirección de correo electrónico (proporcionados por Google OAuth).",
                    "Foto de perfil pública de tu cuenta Google.",
                    "Información del plan de suscripción (gratuito o Premium).",
                  ] : [
                    "Name and email address (provided by Google OAuth).",
                    "Public profile photo from your Google account.",
                    "Subscription plan information (free or Premium).",
                  ]).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-purple-500 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {isEs ? "Datos de uso:" : "Usage data:"}
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {(isEs ? [
                    "Tipo de operaciones realizadas (conversión, edición, etc.) para estadísticas internas.",
                    "Datos técnicos básicos: tipo de navegador, sistema operativo, dirección IP anonimizada.",
                    "Cookies de sesión y preferencias (idioma, modo oscuro).",
                  ] : [
                    "Type of operations performed (conversion, editing, etc.) for internal statistics.",
                    "Basic technical data: browser type, operating system, anonymized IP address.",
                    "Session and preference cookies (language, dark mode).",
                  ]).map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-purple-500 shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {isEs ? "Archivos:" : "Files:"}
                </h3>
                <p className="text-sm leading-relaxed">
                  {isEs
                    ? "Los archivos que subes se procesan en memoria durante tu sesión y se eliminan automáticamente del servidor tras la descarga o al cerrar la sesión. No almacenamos permanentemente el contenido de tus documentos."
                    : "Files you upload are processed in memory during your session and automatically deleted from the server after download or when you close your session. We do not permanently store the content of your documents."}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "3. Finalidad del tratamiento" : "3. Purpose of Processing"}
            </h2>
            <ul className="space-y-2 text-sm">
              {(isEs ? [
                "Prestación del servicio de edición y conversión de documentos.",
                "Gestión de la cuenta de usuario y autenticación.",
                "Procesamiento de pagos del plan Premium (a través de Stripe).",
                "Envío de comunicaciones relacionadas con el servicio (cambios relevantes, soporte).",
                "Mejora del servicio mediante análisis estadístico anonimizado.",
                "Cumplimiento de obligaciones legales.",
              ] : [
                "Provision of the document editing and conversion service.",
                "User account management and authentication.",
                "Processing Premium plan payments (via Stripe).",
                "Sending service-related communications (relevant changes, support).",
                "Service improvement through anonymized statistical analysis.",
                "Compliance with legal obligations.",
              ]).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-green-500 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "4. Base legal del tratamiento" : "4. Legal Basis for Processing"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "El tratamiento de tus datos se basa en: (a) la ejecución del contrato de servicio; (b) tu consentimiento explícito para cookies analíticas; (c) el interés legítimo en mejorar el servicio; y (d) el cumplimiento de obligaciones legales."
                : "The processing of your data is based on: (a) the performance of the service contract; (b) your explicit consent for analytical cookies; (c) legitimate interest in improving the service; and (d) compliance with legal obligations."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "5. Cookies" : "5. Cookies"}
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              {isEs
                ? "DocuFlow utiliza los siguientes tipos de cookies:"
                : "DocuFlow uses the following types of cookies:"}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="text-left px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 rounded-tl-lg">
                      {isEs ? "Tipo" : "Type"}
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">
                      {isEs ? "Finalidad" : "Purpose"}
                    </th>
                    <th className="text-left px-4 py-2 font-semibold text-gray-800 dark:text-gray-200 rounded-tr-lg">
                      {isEs ? "Necesaria" : "Required"}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(isEs ? [
                    ["Sesión", "Mantener tu sesión iniciada", "Sí"],
                    ["Preferencias", "Guardar idioma y tema", "Sí"],
                    ["Analíticas", "Estadísticas de uso anónimas", "No"],
                  ] : [
                    ["Session", "Keep you logged in", "Yes"],
                    ["Preferences", "Save language and theme", "Yes"],
                    ["Analytics", "Anonymous usage statistics", "No"],
                  ]).map(([type, purpose, required], i) => (
                    <tr key={i} className="bg-white dark:bg-gray-900/50">
                      <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">{type}</td>
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{purpose}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${required === "Sí" || required === "Yes" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                          {required}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "6. Transferencias a terceros" : "6. Third-Party Transfers"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "No vendemos ni alquilamos tus datos personales a terceros. Podemos compartir datos estrictamente necesarios con proveedores de servicios (Stripe para pagos, Google para autenticación) bajo acuerdos de protección de datos conformes al RGPD."
                : "We do not sell or rent your personal data to third parties. We may share strictly necessary data with service providers (Stripe for payments, Google for authentication) under data protection agreements compliant with GDPR."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "7. Tus derechos" : "7. Your Rights"}
            </h2>
            <p className="leading-relaxed text-sm mb-3">
              {isEs
                ? "De acuerdo con la normativa de protección de datos, tienes los siguientes derechos:"
                : "Under data protection regulations, you have the following rights:"}
            </p>
            <ul className="space-y-2 text-sm">
              {(isEs ? [
                ["Acceso", "Solicitar una copia de los datos que tenemos sobre ti."],
                ["Rectificación", "Corregir datos inexactos o incompletos."],
                ["Supresión", "Solicitar la eliminación de tus datos («derecho al olvido»)."],
                ["Portabilidad", "Recibir tus datos en un formato estructurado."],
                ["Oposición", "Oponerte al tratamiento de tus datos para fines específicos."],
                ["Limitación", "Solicitar la restricción del tratamiento de tus datos."],
              ] : [
                ["Access", "Request a copy of the data we hold about you."],
                ["Rectification", "Correct inaccurate or incomplete data."],
                ["Erasure", "Request deletion of your data ('right to be forgotten')."],
                ["Portability", "Receive your data in a structured format."],
                ["Objection", "Object to the processing of your data for specific purposes."],
                ["Restriction", "Request restriction of the processing of your data."],
              ]).map(([right, desc], i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0">{right}:</span>
                  <span>{desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm mt-4 leading-relaxed">
              {isEs
                ? "Para ejercer cualquiera de estos derechos, contacta con nosotros a través de "
                : "To exercise any of these rights, contact us through "}
              <Link href="/support" className="text-blue-600 hover:underline font-medium">
                {isEs ? "nuestra página de soporte" : "our support page"}.
              </Link>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "8. Conservación de datos" : "8. Data Retention"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "Los datos de cuenta se conservan mientras la cuenta esté activa. Puedes eliminar tu cuenta en cualquier momento desde tu perfil, lo que conllevará la supresión de todos tus datos personales en un plazo máximo de 30 días, salvo obligación legal de conservación."
                : "Account data is retained while the account is active. You can delete your account at any time from your profile, which will result in the deletion of all your personal data within a maximum of 30 days, unless legally required to retain it."}
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
          </Link>
          <Link href="/legal" className="hover:text-blue-600 transition-colors">
            {isEs ? "Aviso Legal" : "Legal Notice"}
          </Link>
          <Link href="/support" className="hover:text-blue-600 transition-colors">
            {isEs ? "Soporte" : "Support"}
          </Link>
        </div>
      </div>
    </div>
  );
}
