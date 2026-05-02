/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dde6ff',
          200: '#c0cfff',
          300: '#93adff',
          400: '#607eff',
          500: '#3a50ff',
          600: '#1f2ef5',
          700: '#1720e1',
          800: '#191cb6',
          900: '#1b1e8f',
          950: '#111261',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
