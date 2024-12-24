import { addIconSelectors } from '@iconify/tailwind';
import tailwindPrimeUI from 'tailwindcss-primeui';

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  safelist: [{ pattern: /col-span-(\d+)/ }],
  theme: {
    extend: {
      gridTemplateColumns: {
        form: 'max-content 1fr',
      },
      flexGrow: {
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [tailwindPrimeUI, addIconSelectors(['carbon', 'solar'])],
};
