/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Main Backgrounds
        'bg-main': '#0F172A',
        'bg-secondary': '#1E293B',
        'bg-card': '#1F2937',
        'bg-sidebar': '#111827',
        'bg-hover': '#334155',
        'bg-selected': '#1D4ED8',

        // Primary
        'primary': '#3B82F6',
        'primary-hover': '#2563EB',

        // Accents
        'accent-cyan': '#06B6D4',
        'accent-purple': '#8B5CF6',

        // Status
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error': '#EF4444',
        'info': '#38BDF8',

        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'text-muted': '#94A3B8',
        'text-disabled': '#64748B',

        // Borders
        'border-default': '#334155',
        'border-active': '#3B82F6',
        'divider': '#475569',
      },
      fontFamily: {
        sans: ['Satoshi', 'system-ui', 'sans-serif'],
        display: ['Italianno', 'cursive'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': ['36px', { lineHeight: '1.1', fontWeight: '700' }],
        'section': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'card-title': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'sidebar-heading': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
        'code': ['14px', { lineHeight: '1.6', fontWeight: '500' }],
      },
      borderRadius: {
        'btn': '10px',
        'card': '16px',
        'input': '10px',
        'modal': '20px',
        'node': '14px',
      },
      boxShadow: {
        'card': '0 10px 30px rgba(0,0,0,0.35)',
        'hover': '0 15px 40px rgba(59,130,246,0.25)',
        'modal': '0 20px 60px rgba(0,0,0,0.45)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'section': '64px',
      },
      maxWidth: {
        'content': '1400px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
