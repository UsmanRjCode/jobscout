import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // JobScout brand scale, built around #C11E90 (brand-600).
        brand: {
          50: "#FDF2F9",
          100: "#FBE5F3",
          200: "#F6C7E5",
          300: "#EE9BD0",
          400: "#E062B5",
          500: "#D13BA2",
          600: "#C11E90",
          700: "#A01876",
          800: "#831661",
          900: "#6C1551",
        },
        ink: {
          DEFAULT: "#18181B", // main text
          muted: "#71717A", // secondary text
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)",
        "card-hover":
          "0 4px 6px -2px rgba(16, 24, 40, 0.04), 0 12px 24px -6px rgba(16, 24, 40, 0.10)",
        brand: "0 6px 16px -6px rgba(193, 30, 144, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
