import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: "#010101",
          light: "#eff3f4",
          border: "#d9ddde",
          white: "#ffffff",
        },
      },
      borderRadius: {
        app: "12px",
      },
      fontFamily: {
        sans: ["DM Sans", "sans-serif"],
        display: ["DM Serif Display", "serif"],
        mono: ["DM Mono", "monospace"],
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(-16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "pulse-slow": "pulse 1.5s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
