/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest:   '#1C3A2B',
        green:    '#2D6A4F',
        sage:     '#7DBF6E',
        mint:     '#A8C5A0',
        cream:    '#F5F0E8',
        offwhite: '#FAF8F3',
        charcoal: '#2A2A2A',
        muted:    '#5A5A5A',
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
};
