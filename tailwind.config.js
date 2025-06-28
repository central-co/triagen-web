/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'triagen': {
          'petrol': '#1B2A41',
          'mint': '#4ECDC4',
          'light': '#F8FAFC',
          'salmon': '#FF6B6B',
          'blue': '#3B82F6',
          'dark-text': '#1F2937',
          'light-text': '#6B7280',
          'light-gray': '#F1F5F9',
          'dark-gray': '#374151',
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