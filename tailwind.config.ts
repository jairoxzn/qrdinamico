import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#025CF3",
          hover: "#0146BD",
          light: "#EBF3FF",
          dark: "#013A9B",
        },
        navy: {
          DEFAULT: "#010B47",
          dark: "#000629",
          light: "#0A176B",
        },
        surface: {
          light: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        darkText: "#111827",
        mutedText: "#64748B",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px rgba(1, 11, 71, 0.05)",
        card: "0 4px 20px rgba(1, 11, 71, 0.08)",
        dropdown: "0 10px 30px rgba(1, 11, 71, 0.12)",
        glow: "0 0 25px rgba(2, 92, 243, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;

