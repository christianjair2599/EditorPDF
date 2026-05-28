"use client";

import Link from "next/link";
import { useLocale } from "../../components/LocaleProvider";

export default function LegalPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold mb-4">
            ⚖️ {isEs ? "Información legal" : "Legal information"}
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">
            {isEs ? "Aviso Legal" : "Legal Notice"}
          </h1>
          <p className="text-gray-500 text-sm">
            {isEs ? "Última actualización: enero 2025" : "Last updated: January 2025"}
          </p>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "1. Identificación del titular" : "1. Owner Identification"}
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="text-gray-400 w-32 shrink-0">{isEs ? "Servicio" : "Service"}</span>
                <span className="font-medium text-gray-900 dark:text-white">DocuFlow</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-32 shrink-0">{isEs ? "Actividad" : "Activity"}</span>
                <span>{isEs ? "Plataforma de edición y conversión de documentos" : "Document editing and conversion platform"}</span>
              </div>
              <div className="flex gap-3">
                <span className="text-gray-400 w-32 shrink-0">{isEs ? "Contacto" : "Contact"}</span>
                <Link href="/support" className="text-blue-600 hover:underline">
                  {isEs ? "Formulario de soporte" : "Support form"}
                </Link>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "2. Objeto y ámbito de aplicación" : "2. Purpose and Scope"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "El presente Aviso Legal regula el acceso y uso del sitio web DocuFlow, disponible en el dominio correspondiente. El acceso a este sitio web implica el conocimiento y la aceptación de las condiciones aquí recogidas."
                : "This Legal Notice governs access to and use of the DocuFlow website, available at the corresponding domain. Accessing this website implies knowledge and acceptance of the conditions set forth herein."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "3. Propiedad intelectual e industrial" : "3. Intellectual and Industrial Property"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "Todos los contenidos del sitio web de DocuFlow (textos, gráficos, logotipos, iconos, imágenes, código fuente, diseño y arquitectura de navegación) son propiedad exclusiva de DocuFlow o de terceros que han autorizado su uso, y están protegidos por las leyes nacionales e internacionales de propiedad intelectual e industrial."
                : "All content on the DocuFlow website (texts, graphics, logos, icons, images, source code, design, and navigation architecture) is the exclusive property of DocuFlow or third parties who have authorized its use, and is protected by national and international intellectual and industrial property laws."}
            </p>
            <p className="leading-relaxed text-sm mt-3">
              {isEs
                ? "Queda expresamente prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra forma de explotación de estos contenidos sin autorización expresa y por escrito de DocuFlow."
                : "The reproduction, distribution, public communication, transformation, or any other form of exploitation of this content without the express written authorization of DocuFlow is expressly prohibited."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "4. Exclusión de garantías y responsabilidad" : "4. Disclaimer of Warranties and Liability"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "DocuFlow no garantiza la disponibilidad y continuidad del funcionamiento del sitio web ni que el sitio esté libre de errores. DocuFlow excluye, hasta donde permite la ley, cualquier responsabilidad por los daños y perjuicios de toda naturaleza que puedan deberse a:"
                : "DocuFlow does not guarantee the availability and continuity of the website's operation or that the site is error-free. DocuFlow excludes, to the extent permitted by law, any liability for damages of any kind that may arise from:"}
            </p>
            <ul className="space-y-2 text-sm mt-3">
              {(isEs ? [
                "La falta de disponibilidad, mantenimiento y efectivo funcionamiento del sitio.",
                "La falta de utilidad, adecuación o validez del sitio para satisfacer necesidades, actividades o resultados concretos.",
                "El contenido de los documentos procesados por los usuarios.",
                "Virus u otros elementos en los archivos transmitidos.",
              ] : [
                "Lack of availability, maintenance, and effective operation of the site.",
                "Lack of utility, adequacy, or validity of the site to meet specific needs, activities, or results.",
                "The content of documents processed by users.",
                "Viruses or other elements in transmitted files.",
              ]).map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-400 shrink-0">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "5. Política de enlaces" : "5. Link Policy"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "DocuFlow puede incluir enlaces a sitios web de terceros. Estos enlaces se proporcionan únicamente por conveniencia. DocuFlow no controla el contenido de esos sitios y no asume ninguna responsabilidad respecto a los mismos ni a los daños que puedan derivarse de su acceso."
                : "DocuFlow may include links to third-party websites. These links are provided solely for convenience. DocuFlow does not control the content of those sites and assumes no responsibility for them or for any damages that may result from accessing them."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "6. Modificaciones" : "6. Modifications"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "DocuFlow se reserva el derecho de modificar, en cualquier momento, la presentación y configuración del sitio web, así como el presente Aviso Legal. Los cambios entrarán en vigor desde el momento de su publicación en el sitio web."
                : "DocuFlow reserves the right to modify, at any time, the presentation and configuration of the website as well as this Legal Notice. Changes will take effect from the moment of their publication on the website."}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {isEs ? "7. Legislación aplicable y jurisdicción" : "7. Applicable Law and Jurisdiction"}
            </h2>
            <p className="leading-relaxed text-sm">
              {isEs
                ? "El presente Aviso Legal se rige por la legislación vigente aplicable. Para la resolución de cualquier controversia o conflicto que se derive del acceso o uso del sitio web, las partes se someten a la jurisdicción de los tribunales competentes, renunciando expresamente a cualquier otro fuero que pudiera corresponderles."
                : "This Legal Notice is governed by applicable current legislation. For the resolution of any dispute or conflict arising from access to or use of the website, the parties submit to the jurisdiction of the competent courts, expressly waiving any other jurisdiction that may apply to them."}
            </p>
          </section>

        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-wrap gap-4 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-blue-600 transition-colors">
            {isEs ? "Términos y Condiciones" : "Terms & Conditions"}
          </Link>
          <Link href="/privacy" className="hover:text-blue-600 transition-colors">
            {isEs ? "Privacidad de Datos" : "Data Privacy"}
          </Link>
          <Link href="/support" className="hover:text-blue-600 transition-colors">
            {isEs ? "Soporte" : "Support"}
          </Link>
        </div>
      </div>
    </div>
  );
}
