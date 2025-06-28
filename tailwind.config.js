/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'triagen': {
          'dark-bg': '#1B2A41',
          'light-bg': '#F8FAFC',
          'primary-blue': '#00AEEF',
          'secondary-green': '#34D399',
          'highlight-purple': '#A855F7',
          'error': '#EF4444',
          'text-dark': '#1F2937',
          'text-light': '#6B7280',
          'border-light': '#E5E7EB',
          'border-dark': '#4B5563',
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