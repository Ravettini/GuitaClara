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
        primary: {
          DEFAULT: '#3B82F6',
          soft: '#EFF6FF',
          dark: '#2563EB',
        },
        success: {
          DEFAULT: '#10B981',
          soft: '#D1FAE5',
          dark: '#059669',
        },
        danger: {
          DEFAULT: '#EF4444',
          soft: '#FEE2E2',
          dark: '#DC2626',
        },
        warning: {
          DEFAULT: '#F59E0B',
          soft: '#FEF3C7',
          dark: '#D97706',
        },
        info: {
          DEFAULT: '#6366F1',
          soft: '#E0E7FF',
          dark: '#4F46E5',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F9FAFB',
          elevated: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          tertiary: '#9CA3AF',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '20px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px rgba(15,23,42,0.06)',
        elevated: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display': ['28px', { lineHeight: '36px', fontWeight: '600' }],
        'h1': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h2': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '24px', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        'caption': ['12px', { lineHeight: '16px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

