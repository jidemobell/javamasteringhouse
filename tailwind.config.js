/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b1020',
          900: '#172033',
          800: '#2a3654',
          700: '#374466',
        },
        accent: {
          DEFAULT: '#22d3ee',
          warm: '#f59e0b',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
