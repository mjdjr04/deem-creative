/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark:    '#0A1628',
          navy:    '#0D3472',
          mid:     '#112040',
          surface: '#1A2E4A',
          border:  '#1E3A5F',
          accent:  '#2B5BA8',
          light:   '#4A7EC7',
          white:   '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #060f1e 0%, #0D3472 45%, #071122 100%)',
        'card-gradient': 'linear-gradient(135deg, #112040 0%, #1A2E4A 100%)',
        'section-gradient': 'linear-gradient(180deg, #0A1628 0%, #0d1f3c 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
