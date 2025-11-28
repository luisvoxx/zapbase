/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0A0A0A',
        'bg-secondary': '#1A1A1A',
        'bg-tertiary': '#151515',
        'bg-input': '#1E1E1E',
        'border-primary': '#2A2A2A',
        'text-primary': '#FFFFFF',
        'text-secondary': '#B0B0B0',
        'text-muted': '#808080',
        'accent-green': '#00FF41',
        'accent-red': '#FF0040',
        'accent-orange': '#FF8C00',
        'accent-cyan': '#00D9FF',
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 65, 0.5)',
        'glow-red': '0 0 20px rgba(255, 0, 64, 0.5)',
        'glow-orange': '0 0 15px rgba(255, 140, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
