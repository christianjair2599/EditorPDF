"use client";

import { useState, useRef, useEffect } from "react";
import { convertAny, convertUrl, shareFile, API_URL, getUrlPdfPreview, getConvertPreview } from "../api/upload";
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
  pdf:  { icon: "📕", label: "PDF",            color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" },
  docx: { icon: "📝", label: "Word",           color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30" },
  doc:  { icon: "📝", label: "Word (legacy)",  color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30" },
  pptx: { icon: "📊", label: "PowerPoint",     color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30" },
  ppt:  { icon: "📊", label: "PPT (legacy)",   color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30" },
  xlsx: { icon: "📗", label: "Excel",          color: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" },
  xls:  { icon: "📗", label: "Excel (legacy)", color: "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" },
  csv:  { icon: "📋", label: "CSV",            color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30" },
  jpg:  { icon: "🖼️", label: "JPG",            color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30" },
  jpeg: { icon: "🖼️", label: "JPEG",           color: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30" },
  png:  { icon: "🎨", label: "PNG",            color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30" },
  webp: { icon: "🌄", label: "WebP",           color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30" },
  bmp:  { icon: "🖼️", label: "BMP",            color: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-900/30" },
  gif:  { icon: "🎞️", label: "GIF",            color: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-900/30" },
  tiff: { icon: "🔬", label: "TIFF",           color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/30" },
  txt:  { icon: "📄", label: "Texto plano",    color: "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-900/30" },
  html: { icon: "🌐", label: "HTML",           color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30" },
  htm:  { icon: "🌐", label: "HTML",           color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30" },
};

// Category groups for the supported types banner
const INPUT_CATEGORIES = [
  { label: "Documentos", color: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/40", exts: ["pdf","docx","doc","txt","html"] },
  { label: "Hojas",      color: "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/40", exts: ["xlsx","xls","csv"] },
  { label: "Slides",     color: "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40", exts: ["pptx","ppt"] },
  { label: "Imágenes",   color: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800/40", exts: ["jpg","jpeg","png","webp","bmp","gif","tiff"] },
  { label: "Datos",      color: "bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/40", exts: ["json","xml"] },
];

const ACCEPTED_EXTS = Object.keys(CONVERSION_MAP).map((e) => `.${e}`).join(",");

// ── URL conversion formats ─────────────────────────────────────────────────
const URL_FORMATS: { fmt: string; label: string; icon: string; description: string; card: string; btn: string }[] = [
  { fmt: "pdf",  label: "PDF",  icon: "📕", description: "Página completa",  card: "border-red-400 bg-red-50 text-red-700",      btn: "bg-red-600 hover:bg-red-700" },
  { fmt: "png",  label: "PNG",  icon: "🎨", description: "Captura de pantalla", card: "border-purple-400 bg-purple-50 text-purple-700", btn: "bg-purple-600 hover:bg-purple-700" },
  { fmt: "jpg",  label: "JPG",  icon: "🖼️", description: "Captura comprimida", card: "border-yellow-400 bg-yellow-50 text-yellow-700", btn: "bg-yellow-500 hover:bg-yellow-600" },
  { fmt: "txt",  label: "TXT",  icon: "📄", description: "Solo texto",        card: "border-gray-400 bg-gray-50 text-gray-700",   btn: "bg-gray-600 hover:bg-gray-700" },
  { fmt: "html", label: "HTML", icon: "🌐", description: "Código fuente",     card: "border-orange-400 bg-orange-50 text-orange-700", btn: "bg-orange-500 hover:bg-orange-600" },
];

type Alert = { type: "success" | "error"; text: string };
function getExt(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }

// Simple bold syntax replacement (**text** -> <strong>)
const renderTextWithBold = (text: string) => {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part}</strong>;
    }
    return part;
  });
};

const MarkdownPreview = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  return (
    <div className="space-y-3 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Header check
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-gray-900 dark:text-white pt-2 border-b border-gray-100 dark:border-gray-800 pb-1">
              {trimmed.substring(4)}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-lg font-black bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent pt-3">
              {trimmed.substring(3)}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-black text-gray-900 dark:text-white pt-4 pb-2">
              {trimmed.substring(2)}
            </h2>
          );
        }

        // List item check
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-purple-500 mt-1.5 text-xs flex-shrink-0">•</span>
              <p className="flex-1 text-gray-700 dark:text-gray-300">
                {renderTextWithBold(content)}
              </p>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="text-gray-700 dark:text-gray-300">
            {renderTextWithBold(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default function ConverterPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [file, setFile]               = useState<File | null>(null);
  const [files, setFiles]             = useState<File[]>([]);
  const [isBatch, setIsBatch]         = useState(false);
  const [fileExt, setFileExt]         = useState("");
  const [selectedFmt, setSelectedFmt] = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const [isLoading, setIsLoading]     = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [alert, setAlert]             = useState<Alert | null>(null);
  const [resultFile, setResultFile]   = useState<string | null>(null);
  const [friendlyName, setFriendlyName] = useState<string | null>(null);
  const [, setBatchResults] = useState<string[]>([]);
  const [shareUrl, setShareUrl]       = useState<string | null>(null);
  const [isCopied, setIsCopied]       = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const batchInputRef = useRef<HTMLInputElement>(null);
  const [batchFileExt, setBatchFileExt] = useState("");

  // URL mode
  const [isUrlMode, setIsUrlMode]     = useState(false);
  const [urlInput, setUrlInput]       = useState("");
  const [urlFmt, setUrlFmt]           = useState("pdf");
  const [urlError, setUrlError]       = useState("");

  // AI and Previews
  const [conversionMode, setConversionMode] = useState<"visual" | "ai">("visual");
  const [aiPrompt, setAiPrompt]             = useState<"summary" | "formal" | "translation" | "brief">("summary");
  const [previewText, setPreviewText]       = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError]     = useState<string | null>(null);

  const batchGate  = usePremiumGate("batch");
  const shareGate  = usePremiumGate("share");
  const limitGate  = usePremiumGate("daily_limit");

  const handleResetPreviews = () => {
    setPreviewText(null);
    setPreviewError(null);
    setIsPreviewLoading(false);
    setResultFile(null);
    setShareUrl(null);
    setAlert(null);
  };

  const handleGeneratePreview = async () => {
    if (isUrlMode) {
      const trimmed = urlInput.trim();
      if (!trimmed) { setUrlError("Ingresa una URL válida."); return; }
      if (!/^https?:\/\//i.test(trimmed)) { setUrlError("La URL debe comenzar con http:// o https://"); return; }
      
      setIsPreviewLoading(true);
      setPreviewError(null);
      setPreviewText(null);
      
      const res = await getUrlPdfPreview(trimmed, aiPrompt);
      setIsPreviewLoading(false);
      if (res?.preview) {
        setPreviewText(res.preview);
      } else {
        setPreviewError(res?.error || "No se pudo generar la previsualización.");
      }
    } else {
      if (!file) return;
      setIsPreviewLoading(true);
      setPreviewError(null);
      setPreviewText(null);
      
      const res = await getConvertPreview(file, aiPrompt);
      setIsPreviewLoading(false);
      if (res?.preview) {
        setPreviewText(res.preview);
      } else {
        setPreviewError(res?.error || "No se pudo generar la previsualización.");
      }
    }
  };

  useEffect(() => {
    if (!file) return;
    const ext = getExt(file.name);
    setFileExt(ext);
    setSelectedFmt("");
    handleResetPreviews();
    const available = CONVERSION_MAP[ext] ?? [];
    const { lastFormat } = getPrefs();
    setSelectedFmt(available.includes(lastFormat) ? lastFormat : (available[0] ?? ""));
  }, [file]);

  const available      = CONVERSION_MAP[fileExt] ?? [];
  const inputInfo      = INPUT_INFO[fileExt];
  const selectedDef    = selectedFmt ? OUTPUT_FORMATS[selectedFmt] : null;
  const batchAvailable = CONVERSION_MAP[batchFileExt] ?? [];

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
    if (isBatch) {
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped.length > 0) handleBatchFileSelect(dropped);
    } else {
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    }
  };

  const handleBatchFileSelect = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => CONVERSION_MAP[getExt(f.name)]);
    if (valid.length === 0) {
      setAlert({ type: "error", text: "Ningún archivo compatible seleccionado." });
      return;
    }
    if (batchFileExt === "" && valid.length > 0) {
      const ext = getExt(valid[0].name);
      setBatchFileExt(ext);
      const avail = CONVERSION_MAP[ext] ?? [];
      setSelectedFmt(avail[0] ?? "");
    }
    setFiles((prev) => [...prev, ...valid]);
    setAlert(null);
    setResultFile(null);
  };

  const handleFormatChange = (fmt: string) => {
    setSelectedFmt(fmt);
    handleResetPreviews();
    savePrefs({ lastFormat: fmt });
  };

  const handleShare = async () => {
    if (!resultFile) return;
    try {
      const resp = await fetch(`${API_URL}/download/${resultFile}`);
      const blob = await resp.blob();
      const f = new File([blob], friendlyName ?? resultFile, { type: blob.type });
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
      setBatchProgress({ done: 0, total: files.length });
      const results: string[] = [];
      for (let i = 0; i < files.length; i++) {
        if (!canOperate()) { limitGate.setOpen(true); break; }
        const f = files[i];
        const res = await convertAny(f, selectedFmt, conversionMode, aiPrompt);
        if (res?.output_file) {
          results.push(res.output_file);
          incrementOps();
          addActivity({ type: "convert", filename: f.name, format: OUTPUT_FORMATS[selectedFmt]?.ext ?? selectedFmt.toUpperCase() });
        }
        setBatchProgress({ done: i + 1, total: files.length });
      }
      setIsLoading(false);
      setBatchProgress(null);
      if (results.length === files.length) {
        setBatchResults(results);
        setAlert({ type: "success", text: `${results.length} archivos convertidos correctamente.` });
      } else {
        setAlert({ type: "error", text: `Solo se convirtieron ${results.length}/${files.length} archivos.` });
      }
    } else if (!isBatch && file && selectedFmt) {
      setIsLoading(true);
      setAlert(null);
      const res = await convertAny(file, selectedFmt, conversionMode, aiPrompt);
      setIsLoading(false);
      if (res?.output_file) {
        incrementOps();
        setResultFile(res.output_file);
        setFriendlyName(res.friendly_name ?? null);
        const fmt = OUTPUT_FORMATS[selectedFmt];
        setAlert({ type: "success", text: `¡Conversión a ${fmt?.ext ?? selectedFmt.toUpperCase()} exitosa!` });
        addActivity({ type: "convert", filename: file.name, format: fmt?.ext ?? selectedFmt.toUpperCase() });
      } else {
        setAlert({ type: "error", text: res?.error || "Error en la conversión." });
      }
    }
  };

  const handleUrlConvert = async () => {
    if (!canOperate()) { limitGate.setOpen(true); return; }
    const trimmed = urlInput.trim();
    if (!trimmed) { setUrlError("Ingresa una URL válida."); return; }
    if (!/^https?:\/\//i.test(trimmed)) { setUrlError("La URL debe comenzar con http:// o https://"); return; }
    setUrlError("");
    setIsLoading(true);
    setAlert(null);
    setResultFile(null);
    setShareUrl(null);
    const res = await convertUrl(trimmed, urlFmt, conversionMode, aiPrompt);
    setIsLoading(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setFriendlyName(res.friendly_name ?? null);
      const fmtDef = URL_FORMATS.find((f) => f.fmt === urlFmt);
      setAlert({ type: "success", text: `¡Conversión a ${fmtDef?.label ?? urlFmt.toUpperCase()} exitosa!` });
      addActivity({ type: "convert", filename: trimmed, format: fmtDef?.label ?? urlFmt.toUpperCase() });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al convertir la URL." });
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Daily usage banner at top spanning full width */}
        <DailyUsageBanner />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Configuration (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Mode selector: File vs URL */}
            <div className="flex gap-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-1.5">
              <button
                type="button"
                onClick={() => { setIsUrlMode(false); setResultFile(null); setAlert(null); setShareUrl(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  !isUrlMode ? "bg-emerald-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                📂 Desde archivo
              </button>
              <button
                type="button"
                onClick={() => { setIsUrlMode(true); setFile(null); setResultFile(null); setAlert(null); setShareUrl(null); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isUrlMode ? "bg-blue-500 text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                🔗 Desde URL
              </button>
            </div>

            {/* Batch toggle (Files only) */}
            {!isUrlMode && (
              <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Modo lote</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Convierte múltiples archivos a la vez</p>
                </div>
                {!mounted ? (
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                ) : canUse("batch") ? (
                  <button
                    type="button"
                    onClick={() => { setIsBatch((b) => !b); setFile(null); setFiles([]); setResultFile(null); setBatchResults([]); setBatchFileExt(""); setSelectedFmt(""); }}
                    title={isBatch ? "Desactivar modo lote" : "Activar modo lote"}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isBatch ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isBatch ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                ) : (
                  <button type="button" onClick={() => batchGate.setOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-black rounded-full hover:scale-105 transition-transform"
                  >
                    👑 Premium
                  </button>
                )}
              </div>
            )}

            {/* Upload zone or URL Input Zone */}
            {isUrlMode ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    🔗 Ingresa el enlace de la página web
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleUrlConvert()}
                      placeholder="https://ejemplo.com/pagina"
                      className={`flex-1 px-4 py-3 rounded-xl border text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        urlError ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-gray-700 focus:ring-blue-300 focus:border-blue-400"
                      }`}
                    />
                    {urlInput && (
                      <button type="button" onClick={() => { setUrlInput(""); setUrlError(""); }}
                        className="px-3 text-gray-400 hover:text-red-500 transition-colors"
                      >✕</button>
                    )}
                  </div>
                  {urlError && <p className="text-xs text-red-500 mt-1.5">{urlError}</p>}
                </div>

                {/* URL format selector */}
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
                    Convertir a:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {URL_FORMATS.map((f) => (
                      <button key={f.fmt} type="button" onClick={() => setUrlFmt(f.fmt)}
                        className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all text-center ${
                          urlFmt === f.fmt
                            ? f.card + " shadow-sm scale-[1.04]"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-xl mb-1">{f.icon}</span>
                        <span className="font-bold text-xs">{f.label}</span>
                        <span className="text-[10px] mt-0.5 opacity-60 leading-tight">{f.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : isBatch ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => batchInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 scale-[1.01]"
                      : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                  }`}
                >
                  <input
                    ref={batchInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_EXTS}
                    aria-label="Seleccionar archivos en lote"
                    className="hidden"
                    onChange={(e) => { const ff = Array.from(e.target.files ?? []); if (ff.length > 0) handleBatchFileSelect(ff); e.target.value = ""; }}
                  />
                  <div className="text-4xl mb-2">📂</div>
                  <p className="font-bold text-gray-700 dark:text-gray-200">Arrastra múltiples archivos aquí</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">o haz clic para seleccionar varios</p>
                </div>
                {files.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{files.length} archivo{files.length !== 1 ? "s" : ""} cargado{files.length !== 1 ? "s" : ""}:</p>
                      <button type="button" onClick={() => { setFiles([]); setBatchFileExt(""); setSelectedFmt(""); setResultFile(null); }} className="text-xs text-red-500 hover:text-red-700 font-medium">Limpiar todo</button>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      {files.map((f, i) => {
                        const ext = getExt(f.name);
                        const info = INPUT_INFO[ext];
                        return (
                          <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
                            <span>{info?.icon ?? "📄"}</span>
                            <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{f.name}</span>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                            <button type="button" onClick={() => { const updated = files.filter((_, idx) => idx !== i); setFiles(updated); if (updated.length === 0) { setBatchFileExt(""); setSelectedFmt(""); } }} className="text-red-400 hover:text-red-600 text-[10px] font-bold">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && inputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  file
                    ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/10 cursor-default"
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
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-3xl flex-shrink-0 ${inputInfo.color}`}>
                      {inputInfo.icon}
                    </div>
                    <div className="text-center w-full">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-xs mx-auto">{file.name}</p>
                      <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${inputInfo.color}`}>{inputInfo.label}</span>
                        <span className="text-[10px] text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        <span className="text-[10px] text-emerald-600 font-medium">{available.length} formatos</span>
                      </div>
                    </div>
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); setFile(null); setFileExt(""); setSelectedFmt(""); setResultFile(null); setAlert(null); }}
                      className="mt-2 text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                    >✕ Cambiar archivo</button>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">📂</div>
                    <p className="font-bold text-sm text-gray-700 dark:text-gray-200">Arrastra tu archivo aquí</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-xs mx-auto">PDF, Word, Excel, PowerPoint, Imágenes, TXT, HTML o CSV</p>
                    <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-2">o haz clic para explorar</p>
                  </>
                )}
              </div>
            )}

            {/* Format Selector (File Mode) */}
            {!isUrlMode && ((!isBatch && file && available.length > 0) || (isBatch && files.length > 0 && batchAvailable.length > 0)) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">
                  Convertir a:
                </p>
                <div className="grid gap-2 grid-cols-3 sm:grid-cols-4 md:grid-cols-5">
                  {(isBatch ? batchAvailable : available).map((fmt) => {
                    const f = OUTPUT_FORMATS[fmt];
                    if (!f) return null;
                    const isSelected = selectedFmt === fmt;
                    return (
                      <button key={fmt} type="button" onClick={() => handleFormatChange(fmt)}
                        className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? f.card + " shadow-sm scale-[1.04]"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm"
                        }`}
                      >
                        <span className="text-lg mb-0.5">{f.icon}</span>
                        <span className="font-bold text-xs">{f.ext}</span>
                        <span className="text-[9px] mt-0.5 opacity-60 leading-tight line-clamp-1">{f.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI & Conversion Mode Selector Card */}
            {((!isUrlMode && (file || (isBatch && files.length > 0))) || (isUrlMode && urlInput.trim())) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Modo de Conversión</p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">Conserva el formato o rediseña la información con IA de Claude</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setConversionMode("visual"); handleResetPreviews(); }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      conversionMode === "visual"
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                        : "border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-lg mb-1">📄</span>
                    <span className="font-bold text-xs">Original / Estándar</span>
                    <span className="text-[9px] mt-1 opacity-80 leading-tight">Captura y formato original</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setConversionMode("ai"); }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      conversionMode === "ai"
                        ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 text-purple-800 dark:text-purple-300 ring-2 ring-purple-500/20"
                        : "border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span className="text-lg mb-1">✨</span>
                    <span className="font-bold text-xs">Rediseño con IA</span>
                    <span className="text-[9px] mt-1 opacity-80 leading-tight">Optimizado con Claude AI</span>
                  </button>
                </div>

                {conversionMode === "ai" && (
                  <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <div>
                      <label htmlFor="ai-style-select" className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                        Estilo de Rediseño Inteligente
                      </label>
                      <select
                        id="ai-style-select"
                        value={aiPrompt}
                        onChange={(e) => {
                          setAiPrompt(e.target.value as "summary" | "formal" | "translation" | "brief");
                          handleResetPreviews();
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <option value="summary">📋 Resumen Ejecutivo</option>
                        <option value="formal">👔 Reporte Corporativo Profesional</option>
                        <option value="translation">🌍 Traducción Fluida al Español</option>
                        <option value="brief">💡 Briefing de Negocios y Datos</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleGeneratePreview}
                      disabled={isPreviewLoading || (isUrlMode ? !urlInput.trim() : !file)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 transition-all ${
                        isPreviewLoading
                          ? "bg-purple-400 dark:bg-purple-600 cursor-not-allowed"
                          : (isUrlMode ? !urlInput.trim() : !file)
                          ? "bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.98]"
                      }`}
                    >
                      {isPreviewLoading ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Generando previsualización...
                        </>
                      ) : (
                        <>✨ Generar Vista Previa con IA</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Supported types summary banner */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5">Formatos Compatibles</p>
              <div className="flex flex-wrap gap-1.5">
                {INPUT_CATEGORIES.map((cat) => (
                  <div key={cat.label} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${cat.color}`}>
                    <span className="font-bold">{cat.label}:</span>
                    {cat.exts.slice(0, 3).map((e) => (
                      <span key={e} className="opacity-80">.{e.toUpperCase()}</span>
                    ))}
                    {cat.exts.length > 3 && <span className="opacity-50">+</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: INTERACTIVE PREVIEW & ACTION BAR (lg:col-span-7) */}
          <div className="lg:col-span-7 lg:sticky lg:top-5 space-y-5">
            
            {/* Main Visor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[460px] max-h-[640px]">
              
              {/* Visor Header */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <p className="text-xs font-black text-gray-700 dark:text-gray-300">
                    {conversionMode === "ai" ? "✨ Panel de Vista Previa Inteligente (IA)" : "🖥️ Panel de Vista Previa de Entrada"}
                  </p>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                </div>
              </div>

              {/* Visor Body (Scrollable container) */}
              <div className="flex-1 p-5 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/20 scrollbar-thin scrollbar-thumb-rounded">
                
                {isPreviewLoading ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 border-4 border-purple-200 dark:border-purple-950 rounded-full animate-spin border-t-purple-600" />
                      <span className="text-2xl animate-pulse">✨</span>
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Claude está estructurando tu información</p>
                      <p className="text-xs text-gray-400">Analizando el texto del documento original...</p>
                    </div>
                  </div>
                ) : previewError ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                    <span className="text-4xl">⚠️</span>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">Error al procesar</p>
                      <p className="text-xs text-gray-400 max-w-xs">{previewError}</p>
                    </div>
                    <button type="button" onClick={handleGeneratePreview} className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg hover:bg-gray-300 transition-all">Reintentar</button>
                  </div>
                ) : conversionMode === "ai" && previewText ? (
                  /* A4-Simulated glass paper */
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md rounded-xl p-6 md:p-8 min-h-full transition-all animate-fadeIn">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-3 mb-4 flex items-center justify-between text-xs text-gray-400">
                      <span className="font-semibold tracking-wider uppercase text-purple-600">Rediseño Claude AI</span>
                      <span>Estilo: {aiPrompt === "summary" ? "Resumen" : aiPrompt === "formal" ? "Corporativo" : aiPrompt === "translation" ? "Traducción" : "Briefing"}</span>
                    </div>
                    <MarkdownPreview text={previewText} />
                  </div>
                ) : conversionMode === "ai" ? (
                  /* AI Mode placeholder */
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner text-purple-600">✨</div>
                    <div className="space-y-1.5 max-w-xs">
                      <p className="text-sm font-black text-gray-800 dark:text-gray-200">Rediseño con IA Activo</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        Presiona el botón <strong className="text-purple-600">&quot;Generar Vista Previa con IA&quot;</strong> en el panel izquierdo para ver el documento optimizado en tiempo real antes de compilarlo.
                      </p>
                    </div>
                  </div>
                ) : isUrlMode ? (
                  /* Standard Visual Mode (URL) */
                  <div className="h-full flex flex-col justify-between min-h-[350px]">
                    {urlInput.trim() ? (
                      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md flex-1 flex flex-col">
                        {/* Simulated Browser Bar */}
                        <div className="bg-gray-100 dark:bg-gray-800/80 px-3 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 text-[10px] text-gray-400">
                          <span className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-green-600 flex items-center gap-0.5">🔒 HTTPS</span>
                          <span className="font-mono truncate">{urlInput}</span>
                        </div>
                        {/* Browser Content Simulated */}
                        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50/50 dark:bg-gray-950/30 text-center space-y-3">
                          <div className="text-4xl">🌐</div>
                          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Captura Visual Web</p>
                          <p className="text-xs text-gray-400 max-w-xs leading-normal">
                            La página se convertirá a <strong className="text-blue-500 font-bold">{urlFmt.toUpperCase()}</strong> capturando la hoja de estilos y el diseño visual de la web tal como aparece en pantalla.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <div className="text-4xl opacity-55">🔗</div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Esperando Enlace URL</p>
                        <p className="text-xs text-gray-400 max-w-xs leading-normal">
                          Ingresa una URL a la izquierda para habilitar la previsualización y las opciones de compilación.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Visual Mode (File) */
                  <div className="h-full flex flex-col justify-between min-h-[350px]">
                    {file ? (
                      <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                            <span className="text-3xl">📁</span>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Documento cargado</p>
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{file.name}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800/40">
                              <span className="text-gray-400">Tamaño original:</span>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800/40">
                              <span className="text-gray-400">Extensión:</span>
                              <span className="font-mono font-bold text-emerald-600">.{fileExt.toUpperCase()}</span>
                            </div>
                            {selectedFmt && (
                              <div className="flex justify-between py-1 border-b border-gray-50 dark:border-gray-800/40">
                                <span className="text-gray-400">Formato destino:</span>
                                <span className="font-bold text-purple-600">.{selectedFmt.toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                          <span>⚡</span>
                          <p>Conversión directa y de alta velocidad lista para compilar.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <div className="text-4xl opacity-55">📂</div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Esperando archivo de entrada</p>
                        <p className="text-xs text-gray-400 max-w-xs leading-normal">
                          Arrastra o carga un documento a la izquierda para activar los formatos y los visores inteligentes.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>

            {/* Batch progress */}
            {batchProgress && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Convirtiendo archivos...</span>
                  <span className="text-emerald-600 font-bold">{batchProgress.done} / {batchProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300 [width:var(--progress)]"
                    // @ts-expect-error CSS custom property
                    style={{ "--progress": `${(batchProgress.done / batchProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {batchProgress.done < batchProgress.total
                    ? `Procesando archivo ${batchProgress.done + 1}...`
                    : "Finalizando..."}
                </p>
              </div>
            )}

            {/* Alerts inside right panel for prominence */}
            {alert && (
              <div className={`p-3.5 rounded-xl text-xs font-semibold border ${
                alert.type === "success"
                  ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-900/30"
                  : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30"
              }`}>
                {alert.text}
              </div>
            )}

            {/* Bottom Actions Frame */}
            <div className="flex flex-wrap gap-3 bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm">
              
              {isUrlMode ? (
                <button type="button" onClick={handleUrlConvert}
                  disabled={!urlInput.trim() || isLoading}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-sm ${
                    !urlInput.trim() || isLoading
                      ? "bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : (URL_FORMATS.find((f) => f.fmt === urlFmt)?.btn ?? "bg-blue-600 hover:bg-blue-700")
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Procesando URL...
                    </span>
                  ) : (
                    `${URL_FORMATS.find((f) => f.fmt === urlFmt)?.icon ?? "🔗"}  Compilar y Descargar`
                  )}
                </button>
              ) : (
                <button type="button" onClick={handleConvert}
                  disabled={(isBatch ? files.length === 0 : !file) || !selectedFmt || isLoading}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-white text-sm transition-all shadow-sm ${
                    (isBatch ? files.length === 0 : !file) || !selectedFmt || isLoading
                      ? "bg-gray-300 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                      : (selectedDef?.btn ?? "bg-gray-600 hover:bg-gray-700")
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {isBatch && batchProgress ? `Procesando ${batchProgress.done + 1}/${batchProgress.total}...` : `Procesando...`}
                    </span>
                  ) : selectedFmt ? (
                    isBatch
                      ? `${selectedDef?.icon ?? "🔄"}  Compilar ${files.length} archivos`
                      : `${selectedDef?.icon ?? "🔄"}  Compilar y Descargar`
                  ) : (
                    "Selecciona un formato"
                  )}
                </button>
              )}

              {resultFile && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <a href={`${API_URL}/download/${resultFile}${friendlyName ? `?name=${encodeURIComponent(friendlyName)}` : ""}`} download={friendlyName ?? resultFile ?? undefined}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-3.5 bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                  >
                    ⬇ Descargar
                  </a>
                  <button type="button" onClick={shareGate.guard(handleShare)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm whitespace-nowrap"
                    title="Copiar enlace de descarga para compartir"
                  >
                    {isCopied ? "✅ Copiado" : (!mounted || !canUse("share")) ? "👑 Enlace" : "🔗 Enlace"}
                  </button>
                </div>
              )}
            </div>

            {shareUrl && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300 break-all">
                <span className="font-bold">Enlace: </span>{shareUrl}
              </div>
            )}

            {/* Visual outputs/images preview */}
            {resultFile && ["jpg","jpeg","png","webp","bmp","gif","tiff","ico"].includes(isUrlMode ? urlFmt : selectedFmt) && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Vista previa</p>
                <img
                  src={`${API_URL}/download/${resultFile}`}
                  alt="Vista previa del resultado"
                  className="max-h-64 mx-auto rounded-xl object-contain border border-gray-100 dark:border-gray-700"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
