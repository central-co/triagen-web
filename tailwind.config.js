/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'triagen': {
          // Core editorial palette — warm paper background, ink foreground
          'primary': '#2C3E50',
          'secondary': '#546E7A',
          'neutral': '#F7F6F3',
          'dark-bg': '#1B2A41',
          'light-bg': '#F7F6F3',
          'text-dark': '#2C3E50',
          'text-light': '#546E7A',
          'border-light': '#E7E5E0',
          'border-dark': '#4B5563',
          'error': '#DC2626',
          // Signal layer: meaning-bearing accents
          'primary-blue': '#3E5C76',
          'secondary-green': '#3F7A5E',
          'sage-tint': '#E3EDE7',
          'amber': '#B45309',
          'amber-tint': '#FBEFDC',
          'highlight-purple': '#6D5A74',
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
