/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          dark: 'rgb(var(--brand-dark) / <alpha-value>)',
          carbon: 'rgb(var(--brand-carbon) / <alpha-value>)',
          surface: 'rgb(var(--brand-surface) / <alpha-value>)',
          elevated: 'rgb(var(--brand-elevated) / <alpha-value>)',
          border: 'rgb(var(--brand-border) / <alpha-value>)',
          'border-bright': 'rgb(var(--brand-border-bright) / <alpha-value>)',
          green: {
            DEFAULT: '#22c55e',
            neon: '#38ef7d',
            glow: '#00ff66',
            dark: '#15803d',
            light: '#86efac'
          },
          silver: {
            DEFAULT: '#cbd5e1',
            bright: '#f1f5f9',
            muted: '#64748b'
          }
        }
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(34, 197, 94, 0.4)',
        'neon-strong': '0 0 35px -2px rgba(56, 239, 125, 0.6)',
        'neon-sm': '0 0 10px -2px rgba(34, 197, 94, 0.3)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 0.8, filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 18px rgba(34, 197, 94, 0.8))' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
