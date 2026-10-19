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
        paper: {
          bg: "#F4F1EA",
          surface: "#FFFFFF",
          muted: "#EAE6DC",
        },
        ink: {
          primary: "#141413",
          secondary: "#484641",
        },
        border: {
          strong: "#141413",
          subtle: "#C8C3B8",
        },
        vermilion: {
          DEFAULT: "#B83214",
          hover: "#96270E",
        },
        forest: {
          DEFAULT: "#165B33",
        },
        navy: {
          DEFAULT: "#1D3557",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
