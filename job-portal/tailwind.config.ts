import type { Config } from 'tailwindcss';

// Canonical Tailwind config – mirrors tailwind.config.js.
// Having both .js and .ts can cause conflicts, but both are kept here
// because some tooling expects .ts. If editing, edit BOTH files.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2563EB', dark: '#1E3A8A', light: '#EFF6FF' },
        accent: {
          indigo: '#6366F1',
          teal: '#0D9488',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        surface: { 
          white: '#FFFFFF', 
          light: '#F1F5F9', 
          mid: '#E2E8F0',
          page: '#F1F5F9',
          card: '#FFFFFF',
        },
        text: { primary: '#0F172A', secondary: '#475569', muted: '#94A3B8' },
        sidebar: { bg: '#0F172A', active: '#2563EB' },
        brand: {
          primary: '#2563EB',
          'primary-hover': '#1D4ED8',
          'primary-light': '#EFF6FF',
          navy: '#0F172A',
          surface: '#F1F5F9',
          border: '#E2E8F0',
          'text-primary': '#0F172A',
          'text-secondary': '#475569',
          success: '#0D9488',
          'success-light': '#EFF6FF',
          warning: '#F59E0B',
          'warning-light': '#FEF3C7',
          danger: '#F43F5E',
          'danger-light': '#FEE2E2',
          info: '#6366F1',
          'info-light': '#EEF2FF',
          // extended values
          blue: '#2563EB',
          bluedark: '#1E3A8A',
          bluelight: '#EFF6FF',
          indigo: '#6366F1',
          teal: '#0D9488',
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.10)',
        'lg': '0 8px 32px rgba(0,0,0,0.12)',
        'blue': '0 4px 24px rgba(37,99,235,0.22)',
        card: '0 1px 3px rgba(0,0,0,0.08)',
        lift: '0 4px 16px rgba(0,0,0,0.10)',
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '20px',
        xl2: '20px',
      }
    },
  },
  plugins: [],
};

export default config;
