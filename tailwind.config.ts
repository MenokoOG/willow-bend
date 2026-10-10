import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // Voxel Art: every corner is square. Overriding (not extending) the scale
    // makes all `rounded-*` utilities, including `rounded-full`, resolve to 0.
    borderRadius: {
      none: "0px",
      sm: "0px",
      DEFAULT: "0px",
      md: "0px",
      lg: "0px",
      xl: "0px",
      "2xl": "0px",
      "3xl": "0px",
      full: "0px",
    },
    extend: {
      fontFamily: {
        display: ['"Press Start 2P"', '"Space Grotesk"', "monospace"],
        sans: ['"Space Grotesk"', '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"VT323"', "ui-monospace", "monospace"],
      },
      colors: {
        ink: {
          950: "#10140d",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
