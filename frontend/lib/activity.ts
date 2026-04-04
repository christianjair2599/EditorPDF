export interface Activity {
  id: string;
  type: "edit" | "convert";
  filename: string;
  format?: string;
  edits?: number;
  date: string;
}

export interface UserPrefs {
  lastFormat: string;
  lastFont: string;
}

const ACTIVITY_KEY = "docuflow_activity";
const PREFS_KEY = "docuflow_prefs";

export function getActivities(): Activity[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addActivity(activity: Omit<Activity, "id" | "date">) {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    date: new Date().toISOString(),
  };
  localStorage.setItem(
    ACTIVITY_KEY,
    JSON.stringify([newActivity, ...activities].slice(0, 50))
  );
}

export function getPrefs(): UserPrefs {
  if (typeof window === "undefined") return { lastFormat: "docx", lastFont: "helv" };
  try {
    return {
      lastFormat: "docx",
      lastFont: "helv",
      ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}"),
    };
  } catch {
    return { lastFormat: "docx", lastFont: "helv" };
  }
}

export function savePrefs(prefs: Partial<UserPrefs>) {
  localStorage.setItem(PREFS_KEY, JSON.stringify({ ...getPrefs(), ...prefs }));
}

export function getStats() {
  const activities = getActivities();
  return {
    total: activities.length,
    conversions: activities.filter((a) => a.type === "convert").length,
    edits: activities.filter((a) => a.type === "edit").length,
  };
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString("es", { day: "numeric", month: "short" });
}
