"use client";

import { useState, useRef } from "react";
import { mergePdf, splitPdf, compressPdf, ocrPdf, watermarkPdf, shareFile, API_URL } from "../api/upload";
import { addActivity } from "../../lib/activity";
import { canUse, canOperate, incrementOps } from "../../lib/plan";
import { usePremiumGate, DailyUsageBanner } from "../../components/PremiumGate";

type Tool = "merge" | "split" | "compress" | "ocr" | "watermark";
type Alert = { type: "success" | "error"; text: string };

export default function MergeSplitPage() {
  const [activeTool, setActiveTool] = useState<Tool>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<Alert | null>(null);
  const [resultFile, setResultFile] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState(0);
  const [startPage, setStartPage] = useState(0);
  const [endPage, setEndPage] = useState(0);
  const [watermarkText, setWatermarkText] = useState("CONFIDENCIAL");
  const [watermarkColor, setWatermarkColor] = useState("#FF0000");
  const [watermarkSize, setWatermarkSize] = useState(48);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ocrGate       = usePremiumGate("ocr");
  const watermarkGate = usePremiumGate("watermark");
  const shareGate     = usePremiumGate("share");
  const limitGate     = usePremiumGate("daily_limit");

  const getTool = () => {
    switch (activeTool) {
      case "merge":
        return { icon: "🔗", label: "Fusionar PDFs", desc: "Combina múltiples PDFs en uno", color: "from-blue-500 to-cyan-400", button: "bg-blue-600 hover:bg-blue-700" };
      case "split":
        return { icon: "✂️", label: "Dividir PDF", desc: "Extrae páginas específicas", color: "from-orange-500 to-red-400", button: "bg-orange-600 hover:bg-orange-700" };
      case "compress":
        return { icon: "📦", label: "Comprimir PDF", desc: "Reduce el tamaño del archivo", color: "from-green-500 to-emerald-400", button: "bg-green-600 hover:bg-green-700" };
      case "ocr":
        return { icon: "📖", label: "OCR", desc: "Extrae texto de imágenes/PDFs escaneados", color: "from-purple-500 to-pink-400", button: "bg-purple-600 hover:bg-purple-700" };
      case "watermark":
        return { icon: "💧", label: "Marca de agua", desc: "Añade texto diagonal a cada página", color: "from-rose-500 to-pink-400", button: "bg-rose-600 hover:bg-rose-700" };
    }
  };

  const tool = getTool();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  };

  const handleFileSelect = (newFiles: File[]) => {
    const pdfOnly = activeTool === "ocr"
      ? newFiles
      : newFiles.filter((f) => f.type === "application/pdf" || f.name.endsWith(".pdf"));
    if (pdfOnly.length === 0) {
      setAlert({ type: "error", text: "Solo se aceptan archivos PDF." });
      return;
    }

    if (activeTool === "merge") {
      setFiles([...files, ...pdfOnly]);
    } else {
      setFiles([pdfOnly[0]]);
      // Load page count
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const pdf = await import("pdfjs-dist").then((m) => m.getDocument(reader.result as ArrayBuffer));
          const numPages = (await pdf.promise).numPages;
          setPdfPages(numPages);
          setEndPage(numPages - 1);
        } catch {
          setPdfPages(0);
        }
      };
      reader.readAsArrayBuffer(pdfOnly[0]);
    }
    setAlert(null);
    setResultFile(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setAlert({ type: "error", text: "Necesitas al menos 2 PDFs para fusionar." });
      return;
    }
    setIsLoading(true);
    const res = await mergePdf(files);
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setAlert({ type: "success", text: `${files.length} PDFs fusionados correctamente.` });
      addActivity({ type: "convert", filename: `${files.length} archivos fusionados`, format: "PDF" });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al fusionar." });
    }
  };

  const handleSplit = async () => {
    if (files.length === 0) {
      setAlert({ type: "error", text: "Carga un PDF primero." });
      return;
    }
    setIsLoading(true);
    const res = await splitPdf(files[0], startPage, endPage);
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setAlert({ type: "success", text: `PDF dividido (páginas ${startPage + 1}-${endPage + 1}).` });
      addActivity({ type: "convert", filename: files[0].name, format: "PDF (dividido)" });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al dividir." });
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) {
      setAlert({ type: "error", text: "Carga un PDF primero." });
      return;
    }
    setIsLoading(true);
    const res = await compressPdf(files[0]);
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setAlert({ type: "success", text: "PDF comprimido correctamente." });
      addActivity({ type: "convert", filename: files[0].name, format: "PDF (comprimido)" });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al comprimir." });
    }
  };

  const handleOCR = async () => {
    if (files.length === 0) {
      setAlert({ type: "error", text: "Carga un archivo primero." });
      return;
    }
    setIsLoading(true);
    const res = await ocrPdf(files[0]);
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setAlert({ type: "success", text: "Texto extraído con OCR." });
      addActivity({ type: "convert", filename: files[0].name, format: "TXT (OCR)" });
    } else {
      setAlert({ type: "error", text: res?.error || "Error en OCR: asegúrate de que easyocr esté instalado." });
    }
  };

  const handleWatermark = async () => {
    if (files.length === 0) {
      setAlert({ type: "error", text: "Carga un PDF primero." });
      return;
    }
    setIsLoading(true);
    const res = await watermarkPdf(files[0], { text: watermarkText, color: watermarkColor, fontSize: watermarkSize });
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setAlert({ type: "success", text: "Marca de agua añadida correctamente." });
      addActivity({ type: "convert", filename: files[0].name, format: "PDF (watermark)" });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al añadir marca de agua." });
    }
  };

  const handleShare = async () => {
    if (!resultFile) return;
    // Fetch the result file as a blob and share it
    try {
      const resp = await fetch(`${API_URL}/download/${resultFile}`);
      const blob = await resp.blob();
      const f = new File([blob], resultFile, { type: blob.type });
      const res = await shareFile(f);
      if (res?.token) {
        const url = `${API_URL}/download/${res.filename}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    } catch {
      setAlert({ type: "error", text: "Error al generar enlace." });
    }
  };

  const execute = () => {
    if (!canOperate()) { limitGate.setOpen(true); return; }
    if (activeTool === "ocr" && !canUse("ocr")) { ocrGate.setOpen(true); return; }
    if (activeTool === "watermark" && !canUse("watermark")) { watermarkGate.setOpen(true); return; }
    if (activeTool === "merge" && files.length > 2 && !canUse("merge_many")) {
      // allow up to 2 for free
      setAlert({ type: "error", text: "El plan gratuito permite fusionar hasta 2 PDFs. Actualiza a Premium para fusionar sin límite." });
      return;
    }
    setShareUrl(null);
    setIsCopied(false);
    switch (activeTool) {
      case "merge":
        handleMerge();
        break;
      case "split":
        handleSplit();
        break;
      case "compress":
        handleCompress();
        break;
      case "ocr":
        handleOCR();
        break;
      case "watermark":
        handleWatermark();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Herramientas PDF</h1>
          <p className="text-sm text-gray-400 mt-1">Fusiona, divide, comprime y extrae texto de PDFs</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Modals */}
        {ocrGate.modal}
        {watermarkGate.modal}
        {shareGate.modal}
        {limitGate.modal}

        {/* Daily usage */}
        <DailyUsageBanner />

        {/* Tool selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["merge", "split", "compress", "ocr", "watermark"] as Tool[]).map((t) => {
            const icons = { merge: "🔗", split: "✂️", compress: "📦", ocr: "📖", watermark: "💧" };
            const labels = { merge: "Fusionar", split: "Dividir", compress: "Comprimir", ocr: "OCR", watermark: "Marca agua" };
            const premiumTools = { ocr: true, watermark: true } as Record<string, boolean>;
            const isLocked = premiumTools[t] && !canUse(t === "ocr" ? "ocr" : "watermark");
            return (
              <button
                key={t}
                type="button"
                onClick={() => { setActiveTool(t); setFiles([]); setResultFile(null); setPdfPages(0); setShareUrl(null); }}
                className={`relative p-3 rounded-xl border-2 transition-all text-center font-semibold text-sm ${
                  activeTool === t
                    ? "border-blue-400 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 scale-105"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {icons[t]} {labels[t]}
                {isLocked && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black px-1.5 py-0.5 rounded-full">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg`}>
              {tool.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{tool.label}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tool.desc}</p>
          </div>

          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/20 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple={activeTool === "merge"}
              accept={activeTool === "ocr" ? ".pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff" : ".pdf"}
              className="hidden"
              onChange={(e) => { const ff = Array.from(e.target.files ?? []); if (ff.length > 0) handleFileSelect(ff); }}
            />
            <div className="text-3xl mb-2">📂</div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {activeTool === "merge" ? "Arrastra 2+ PDFs aquí" : "Arrastra un PDF aquí"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">o haz clic para seleccionar</p>
          </div>

          {/* File list or split controls */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              {activeTool === "merge" ? (
                <>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{files.length} PDFs cargados:</div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm">
                        <span>📄</span>
                        <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                        <button
                          type="button"
                          onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:text-red-700 text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : activeTool === "split" && pdfPages > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {files[0].name} ({pdfPages} páginas)
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">Página inicio</label>
                      <input
                        type="number"
                        min={0}
                        max={pdfPages - 1}
                        value={startPage}
                        onChange={(e) => setStartPage(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-2">Página fin</label>
                      <input
                        type="number"
                        min={0}
                        max={pdfPages - 1}
                        value={endPage}
                        onChange={(e) => setEndPage(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : activeTool === "watermark" ? (
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">📄 {files[0].name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Texto de marca</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={watermarkColor}
                        onChange={(e) => setWatermarkColor(e.target.value)}
                        className="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Tamaño ({watermarkSize}px)</label>
                      <input
                        type="range"
                        min={20}
                        max={100}
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(Number(e.target.value))}
                        className="w-full mt-2"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">📄 {files[0].name}</div>
              )}
            </div>
          )}

          {/* Alert */}
          {alert && (
            <div className={`mt-4 p-3 rounded-xl text-sm font-medium border ${
              alert.type === "success"
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
            }`}>
              {alert.text}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={execute}
              disabled={files.length === 0 || isLoading || (activeTool === "merge" && files.length < 2)}
              className={`flex-1 py-3 rounded-xl font-bold text-white transition-all ${
                files.length === 0 || isLoading || (activeTool === "merge" && files.length < 2)
                  ? "bg-gray-300 cursor-not-allowed"
                  : tool.button
              }`}
            >
              {isLoading ? "Procesando..." : `Ejecutar ${tool.label}`}
            </button>

            {resultFile && (
              <>
                <a
                  href={`${API_URL}/download/${resultFile}`}
                  download
                  className="px-6 py-3 bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 text-white rounded-xl font-bold transition-all whitespace-nowrap"
                >
                  ⬇ Descargar
                </a>
                <button
                  type="button"
                  onClick={shareGate.guard(handleShare)}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all whitespace-nowrap"
                  title="Copiar enlace para compartir"
                >
                  {isCopied ? "✅ Copiado" : canUse("share") ? "🔗 Compartir" : "👑 Compartir"}
                </button>
              </>
            )}
          </div>

          {shareUrl && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 break-all">
              <span className="font-bold">Enlace: </span>{shareUrl}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
