"use client";

import { useState, useRef, useEffect } from "react";
import { convertAny, shareFile, API_URL } from "../api/upload";
import { addActivity, getPrefs, savePrefs } from "../../lib/activity";
import { canUse, canOperate, fileSizeAllowed, incrementOps, FREE_MAX_FILE_MB } from "../../lib/plan";
import { usePremiumGate, DailyUsageBanner } from "../../components/PremiumGate";

// ── Conversion map  (input ext → available output formats) ─────────────────
const CONVERSION_MAP: Record<string, string[]> = {
  pdf:  ["docx", "pptx", "xlsx", "csv", "jpg", "png", "webp", "bmp", "tiff", "txt", "html", "json", "xml"],
  docx: ["pdf", "pptx", "xlsx", "csv", "txt", "html", "json", "xml"],
  doc:  ["pdf", "txt", "html", "xlsx", "csv"],
  pptx: ["pdf", "docx", "xlsx", "csv", "txt", "html", "json", "xml"],
  ppt:  ["pdf", "txt", "html"],
  xlsx: ["csv", "json", "xml", "docx", "pptx", "txt", "pdf", "html"],
  xls:  ["csv", "xlsx", "txt", "pdf", "html", "json"],
  csv:  ["xlsx", "json", "xml", "docx", "pptx", "txt", "pdf", "html"],
  jpg:  ["pdf", "png", "webp", "bmp", "tiff", "gif", "ico"],
  jpeg: ["pdf", "png", "webp", "bmp", "tiff", "gif", "ico"],
  png:  ["pdf", "jpg", "webp", "bmp", "tiff", "gif", "ico"],
  webp: ["pdf", "jpg", "png", "bmp", "tiff", "ico"],
  bmp:  ["pdf", "jpg", "png", "webp", "tiff", "ico"],
  gif:  ["pdf", "jpg", "png", "webp", "bmp"],
  tiff: ["pdf", "jpg", "png", "webp", "bmp", "ico"],
  txt:  ["pdf", "docx", "pptx", "xlsx", "csv", "html", "json", "xml"],
  html: ["txt", "pdf", "docx", "xlsx", "csv", "json", "xml"],
  htm:  ["txt", "pdf", "docx", "json"],
};

// ── Output format definitions ──────────────────────────────────────────────
const OUTPUT_FORMATS: Record<string, {
  label: string; ext: string; icon: string;
  card: string; btn: string; description: string;
}> = {
  pdf:  { label: "PDF",        ext: "PDF",  icon: "📕", description: "Documento portátil",  card: "border-red-400 bg-red-50 text-red-700",           btn: "bg-red-600 hover:bg-red-700" },
  docx: { label: "Word",       ext: "DOCX", icon: "📝", description: "Documento editable",  card: "border-blue-400 bg-blue-50 text-blue-700",         btn: "bg-blue-600 hover:bg-blue-700" },
  pptx: { label: "PowerPoint", ext: "PPTX", icon: "📊", description: "Presentación",        card: "border-orange-400 bg-orange-50 text-orange-700",   btn: "bg-orange-500 hover:bg-orange-600" },
  xlsx: { label: "Excel",      ext: "XLSX", icon: "📗", description: "Hoja de cálculo",     card: "border-green-500 bg-green-50 text-green-800",      btn: "bg-green-700 hover:bg-green-800" },
  csv:  { label: "CSV",        ext: "CSV",  icon: "📋", description: "Valores separados",   card: "border-emerald-400 bg-emerald-50 text-emerald-700", btn: "bg-emerald-600 hover:bg-emerald-700" },
  bmp:  { label: "BMP",        ext: "BMP",  icon: "🖼️", description: "Mapa de bits",        card: "border-slate-400 bg-slate-50 text-slate-700",      btn: "bg-slate-600 hover:bg-slate-700" },
  tiff: { label: "TIFF",       ext: "TIFF", icon: "🔬", description: "Alta resolución",     card: "border-indigo-400 bg-indigo-50 text-indigo-700",   btn: "bg-indigo-600 hover:bg-indigo-700" },
  gif:  { label: "GIF",        ext: "GIF",  icon: "🎞️", description: "Imagen animada",      card: "border-pink-400 bg-pink-50 text-pink-700",         btn: "bg-pink-500 hover:bg-pink-600" },
  ico:  { label: "ICO",        ext: "ICO",  icon: "🎯", description: "Ícono de app",        card: "border-purple-400 bg-purple-50 text-purple-700",   btn: "bg-purple-600 hover:bg-purple-700" },
};

