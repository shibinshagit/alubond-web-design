import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Barlow Condensed", "sans-serif"],
      },
      colors: {
        orange: {
          DEFAULT: "#F7941D",
          dark: "#D97D0A",
        },
        navy: "#0D1535",
      },
    },
  },
  plugins: [],
};

export default config;
