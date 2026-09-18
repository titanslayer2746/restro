/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f5f3ee",
        surface: "#fffdf9",
        ink: "#16140f",
        muted: "#6b665c",
        line: "#e4e0d6",
        accent: {
          DEFAULT: "#f04e23",
          dark: "#d13f17",
          soft: "#fdebe4",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
}
