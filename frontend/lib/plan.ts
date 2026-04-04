export type Plan = "free" | "premium";

export type PremiumFeature =
  | "batch"
  | "ocr"
  | "ai"
  | "watermark"
  | "share"
  | "large_file"
  | "merge_many";

export const FEATURE_INFO: Record<PremiumFeature, { title: string; desc: string; icon: string }> = {
  batch:      { icon: "📦", title: "Conversión en lote",      desc: "Convierte múltiples archivos a la vez con un solo clic." },
  ocr:        { icon: "📖", title: "OCR",                     desc: "Extrae texto de imágenes y PDFs escaneados con IA." },
  ai:         { icon: "✨", title: "Mejora con IA",           desc: "Reescribe y perfecciona texto con Claude AI." },
  watermark:  { icon: "💧", title: "Marca de agua",           desc: "Añade marcas de agua personalizadas a cualquier PDF." },
  share:      { icon: "🔗", title: "Compartir con link",      desc: "Genera enlaces públicos para compartir tus archivos." },
  large_file: { icon: "📁", title: "Archivos hasta 50 MB",    desc: "Sube y procesa documentos de gran tamaño sin límites." },
  merge_many: { icon: "🔀", title: "Fusionar múltiples PDFs", desc: "Combina más de 2 PDFs en un solo documento." },
};

export const FREE_DAILY_LIMIT = 4;
export const FREE_MAX_FILE_MB = 5;
export const PREMIUM_MAX_FILE_MB = 50;

interface PlanState {
  plan: Plan;
  dailyOps: number;
  lastReset: string; // YYYY-MM-DD
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

const KEY = "docuflow_plan";

function getState(): PlanState {
  if (typeof window === "undefined") return { plan: "free", dailyOps: 0, lastReset: today() };
  try {
    const raw = localStorage.getItem(KEY);
    const state: PlanState = raw
      ? JSON.parse(raw)
      : { plan: "free", dailyOps: 0, lastReset: today() };
    if (state.lastReset !== today()) {
      state.dailyOps = 0;
      state.lastReset = today();
      localStorage.setItem(KEY, JSON.stringify(state));
    }
    return state;
  } catch {
    return { plan: "free", dailyOps: 0, lastReset: today() };
  }
}

function saveState(s: PlanState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function getPlan(): Plan {
  return getState().plan;
}

export function setPlan(plan: Plan) {
  const s = getState();
  s.plan = plan;
  saveState(s);
}

export function getDailyUsage(): { used: number; limit: number; isPremium: boolean } {
  const s = getState();
  return { used: s.dailyOps, limit: FREE_DAILY_LIMIT, isPremium: s.plan === "premium" };
}

export function incrementOps() {
  const s = getState();
  s.dailyOps += 1;
  saveState(s);
}

/** Returns true if the feature requires a premium plan */
export function isPremiumFeature(_feature: PremiumFeature): boolean {
  return true; // all listed features are premium-only
}

/** Returns true if the user can use this feature */
export function canUse(_feature: PremiumFeature): boolean {
  return getState().plan === "premium";
}

/** Returns true if the user still has daily ops available */
export function canOperate(): boolean {
  const s = getState();
  if (s.plan === "premium") return true;
  return s.dailyOps < FREE_DAILY_LIMIT;
}

/** Returns true if the file size is within plan limits */
export function fileSizeAllowed(bytes: number): boolean {
  const s = getState();
  const limitMB = s.plan === "premium" ? PREMIUM_MAX_FILE_MB : FREE_MAX_FILE_MB;
  return bytes <= limitMB * 1024 * 1024;
}
