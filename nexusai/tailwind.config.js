/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Syne", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        display: ["Orbitron", "monospace"],
      },
      colors: {
        nexus: {
          bg: "#03030a",
          card: "#0d0d16",
          elevated: "#13131f",
          primary: "#00d4ff",
          secondary: "#7850ff",
          accent: "#a070ff",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          cyan: "#00d4ff",
          violet: "#7850ff",
        },
      },
      boxShadow: {
        glow: "0 0 20px rgba(0,212,255,0.25)",
        "glow-lg": "0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(0,212,255,0.1)",
        "glow-violet": "0 0 20px rgba(120,80,255,0.3)",
        "inner-glow": "inset 0 0 20px rgba(0,212,255,0.05)",
      },
      backgroundImage: {
        "nexus-grid":
          "linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)",
        "cyan-violet":
          "linear-gradient(135deg, #00d4ff, #7850ff)",
        "dark-surface":
          "linear-gradient(160deg, #0d0d16 0%, #03030a 100%)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "spin-reverse": "spin-reverse 12s linear infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "fade-in": "fadeIn 0.6s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        shimmer: "nexus-shimmer 1.4s infinite",
      },
      keyframes: {
        "spin-reverse": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(-360deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(0,212,255,0.3)" },
          "50%": { boxShadow: "0 0 25px rgba(0,212,255,0.7), 0 0 50px rgba(0,212,255,0.3)" },
        },
        scan: {
          "0%": { backgroundPosition: "0 -100%" },
          "100%": { backgroundPosition: "0 200%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
