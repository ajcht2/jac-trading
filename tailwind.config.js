/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0b0e14',
          panel: '#111827',
          border: '#1e293b',
          muted: '#64748b',
          text: '#e2e8f0',
        },
        gain: '#22c55e',
        loss: '#ef4444',
        accent: '#3b82f6',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
