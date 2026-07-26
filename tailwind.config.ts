import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        muted: "#667085",
        line: "#E4E7EC",
        brand: {
          50: "#ECFEFF",
          100: "#CFFAFE",
          500: "#06B6D4",
          600: "#0891B2",
          700: "#0E7490",
        },
        accent: {
          500: "#F97316",
          600: "#EA580C",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(15, 23, 42, 0.10)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
