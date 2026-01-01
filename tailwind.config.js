const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}",
  ],
  theme: {
    extend: {
      /* =========================
         Fonts
      ========================= */
      fontFamily: {
        sans: ["Cairo", "Inter var", ...fontFamily.sans],
      },

      /* =========================
         Colors – Green Herb Theme
      ========================= */
      colors: {
        herb: {
          50: "#f5fbf7",
          100: "#e9f7ef",
          200: "#c9eedb",
          300: "#9fe0c0",
          400: "#60c99a",
          500: "#2faa74",
          600: "#1f8b5c",
          700: "#1b6f4b",
          800: "#175a3e",
          900: "#134b35",
        },
      },

      /* =========================
         Border Radius
      ========================= */
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "24px",
      },

      /* =========================
         Shadows (ناعمة)
      ========================= */
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,0.06)",
        hover: "0 10px 30px rgba(0,0,0,0.08)",
      },

      /* =========================
         Background Images
      ========================= */
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
        "app-gradient":
          "linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #f0fdfa 100%)",
      },
    },
  },

  variants: {
    extend: {
      boxShadow: ["hover"],
      backgroundColor: ["active"],
    },
  },

  plugins: [],
};
