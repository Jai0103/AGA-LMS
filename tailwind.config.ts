import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#061333",
        muted: "#56657E",
        line: "#D8E0EF",
        brand: {
          50: "#EEF5FF",
          100: "#D7E7FF",
          500: "#0B3A8D",
          600: "#082F78",
          700: "#062966",
        },
        accent: {
          50: "#FFF1EF",
          100: "#FFDAD5",
          500: "#F33325",
          600: "#D9271B",
          700: "#B91F16",
        },
      },
      boxShadow: {
        soft: "0 18px 50px rgba(8, 47, 120, 0.14)",
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
