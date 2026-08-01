/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        laboratory: {
          50: '#F5F6F8', // very light gray
          100: '#E9EAEF', 
          200: '#C8CAD1',
          300: '#A4A6B1',
          400: '#7F818D',
          500: '#60626E',
          600: '#464751',
          700: '#2F3038',
          800: '#1D1E24',
          900: '#0E0E12', // dark mode background
        },
        engineering: {
          primary: '#1E64C8', // Professional engineering blue
          hover: '#164B9A',
          accent: '#0A84FF',
          green: '#28A745', // Success / Go
          amber: '#FFC107', // Warning
          red: '#DC3545', // Error / Stop
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['Fira Code', 'Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'panel': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
        'panel-dark': '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.6)',
      }
    },
  },
  plugins: [],
}
