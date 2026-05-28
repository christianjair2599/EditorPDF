"use client";

import Link from "next/link";
import { useLocale } from "../../components/LocaleProvider";

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold mb-4">
            📄 {isEs ? "Documento legal" : "Legal document"}
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEs ? "Última actualización: enero 2025" : "Last updated: January 2025"}
          </p>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none space-y-8 text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "1. Aceptación de los términos" : "1. Acceptance of Terms"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "Al acceder y utilizar DocuFlow, aceptas estar sujeto a estos Términos y Condiciones de uso. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestro servicio. DocuFlow se reserva el derecho de modificar estos términos en cualquier momento, siendo responsabilidad del usuario revisarlos periódicamente."
                : "By accessing and using DocuFlow, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you must not use our service. DocuFlow reserves the right to modify these terms at any time, and it is the user's responsibility to review them periodically."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "2. Descripción del servicio" : "2. Description of Service"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "DocuFlow es una plataforma web que ofrece herramientas para la edición, conversión y manipulación de documentos PDF y otros formatos. El servicio se ofrece en dos modalidades: plan gratuito con limitaciones de uso y plan Premium con funcionalidades avanzadas."
                : "DocuFlow is a web platform offering tools for editing, converting, and manipulating PDF documents and other formats. The service is offered in two tiers: a free plan with usage limitations and a Premium plan with advanced features."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "3. Uso aceptable" : "3. Acceptable Use"}
            </h2>
            <p className="leading-relaxed mb-3">
              {isEs
                ? "Al usar DocuFlow, te comprometes a:"
                : "By using DocuFlow, you agree to:"}
            </p>
            <ul className="space-y-2 list-none pl-0">
              {(isEs ? [
                "No utilizar el servicio para procesar contenido ilegal, difamatorio, obsceno o que infrinja derechos de terceros.",
                "No intentar eludir los límites del plan gratuito mediante medios técnicos.",
                "No realizar ingeniería inversa, descompilar o intentar obtener el código fuente de la plataforma.",
                "No utilizar el servicio para enviar spam o contenido malicioso.",
                "Respetar los derechos de propiedad intelectual de los documentos que procesas.",
              ] : [
                "Not use the service to process illegal, defamatory, obscene content, or content that infringes third-party rights.",
                "Not attempt to circumvent free plan limits through technical means.",
                "Not reverse engineer, decompile, or attempt to obtain the platform's source code.",
                "Not use the service to send spam or malicious content.",
                "Respect the intellectual property rights of documents you process.",
              ]).map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "4. Privacidad y archivos" : "4. Privacy and Files"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "Los archivos que subas a DocuFlow se procesan en tu sesión activa y se eliminan automáticamente de nuestros servidores una vez completada la operación o al cerrar la sesión. No almacenamos permanentemente el contenido de tus documentos ni los compartimos con terceros, salvo obligación legal."
                : "Files you upload to DocuFlow are processed within your active session and automatically deleted from our servers once the operation is complete or when you close your session. We do not permanently store the content of your documents nor share them with third parties, except as required by law."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "5. Planes y pagos" : "5. Plans and Payments"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "El plan Premium de DocuFlow se factura mensualmente. Puedes cancelar en cualquier momento desde tu perfil; la cancelación tendrá efecto al término del período de facturación actual. No se realizan reembolsos por períodos parciales. Los precios pueden actualizarse con un aviso previo de 30 días."
                : "DocuFlow's Premium plan is billed monthly. You may cancel at any time from your profile; cancellation takes effect at the end of the current billing period. No refunds are issued for partial periods. Prices may be updated with 30 days prior notice."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "6. Limitación de responsabilidad" : "6. Limitation of Liability"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "DocuFlow se proporciona «tal cual» y «según disponibilidad». No garantizamos que el servicio sea ininterrumpido o libre de errores. En ningún caso DocuFlow será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de usar el servicio."
                : "DocuFlow is provided \"as is\" and \"as available\". We do not warrant that the service will be uninterrupted or error-free. In no event shall DocuFlow be liable for indirect, incidental, special, or consequential damages arising from the use or inability to use the service."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "7. Propiedad intelectual" : "7. Intellectual Property"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "Todo el contenido de DocuFlow (logotipos, diseño, código, textos) es propiedad de DocuFlow y está protegido por las leyes de propiedad intelectual. Los usuarios conservan la propiedad de los documentos que procesan a través del servicio."
                : "All content on DocuFlow (logos, design, code, texts) is the property of DocuFlow and is protected by intellectual property laws. Users retain ownership of the documents they process through the service."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "8. Ley aplicable" : "8. Governing Law"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "Estos términos se rigen por la legislación aplicable. Cualquier disputa será resuelta mediante arbitraje o en los tribunales competentes de la jurisdicción correspondiente."
                : "These terms are governed by applicable law. Any dispute will be resolved through arbitration or before the competent courts of the relevant jurisdiction."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "9. Contacto" : "9. Contact"}
            </h2>
            <p className="leading-relaxed">
              {isEs
                ? "Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos a través de nuestra página de "
                : "If you have questions about these Terms and Conditions, you can contact us through our "}
              <Link href="/support" className="text-blue-600 hover:underline font-medium">
                {isEs ? "soporte" : "support page"}.
              </Link>
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            {isEs ? "Privacidad de Datos" : "Data Privacy"}
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
