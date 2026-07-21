import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        'paper-raised': '#FFFFFF',
        ink: {
          DEFAULT: '#1C2321',
          soft: '#5B615E',
          faint: '#8B918D'
        },
        line: {
          DEFAULT: '#E3E0D8',
          strong: '#CFCBBF'
        },
        brand: {
          green: { DEFAULT: '#2D6A4F', bg: '#E7EFEA' },
          amber: { DEFAULT: '#B5851A', bg: '#F5EEDD' },
          rust: { DEFAULT: '#A13D2B', bg: '#F5E7E3' },
          blue: { DEFAULT: '#3D5A80', bg: '#E9EEF3' }
        }
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px'
      }
    }
  },
  plugins: []
} satisfies Config;
