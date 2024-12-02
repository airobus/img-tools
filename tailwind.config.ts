import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--text-secondary)",
        background: "var(--background)",
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
