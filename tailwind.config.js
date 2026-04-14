/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'triagen': {
          'primary': '#2C3E50',
          'secondary': '#546E7A',
          'neutral': '#F8F9FA',
          'dark-bg': '#1B2A41',
          'light-bg': '#F8F9FA', // Mapped to neutral
          'text-dark': '#2C3E50', // Mapped to primary
          'text-light': '#546E7A', // Mapped to secondary
          'border-light': '#E5E7EB',
          'border-dark': '#4B5563',
          'error': '#EF4444',
        }
      },
      fontFamily: {
        'sans': ['Manrope', 'system-ui', 'sans-serif'],
        'heading': ['Newsreader', 'Georgia', 'serif'],
        'serif': ['Newsreader', 'Georgia', 'serif'],
      },
      borderRadius: {
        'xl': '0.25rem', // Flatten out previously rounded corners
        '2xl': '0.375rem',
        '3xl': '0.5rem',
      }
    },
  },
  plugins: [],
};