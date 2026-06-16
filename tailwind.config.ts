import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background:  "#0A0A0F",
        surface:     "#12121A",
        "surface-2": "#1A1A26",
        primary: {
          DEFAULT: "#6D5EF5",
          hover:   "#8B7CFF",
        },
        accent:  "#22D3EE",
        success: "#34D399",
        warning: "#FBBF24",
        danger:  "#F87171",
      },
      boxShadow: {
        glow:      "0 0 24px rgba(109,94,245,0.35)",
        "glow-sm": "0 0 12px rgba(109,94,245,0.20)",
        "glow-lg": "0 0 48px rgba(109,94,245,0.40)",
        "glow-cyan":"0 0 24px rgba(34,211,238,0.25)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-hero":   "linear-gradient(135deg,#6D5EF5 0%,#22D3EE 100%)",
        "gradient-primary":"linear-gradient(135deg,#6D5EF5 0%,#8B7CFF 100%)",
      },
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%":     { transform: "translateY(-12px)" },
        },
        "pulse-slow": {
          "0%,100%": { opacity: "1" },
          "50%":     { opacity: "0.4" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 20px rgba(109,94,245,0.3)" },
          "50%":     { boxShadow: "0 0 40px rgba(109,94,245,0.6)" },
        },
      },
      animation: {
        "fade-in-up":  "fade-in-up 0.5s ease forwards",
        shimmer:       "shimmer 2.2s linear infinite",
        float:         "float 6s ease-in-out infinite",
        "pulse-slow":  "pulse-slow 3s ease-in-out infinite",
        "glow-pulse":  "glow-pulse 2.5s ease-in-out infinite",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
