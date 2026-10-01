/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554',
        },
        surface: '#F8FAFC',
        card:    '#FFFFFF',
        border:  '#E2E8F0',
        muted:   '#F1F5F9',
        success: '#22C55E',
        warning: '#F59E0B',
        danger:  '#EF4444',
        ink: {
          DEFAULT: '#172554',
          secondary: '#64748B',
          tertiary: '#94A3B8',
        },
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px 0 rgba(0,0,0,0.08), 0 1px 3px 0 rgba(0,0,0,0.05)',
        'card-lg': '0 8px 24px 0 rgba(0,0,0,0.10), 0 2px 6px 0 rgba(0,0,0,0.06)',
        'input': '0 0 0 3px rgba(37,99,235,0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'slide-in-r': 'slideInRight 0.25s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
