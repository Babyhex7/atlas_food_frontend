/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./internal/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Atlas Food Design System — "Sains yang Hangat"
        primary: {
          DEFAULT: "#1A5C38",
          50: "#E8F5EE",
          100: "#C2E5CF",
          200: "#9CD5B0",
          300: "#6EC48A",
          400: "#3EA868",
          500: "#1A5C38",
          600: "#154B2E",
          700: "#0F3A23",
          800: "#0A2818",
          900: "#05140C",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F5A623",
          50: "#FEF6E8",
          100: "#FDE9C0",
          200: "#FBDA8E",
          300: "#F9C85C",
          400: "#F7B63A",
          500: "#F5A623",
          600: "#C8851B",
          700: "#9B6513",
          800: "#6E460C",
          900: "#412804",
        },
        background: "#FAFAF7",
        surface: "#FFFFFF",
        muted: {
          DEFAULT: "#6B7280",
          foreground: "#F3F4F6",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#1A5C38",
        foreground: "#1C1C1E",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["DM Serif Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.25s ease-out",
        blob: "blob 7s infinite",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("tailwindcss/plugin")(function({ addUtilities }) {
      addUtilities({
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
      })
    })
  ],
};
