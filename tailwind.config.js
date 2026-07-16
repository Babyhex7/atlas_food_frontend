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
        // Atlas Food Design System — mapped to CSS custom properties in globals.css
        // so Tailwind utilities and inline var(--*) usages stay in sync from one source of truth.
        primary: {
          DEFAULT: "var(--color-primary)",
          hover:   "var(--color-primary-hover)",
          active:  "var(--color-primary-active)",
          light:   "var(--color-primary-light)",
          muted:   "var(--color-primary-muted)",
          border:  "var(--color-primary-border)",
          foreground: "var(--color-white)",
        },
        accent: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-white)",
        },
        background: "var(--color-bg)",
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        muted: {
          DEFAULT: "var(--color-text-muted)",
          foreground: "var(--color-bg)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        foreground: "var(--color-text-primary)",
        success: {
          DEFAULT: "var(--color-success)",
          light: "var(--color-success-light)",
          border: "var(--color-success-border)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          light: "var(--color-warning-light)",
          border: "var(--color-warning-border)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          hover:  "var(--color-danger-hover)",
          active: "var(--color-danger-active)",
          light:  "var(--color-danger-light)",
          border: "var(--color-danger-border)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          light: "var(--color-info-light)",
          border: "var(--color-info-border)",
        },
        text: {
          primary:      "var(--color-text-primary)",
          secondary:    "var(--color-text-secondary)",
          muted:        "var(--color-text-muted)",
          placeholder:  "var(--color-text-placeholder)",
          disabled:     "var(--color-text-disabled)",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono:    ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      fontSize: {
        xs:   "var(--text-xs)",
        sm:   "var(--text-sm)",
        base: "var(--text-base)",
        md:   "var(--text-md)",
        lg:   "var(--text-lg)",
        xl:   "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
      },
      fontWeight: {
        light:    "var(--weight-light)",
        regular:  "var(--weight-regular)",
        medium:   "var(--weight-medium)",
        semibold: "var(--weight-semibold)",
        bold:     "var(--weight-bold)",
      },
      lineHeight: {
        tight:   "var(--leading-tight)",
        snug:    "var(--leading-snug)",
        normal:  "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
      },
      spacing: {
        1:  "var(--space-1)",
        2:  "var(--space-2)",
        3:  "var(--space-3)",
        4:  "var(--space-4)",
        5:  "var(--space-5)",
        6:  "var(--space-6)",
        8:  "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        16: "var(--space-16)",
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        xs:   "var(--shadow-xs)",
        sm:   "var(--shadow-sm)",
        md:   "var(--shadow-md)",
        lg:   "var(--shadow-lg)",
        xl:   "var(--shadow-xl)",
        card: "var(--shadow-card)",
        focus: "var(--focus-ring)",
      },
      zIndex: {
        base:     "var(--z-base)",
        raised:   "var(--z-raised)",
        dropdown: "var(--z-dropdown)",
        sticky:   "var(--z-sticky)",
        overlay:  "var(--z-overlay)",
        modal:    "var(--z-modal)",
        toast:    "var(--z-toast)",
        tooltip:  "var(--z-tooltip)",
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