// ── Input type metadata ────────────────────────────────────────────────────
const INPUT_INFO: Record<string, { icon: string; label: string; color: string }> = {
  pdf:  { icon: "📕", label: "PDF",            color: "text-red-600 bg-red-50 border-red-200" },
  docx: { icon: "📝", label: "Word",           color: "text-blue-600 bg-blue-50 border-blue-200" },
  doc:  { icon: "📝", label: "Word (legacy)",  color: "text-blue-600 bg-blue-50 border-blue-200" },
  pptx: { icon: "📊", label: "PowerPoint",     color: "text-orange-600 bg-orange-50 border-orange-200" },
  ppt:  { icon: "📊", label: "PPT (legacy)",   color: "text-orange-600 bg-orange-50 border-orange-200" },
  xlsx: { icon: "📗", label: "Excel",          color: "text-green-700 bg-green-50 border-green-200" },
  xls:  { icon: "📗", label: "Excel (legacy)", color: "text-green-700 bg-green-50 border-green-200" },
  csv:  { icon: "📋", label: "CSV",            color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  jpg:  { icon: "🖼️", label: "JPG",            color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  jpeg: { icon: "🖼️", label: "JPEG",           color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  png:  { icon: "🎨", label: "PNG",            color: "text-purple-600 bg-purple-50 border-purple-200" },
  webp: { icon: "🌄", label: "WebP",           color: "text-teal-600 bg-teal-50 border-teal-200" },
  bmp:  { icon: "🖼️", label: "BMP",            color: "text-slate-600 bg-slate-50 border-slate-200" },
  gif:  { icon: "🎞️", label: "GIF",            color: "text-pink-600 bg-pink-50 border-pink-200" },
  tiff: { icon: "🔬", label: "TIFF",           color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  txt:  { icon: "📄", label: "Texto plano",    color: "text-gray-600 bg-gray-50 border-gray-200" },
  html: { icon: "🌐", label: "HTML",           color: "text-orange-600 bg-orange-50 border-orange-200" },
  htm:  { icon: "🌐", label: "HTML",           color: "text-orange-600 bg-orange-50 border-orange-200" },
};

// Category groups for the supported types banner
const INPUT_CATEGORIES = [
  { label: "Documentos", color: "bg-blue-50 text-blue-700 border-blue-200", exts: ["pdf","docx","doc","txt","html"] },
  { label: "Hojas",      color: "bg-green-50 text-green-700 border-green-200", exts: ["xlsx","xls","csv"] },
  { label: "Slides",     color: "bg-orange-50 text-orange-700 border-orange-200", exts: ["pptx","ppt"] },
  { label: "Imágenes",   color: "bg-yellow-50 text-yellow-700 border-yellow-200", exts: ["jpg","jpeg","png","webp","bmp","gif","tiff"] },
  { label: "Datos",      color: "bg-violet-50 text-violet-700 border-violet-200", exts: ["json","xml"] },
];

const ACCEPTED_EXTS = Object.keys(CONVERSION_MAP).map((e) => `.${e}`).join(",");

type Alert = { type: "success" | "error"; text: string };
function getExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }

export default function ConverterPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [files, setFiles]             = useState<File[]>([]);
  const [isBatch, setIsBatch]         = useState(false);
  const [fileExt, setFileExt]         = useState("");
  const [selectedFmt, setSelectedFmt] = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [alert, setAlert]             = useState<Alert | null>(null);
  const [resultFile, setResultFile]   = useState<string | null>(null);
  const [, setBatchResults] = useState<string[]>([]);
  const [shareUrl, setShareUrl]       = useState<string | null>(null);
  const [isCopied, setIsCopied]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const batchGate  = usePremiumGate("batch");
  const shareGate  = usePremiumGate("share");
  const limitGate  = usePremiumGate("daily_limit");

  useEffect(() => {
    if (!file) return;
    const ext = getExt(file.name);
    setFileExt(ext);
    setSelectedFmt("");
    setResultFile(null);
    setAlert(null);
    const available = CONVERSION_MAP[ext] ?? [];
    const { lastFormat } = getPrefs();
    setSelectedFmt(available.includes(lastFormat) ? lastFormat : (available[0] ?? ""));
  }, [file]);

  const available      = CONVERSION_MAP[fileExt] ?? [];
  const inputInfo      = INPUT_INFO[fileExt];
  const selectedDef    = selectedFmt ? OUTPUT_FORMATS[selectedFmt] : null;

  const handleFileSelect = (f: File) => {
    const ext = getExt(f.name);
    if (!CONVERSION_MAP[ext]) {
      setAlert({ type: "error", text: `".${ext}" no está soportado aún.` });
      return;
    }
    if (!fileSizeAllowed(f.size)) {
      setAlert({ type: "error", text: `El archivo supera el límite de ${FREE_MAX_FILE_MB} MB del plan gratuito. Actualiza a Premium para subir hasta 50 MB.` });
      return;
    }
    setFile(f);
    setAlert(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const handleFormatChange = (fmt: string) => {
    setSelectedFmt(fmt);
    setResultFile(null);
    setAlert(null);
    savePrefs({ lastFormat: fmt });
  };

  const handleShare = async () => {
    if (!resultFile) return;
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

  const handleConvert = async () => {
    if (!canOperate()) { limitGate.setOpen(true); return; }
    setShareUrl(null);
    if (isBatch && files.length > 0 && selectedFmt) {
      setIsLoading(true);
      setAlert(null);
      const results: string[] = [];
      for (const f of files) {
        const res = await convertAny(f, selectedFmt);
        if (res?.output_file) {
          results.push(res.output_file);
          incrementOps();
          addActivity({ type: "convert", filename: f.name, format: OUTPUT_FORMATS[selectedFmt]?.ext ?? selectedFmt.toUpperCase() });
        }
      }
      setIsLoading(false);
      if (results.length === files.length) {
        setBatchResults(results);
        setAlert({ type: "success", text: `${results.length} archivos convertidos correctamente.` });
      } else {
        setAlert({ type: "error", text: `Solo se convirtieron ${results.length}/${files.length} archivos.` });
      }
    } else if (!isBatch && file && selectedFmt) {
      setIsLoading(true);
      setAlert(null);
      const res = await convertAny(file, selectedFmt);
      setIsLoading(false);
      if (res?.output_file) {
        incrementOps();
        setResultFile(res.output_file);
        const fmt = OUTPUT_FORMATS[selectedFmt];
        setAlert({ type: "success", text: `¡Conversión a ${fmt?.ext ?? selectedFmt.toUpperCase()} exitosa!` });
        addActivity({ type: "convert", filename: file.name, format: fmt?.ext ?? selectedFmt.toUpperCase() });
      } else {
        setAlert({ type: "error", text: res?.error || "Error en la conversión." });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-xl shadow-md shadow-emerald-200">🔄</div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">Convertidor Universal</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Convierte cualquier tipo de archivo al formato que necesites</p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            {Object.keys(CONVERSION_MAP).length} formatos soportados
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* Modals */}
        {batchGate.modal}
        {shareGate.modal}
        {limitGate.modal}

        {/* Daily usage */}
        <DailyUsageBanner />

        {/* Batch toggle */}
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-3">
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Modo lote</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Convierte múltiples archivos a la vez</p>
          </div>
          {canUse("batch") ? (
            <button
              type="button"
              onClick={() => { setIsBatch((b) => !b); setFile(null); setFiles([]); setResultFile(null); setBatchResults([]); }}
              title={isBatch ? "Desactivar modo lote" : "Activar modo lote"}
              className={`relative w-12 h-6 rounded-full transition-colors ${isBatch ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isBatch ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          ) : (
            <button type="button" onClick={() => batchGate.setOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full hover:scale-105 transition-transform"
            >
              👑 Premium
            </button>
          )}
        </div>

        {/* Supported types banner */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Tipos de archivo compatibles</p>
          <div className="flex flex-wrap gap-2">
            {INPUT_CATEGORIES.map((cat) => (
              <div key={cat.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${cat.color}`}>
                <span className="font-bold">{cat.label}:</span>
                {cat.exts.filter((e) => INPUT_INFO[e]).map((e) => (
                  <span key={e} className="opacity-80">{INPUT_INFO[e]?.icon} .{e.toUpperCase()}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            file
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 cursor-default"
              : isDragging
              ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 scale-[1.01] cursor-pointer"
              : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
          }`}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED_EXTS}
            aria-label="Seleccionar archivo" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
          />
          {file && inputInfo ? (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0 ${inputInfo.color}`}>
                {inputInfo.icon}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${inputInfo.color}`}>{inputInfo.label}</span>
                  <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                  <span className="text-xs text-emerald-600 font-medium">{available.length} formatos disponibles</span>
                </div>
              </div>
              <button type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); setFileExt(""); setSelectedFmt(""); setResultFile(null); setAlert(null); }}
                className="ml-auto text-red-400 hover:text-red-600 text-sm font-medium flex-shrink-0"
              >✕ Cambiar</button>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-3">📂</div>
              <p className="font-bold text-gray-700 dark:text-gray-200">Arrastra cualquier archivo aquí</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">PDF, Word, Excel, PowerPoint, Imágenes, TXT, HTML, CSV y más</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-3">o haz clic para seleccionar</p>
            </>
          )}
        </div>

        {/* Format selector */}
        {file && available.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            {/* From → To visual */}
            <div className="flex items-center gap-3 mb-5">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold ${inputInfo?.color ?? ""}`}>
                {inputInfo?.icon} {inputInfo?.label ?? fileExt.toUpperCase()}
              </div>
              <div className="flex-1 flex items-center gap-2 text-gray-300">
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-emerald-300" />
                <span className="text-xl">→</span>
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-300 to-gray-200" />
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold transition-all ${
                selectedDef ? selectedDef.card : "border-gray-200 bg-gray-50 text-gray-400"
              }`}>
                {selectedDef ? <>{selectedDef.icon} {selectedDef.ext}</> : "Elige formato"}
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wide mb-3">
              Convertir a: <span className="text-emerald-600">{available.length} opciones</span>
            </p>

            {/* Grid — auto-wraps to fill, max ~5 per row */}
            <div className="grid gap-2 grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {available.map((fmt) => {
                const f = OUTPUT_FORMATS[fmt];
                if (!f) return null;
                const isSelected = selectedFmt === fmt;
                return (
                  <button key={fmt} type="button" onClick={() => handleFormatChange(fmt)}
                    className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                      isSelected
                        ? f.card + " shadow-sm scale-[1.04]"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                    }`}
                  >
                    <span className="text-xl mb-1">{f.icon}</span>
                    <span className="font-bold text-xs">{f.ext}</span>
                    <span className="text-xs mt-0.5 opacity-60 leading-tight">{f.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Alert */}
        {alert && (
          <div className={`p-3 rounded-xl text-sm font-medium border ${
            alert.type === "success"
              ? "bg-green-100 text-green-700 border-green-200"
              : "bg-red-100 text-red-700 border-red-200"
          }`}>
            {alert.text}
          </div>
        )}

        {/* Action bar */}
        <div className="flex gap-3">
          <button type="button" onClick={handleConvert}
            disabled={!file || !selectedFmt || isLoading}
            className={`flex-1 py-4 rounded-2xl font-bold text-white text-base transition-all shadow-md ${
              !file || !selectedFmt || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : (selectedDef?.btn ?? "bg-gray-600 hover:bg-gray-700")
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Convirtiendo a {selectedDef?.ext ?? selectedFmt.toUpperCase()}...
              </span>
            ) : selectedFmt ? (
              `${selectedDef?.icon ?? "🔄"}  Convertir a ${selectedDef?.ext ?? selectedFmt.toUpperCase()}`
            ) : (
              "Selecciona un formato de salida"
            )}
          </button>

          {resultFile && (
            <>
              <a href={`${API_URL}/download/${resultFile}`} download
                className="flex items-center gap-2 px-6 py-4 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl font-bold transition-all shadow-md whitespace-nowrap"
              >
                ⬇ Descargar
              </a>
              <button type="button" onClick={shareGate.guard(handleShare)}
                className="flex items-center gap-2 px-5 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-md whitespace-nowrap"
                title="Copiar enlace para compartir"
              >
                {isCopied ? "✅ Copiado" : canUse("share") ? "🔗 Compartir" : "👑 Compartir"}
              </button>
            </>
          )}
        </div>

        {shareUrl && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 break-all">
            <span className="font-bold">Enlace: </span>{shareUrl}
          </div>
        )}

        {/* Preview */}
        {resultFile && ["jpg","jpeg","png","webp","bmp","gif","tiff","ico"].includes(selectedFmt) && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Vista previa</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${API_URL}/download/${resultFile}`}
              alt="Vista previa del resultado"
              className="max-h-64 mx-auto rounded-xl object-contain border border-gray-100 dark:border-gray-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
