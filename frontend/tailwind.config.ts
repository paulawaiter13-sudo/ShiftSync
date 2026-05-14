import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ops: {
          canvas: '#0B1220',
          panel: '#111827',
          elevated: '#1F2937',
          border: '#2A3441',
          foreground: '#F3F4F6',
          muted: '#9CA3AF'
        },
        sev: {
          critical: '#EF4444',
          high: '#F97316',
          medium: '#FACC15',
          low: '#22C55E'
        },
        state: {
          open: '#3B82F6',
          investigating: '#F97316',
          monitoring: '#38BDF8',
          resolved: '#22C55E',
          closed: '#6B7280',
          new: '#3B82F6',
          acknowledged: '#94A3B8'
        },
        incident: {
          glow: 'rgba(239, 68, 68, 0.12)'
        }
      },
      boxShadow: {
        card: '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 24px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 12px 32px rgba(0, 0, 0, 0.45)',
        shell: '0 0 0 1px rgba(255, 255, 255, 0.04)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }]
      },
      spacing: {
        18: '4.5rem'
      }
    }
  },
  plugins: []
} satisfies Config;
