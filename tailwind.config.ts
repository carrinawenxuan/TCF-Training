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
        primary: "var(--primary)",
        accent: "var(--accent)",
        success: "var(--success)",
        error: "var(--error)",
        co: "#3b82f6",
        ce: "#10b981",
        ee: "#f59e0b",
        eo: "#8b5cf6",
        "assist-bg": "#fef3c7",
        "vocab-bg": "#dbeafe",
      },
    },
  },
  plugins: [],
};
export default config;
