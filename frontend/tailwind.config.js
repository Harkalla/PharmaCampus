/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f9f8',
          100: '#d9f1ee',
          200: '#b4e5df',
          300: '#7dcbbb',
          400: '#4aaea1',
          500: '#218a7d',
          600: '#1a6d68',
          700: '#165e59',
          800: '#154f4b',
          900: '#143f3d'
        }
      },
      boxShadow: {
        soft: '0 12px 30px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
};
