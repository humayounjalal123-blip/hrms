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
          DEFAULT: "#14532d",
          dark: "#052e16",
          light: "#15803d",
          soft: "#ecfdf3",
          muted: "#bbf7d0",
          mist: "#f0fdf4",
        },
        gold: {
          DEFAULT: "#c9a227",
          soft: "#f8efd2",
          deep: "#8a6b12",
        },
        // Flat aliases so opacity utilities + @apply stay reliable
        "gold-soft": "#f8efd2",
        "gold-deep": "#8a6b12",
        ink: {
          DEFAULT: "#0c1a12",
          soft: "#2f4639",
          mute: "#61786a",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        serif: ["var(--font-display)", "Georgia", "serif"],
        arabic: ["var(--font-arabic)", "Noto Naskh Arabic", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(255,255,255,0.8) inset, 0 18px 44px rgba(5, 46, 22, 0.08)",
        lift: "0 30px 60px rgba(5, 46, 22, 0.16)",
        nav: "0 14px 36px rgba(5, 46, 22, 0.12)",
        glow: "0 0 0 4px rgba(201, 162, 39, 0.18), 0 16px 32px rgba(5, 46, 22, 0.18)",
        gold: "0 10px 28px rgba(201, 162, 39, 0.28)",
      },
      borderRadius: {
        panel: "1.85rem",
      },
      backgroundImage: {
        "mesh-green":
          "radial-gradient(ellipse at 12% 8%, rgba(201,162,39,0.14), transparent 42%), radial-gradient(ellipse at 88% 0%, rgba(20,83,45,0.16), transparent 40%), radial-gradient(ellipse at 50% 100%, rgba(187,247,208,0.55), transparent 52%)",
        "arch-fade":
          "linear-gradient(155deg, #052e16 0%, #14532d 42%, #166534 78%, #1a4d2e 100%)",
        "gold-sheen":
          "linear-gradient(120deg, transparent 20%, rgba(248,239,210,0.35) 45%, transparent 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
