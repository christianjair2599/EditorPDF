"use client";

import { useState, useRef, useEffect } from "react";
import {
  extractTextBlocks, editBlocks, improveText,
  API_URL, type TextBlock, type BlockEdit,
} from "../api/upload";
import { addActivity, getPrefs, savePrefs } from "../../lib/activity";
import { canUse, canOperate, incrementOps } from "../../lib/plan";
import { usePremiumGate, DailyUsageBanner } from "../../components/PremiumGate";

const FONTS = [
  { id: "helv",  label: "Helvetica" },
  { id: "tiro",  label: "Times Roman" },
  { id: "cour",  label: "Courier" },
  { id: "heit",  label: "Helvetica Italic" },
  { id: "tibo",  label: "Times Bold" },
  { id: "cobo",  label: "Courier Bold" },
];

type AlertType = { type: "success" | "error" | "info"; text: string };

export default function EditorPage() {
  const [file, setFile]               = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [fileId, setFileId]           = useState<string | null>(null);
  const [blocks, setBlocks]           = useState<TextBlock[]>([]);
  const [pendingEdits, setPendingEdits] = useState<Record<string, BlockEdit>>({});
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [editForm, setEditForm]       = useState<Partial<BlockEdit>>({});
  const [search, setSearch]           = useState("");
  const [isDragging, setIsDragging]   = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isApplying, setIsApplying]   = useState(false);
  const [isImprovingAI, setIsImprovingAI] = useState(false);
  const [alert, setAlert]             = useState<AlertType | null>(null);
  const [resultFile, setResultFile]   = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiGate    = usePremiumGate("ai");
  const limitGate = usePremiumGate("daily_limit");

  useEffect(() => {
    return () => { if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // Load last used font from prefs
  useEffect(() => {
    const { lastFont } = getPrefs();
    setEditForm((prev) => ({ ...prev, font: lastFont }));
  }, []);

  // ── File handling ────────────────────────────────────────────────────────

  const handleFileSelect = async (f: File) => {
    if (!f.type.includes("pdf")) {
      setAlert({ type: "error", text: "Solo se aceptan archivos PDF." });
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setBlocks([]);
    setPendingEdits({});
    setSelectedId(null);
    setResultFile(null);
    setAlert({ type: "info", text: "Extrayendo bloques de texto del PDF..." });
    setIsExtracting(true);

    const res = await extractTextBlocks(f);
    setIsExtracting(false);

    if (res?.blocks) {
      setBlocks(res.blocks);
      setFileId(res.file_id);
      setAlert({ type: "success", text: `${res.blocks.length} bloques de texto detectados. Haz clic en uno para editarlo.` });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al extraer texto." });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  };

  const resetEditor = () => {
    setFile(null);
    setPreviewUrl(null);
    setBlocks([]);
    setPendingEdits({});
    setSelectedId(null);
    setAlert(null);
    setResultFile(null);
  };

  // ── Block editing ────────────────────────────────────────────────────────

  const selectBlock = (block: TextBlock) => {
    setSelectedId(block.id);
    const existing = pendingEdits[block.id];
    setEditForm({
      id: block.id,
      page: block.page,
      x0: block.x0, y0: block.y0, x1: block.x1, y1: block.y1,
      new_text: existing?.new_text ?? block.text,
      font:     existing?.font     ?? "helv",
      font_size: existing?.font_size ?? block.font_size,
      color:    existing?.color    ?? block.color,
    });
  };

  const saveEdit = () => {
    if (!selectedId) return;
    if (!editForm.new_text?.trim()) {
      setAlert({ type: "error", text: "El texto no puede estar vacío." });
      return;
    }
    setPendingEdits(prev => ({ ...prev, [selectedId]: editForm as BlockEdit }));
    setAlert({ type: "success", text: "Cambio guardado. Haz clic en 'Aplicar' cuando termines todos los cambios." });
  };

  const discardEdit = (id: string) => {
    setPendingEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (selectedId === id) setSelectedId(null);
  };

  // ── AI improvement ───────────────────────────────────────────────────────

  const handleImproveAI = async () => {
    if (!canUse("ai")) { aiGate.setOpen(true); return; }
    if (!editForm.new_text) return;
    setIsImprovingAI(true);
    const res = await improveText(editForm.new_text);
    setIsImprovingAI(false);
    if (res?.improved_text) {
      setEditForm(prev => ({ ...prev, new_text: res.improved_text }));
      setAlert({ type: "success", text: "Texto mejorado por IA. Revisa y guarda el cambio." });
    } else {
      setAlert({ type: "error", text: res?.error || "Error con IA." });
    }
  };

  // ── Apply all edits ──────────────────────────────────────────────────────

  const handleApply = async () => {
    if (!fileId || Object.keys(pendingEdits).length === 0) return;
    if (!canOperate()) { limitGate.setOpen(true); return; }
    setIsApplying(true);
    setAlert(null);
    const res = await editBlocks(fileId, Object.values(pendingEdits));
    setIsApplying(false);
    if (res?.output_file) {
      incrementOps();
      setResultFile(res.output_file);
      setPreviewUrl(`${API_URL}/download/${res.output_file}`);
      if (file) addActivity({ type: "edit", filename: file.name, edits: Object.keys(pendingEdits).length });
      setPendingEdits({});
      setSelectedId(null);
      setAlert({ type: "success", text: "¡Cambios aplicados! Ahora ves el PDF editado." });
    } else {
      setAlert({ type: "error", text: res?.error || "Error al aplicar cambios." });
    }
  };

  // ── Derived data ─────────────────────────────────────────────────────────

  const filteredBlocks = blocks.filter(b =>
    b.text.toLowerCase().includes(search.toLowerCase())
  );

  const blocksByPage = filteredBlocks.reduce<Record<number, TextBlock[]>>((acc, b) => {
    (acc[b.page] ??= []).push(b);
    return acc;
  }, {});

  const pendingCount = Object.keys(pendingEdits).length;
  const selectedBlock = selectedId ? blocks.find(b => b.id === selectedId) ?? null : null;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center text-xl shadow-md shadow-blue-200">✏️</div>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">Editor de PDF</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Haz clic en cualquier bloque de texto para editarlo directamente</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Modals */}
        {aiGate.modal}
        {limitGate.modal}

        {/* Daily usage */}
        <div className="mb-4"><DailyUsageBanner /></div>

        {!file ? (
          /* ── Upload zone ── */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-4 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]"
                : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10"
            }`}
          >
            <div className="text-7xl mb-4">📄</div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Arrastra tu PDF aquí</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">o haz clic para seleccionar</p>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf"
              aria-label="Seleccionar archivo PDF"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f); }}
            />
          </div>

        ) : (
          /* ── Editor layout ── */
          <div className="flex gap-4 h-[calc(100vh-160px)]">

            {/* Left: PDF preview */}
            <div className="flex-1 bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col min-w-0">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b flex-shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-400 flex-shrink-0">📄</span>
                  <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                  {resultFile && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      Editado
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={resetEditor}
                  className="text-xs text-red-500 hover:text-red-700 font-medium flex-shrink-0 ml-2"
                >
                  ✕ Cambiar
                </button>
              </div>
              <iframe src={previewUrl || ""} className="flex-1 w-full" title="Vista previa del PDF" />
            </div>

            {/* Right: Control panel */}
            <div className="w-96 flex flex-col gap-3 flex-shrink-0 overflow-hidden">

              {/* Alert */}
              {alert && (
                <div className={`p-3 rounded-xl text-sm font-medium border flex-shrink-0 ${
                  alert.type === "success" ? "bg-green-100 text-green-700 border-green-200" :
                  alert.type === "error"   ? "bg-red-100 text-red-700 border-red-200" :
                                             "bg-blue-100 text-blue-700 border-blue-200"
                }`}>
                  {alert.text}
                </div>
              )}

              {/* Blocks list */}
              <div className={`bg-white rounded-2xl border shadow-sm flex flex-col overflow-hidden transition-all ${
                selectedId ? "flex-[0_0_45%]" : "flex-1"
              }`}>
                <div className="px-4 py-3 border-b flex-shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                      Bloques de texto
                      {isExtracting && (
                        <svg className="animate-spin h-3 w-3 text-blue-500" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      )}
                      {pendingCount > 0 && (
                        <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
                          {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </h2>
                    <span className="text-xs text-gray-400">{filteredBlocks.length} bloques</span>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar texto..."
                    aria-label="Buscar bloques"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div className="overflow-y-auto flex-1 p-2">
                  {filteredBlocks.length === 0 && !isExtracting && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      {search ? "Sin resultados." : "No se detectaron bloques de texto."}
                    </p>
                  )}
                  {Object.entries(blocksByPage).map(([page, pageBlocks]) => (
                    <div key={page} className="mb-3">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2 mb-1.5">
                        Página {Number(page) + 1}
                      </div>
                      {pageBlocks.map(block => {
                        const isEdited   = !!pendingEdits[block.id];
                        const isSelected = selectedId === block.id;
                        const displayText = (pendingEdits[block.id]?.new_text ?? block.text).slice(0, 90);
                        return (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => selectBlock(block)}
                            className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-xs transition-all border ${
                              isSelected
                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                : isEdited
                                ? "bg-orange-50 border-orange-200 hover:bg-orange-100"
                                : "border-transparent hover:bg-gray-50 hover:border-gray-200"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                isEdited ? "bg-orange-400" : isSelected ? "bg-blue-500" : "bg-gray-300"
                              }`} />
                              <span className="text-gray-600 leading-relaxed line-clamp-2">
                                {displayText}{(pendingEdits[block.id]?.new_text ?? block.text).length > 90 ? "…" : ""}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Edit form */}
              {selectedId && selectedBlock && (
                <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 flex-1 overflow-y-auto min-h-0">
                  <div className="flex items-center justify-between flex-shrink-0">
                    <h2 className="font-semibold text-gray-800 text-sm">
                      Editando — Pág. {selectedBlock.page + 1}
                    </h2>
                    {pendingEdits[selectedId] && (
                      <button
                        type="button"
                        onClick={() => discardEdit(selectedId)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Descartar
                      </button>
                    )}
                  </div>

                  <textarea
                    value={editForm.new_text ?? ""}
                    onChange={(e) => setEditForm(prev => ({ ...prev, new_text: e.target.value }))}
                    rows={4}
                    aria-label="Texto del bloque seleccionado"
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  {/* Font + Size */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor="font-select" className="text-xs text-gray-400 mb-1 block">Tipo de letra</label>
                      <select
                        id="font-select"
                        value={editForm.font ?? "helv"}
                        onChange={(e) => { setEditForm(prev => ({ ...prev, font: e.target.value })); savePrefs({ lastFont: e.target.value }); }}
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        {FONTS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                    </div>
                    <div className="w-20">
                      <label htmlFor="edit-size" className="text-xs text-gray-400 mb-1 block">
                        Tamaño <span className="font-semibold text-blue-600">{editForm.font_size ?? 12}pt</span>
                      </label>
                      <input
                        id="edit-size"
                        type="number"
                        min={6}
                        max={72}
                        value={editForm.font_size ?? 12}
                        aria-label="Tamaño de fuente"
                        onChange={(e) => setEditForm(prev => ({ ...prev, font_size: Number(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  {/* Color */}
                  <div className="flex items-center gap-3">
                    <label htmlFor="edit-color" className="text-xs text-gray-400">Color</label>
                    <input
                      id="edit-color"
                      type="color"
                      value={editForm.color ?? "#000000"}
                      aria-label="Color del texto"
                      onChange={(e) => setEditForm(prev => ({ ...prev, color: e.target.value }))}
                      className="h-8 w-10 rounded cursor-pointer border border-gray-200"
                    />
                    <span className="text-xs text-gray-400 font-mono">{(editForm.color ?? "#000000").toUpperCase()}</span>
                  </div>

                  {/* AI improve */}
                  <button
                    type="button"
                    onClick={handleImproveAI}
                    disabled={isImprovingAI}
                    className={`w-full py-2.5 border-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                      canUse("ai")
                        ? "border-purple-200 text-purple-700 hover:bg-purple-50"
                        : "border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10"
                    }`}
                  >
                    {isImprovingAI
                      ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Mejorando con IA...</>
                      : canUse("ai") ? <>✨ Mejorar con IA</> : <>👑 Mejorar con IA · Premium</>
                    }
                  </button>

                  {/* Save edit */}
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="w-full py-2.5 btn-gradient text-white rounded-xl text-sm font-semibold shadow-md"
                  >
                    ✅ Guardar cambio
                  </button>
                </div>
              )}

              {/* Bottom actions */}
              {blocks.length > 0 && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isApplying || pendingCount === 0}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2"
                  >
                    {isApplying
                      ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Aplicando...</>
                      : `🔧 Aplicar${pendingCount > 0 ? ` (${pendingCount})` : " cambios"}`
                    }
                  </button>
                  {resultFile && (
                    <a
                      href={`${API_URL}/download/${resultFile}`}
                      download
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-semibold text-sm transition-all shadow"
                    >
                      ⬇
                    </a>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
