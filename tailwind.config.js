/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      borderRadius: {
        wall: '12px',
        'wall-lg': '16px',
      },
      colors: {
        wall: {
          black: '#0a0a0a',
          white: '#fafafa',
          muted: '#737373',
          accent: '#e8a838',
          'accent-light': '#f5c76a',
          cork: '#8b6914',
        },
      },
      boxShadow: {
        wall: '0 4px 24px rgba(0,0,0,0.12)',
        'wall-lg': '0 8px 32px rgba(0,0,0,0.18)',
        sticky: '2px 4px 12px rgba(0,0,0,0.15)',
        glow: '0 0 40px rgba(232, 168, 56, 0.15)',
      },
      maxWidth: {
        content: '72rem',
      },
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
}
