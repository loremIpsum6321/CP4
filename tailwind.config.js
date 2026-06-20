/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05060a',
          900: '#0a0c14',
          800: '#11141f',
          700: '#181c2b',
          600: '#222738',
          500: '#2d3349',
        },
        navy: {
          DEFAULT: '#00007a',
          50: '#eef1ff',
          400: '#4148e0',
          500: '#2a2fc4',
          600: '#1a1ea0',
          700: '#11147a',
          900: '#0a0c4d',
        },
        accent: {
          DEFAULT: '#00c4a7',
          soft: '#5eead4',
          dim: '#0a3d36',
        },
        good: {
          DEFAULT: '#22c55e',
          bg: 'rgba(34,197,94,0.12)',
          border: 'rgba(34,197,94,0.35)',
        },
        warn: {
          DEFAULT: '#eab308',
          bg: 'rgba(234,179,8,0.12)',
          border: 'rgba(234,179,8,0.35)',
        },
        bad: {
          DEFAULT: '#f43f5e',
          bg: 'rgba(244,63,94,0.12)',
          border: 'rgba(244,63,94,0.35)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 8px 30px rgba(0,0,0,0.35)',
        'glow-accent': '0 0 0 1px rgba(0,196,167,0.25), 0 0 24px rgba(0,196,167,0.18)',
        panel: '0 20px 60px -15px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,196,167,0.12), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(42,47,196,0.12), transparent)',
      },
    },
  },
  plugins: [],
};
