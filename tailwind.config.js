/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#A8B5D1',
        'primary-light': '#C5D0E8',
        'primary-dark': '#8A9BBF',
        'secondary': '#B8D4C7',
        'accent': '#E8C4A0',
        'soft-pink': '#F4D1C7',
        'soft-lavender': '#DFD3E8',
        'gray-50': '#FAFAFA',
        'gray-100': '#F5F5F5',
        'gray-200': '#E8E8E8',
        'gray-300': '#D1D1D1',
        'gray-400': '#A8A8A8',
        'gray-500': '#7A7A7A',
        'gray-600': '#5C5C5C',
        'success': '#9AE6B4',
        'warning': '#F6E05E',
        'error': '#FEB2B2',
        'info': '#BEE3F8',
      },
    },
  },
  plugins: [],
}