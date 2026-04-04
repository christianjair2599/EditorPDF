module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in":   "fadeIn 0.6s ease-out both",
        "slide-up":  "slideUp 0.6s ease-out both",
        "slide-up-delay": "slideUp 0.6s ease-out 0.15s both",
        "slide-up-delay2": "slideUp 0.6s ease-out 0.3s both",
        "float":     "float 6s ease-in-out infinite",
        "float2":    "float 6s ease-in-out 2s infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
