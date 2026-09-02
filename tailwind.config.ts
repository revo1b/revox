import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F4F0',
        'bg-soft': '#F0EDE7',
        surface: '#FFFFFF',
        'surface-hover': '#FAF9F6',
        ink: '#262420',
        'ink-soft': '#5B584F',
        'ink-faint': '#8B8878',
        border: '#E6E2D8',
        'border-strong': '#D8D3C6',
        navy: '#1F3A5F',
        'navy-soft': '#EAF0F6',
        teal: '#2F6F6B',
        'teal-soft': '#E7F2F1',
        green: '#4C7A5D',
        'green-soft': '#EAF3EC',
        amber: '#B8863B',
        'amber-soft': '#FBF2E3',
        red: '#A9483E',
        'red-soft': '#F8EAE8',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
      },
    },
  },
  plugins: [],
};
export default config;
