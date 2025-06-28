/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'triagen': {
          'petrol': '#1B2A41',
          'mint': '#7FFFD4',
          'light': '#F5F5F7',
          'salmon': '#FF857A',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};