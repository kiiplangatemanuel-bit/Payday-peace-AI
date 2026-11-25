import type { Config } from "tailwindcss";
const config: Config = { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { forest: "#174c38", mint: "#d9f2e2" } } }, plugins: [] };
export default config;
