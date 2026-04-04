"use client";

import { useTheme } from "./ThemeProvider";

export default function DarkModeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-2 rounded-lg transition-colors ${
        isDark
          ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
      aria-label="Toggle dark mode"
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
