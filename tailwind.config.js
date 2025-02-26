import { addIconSelectors } from '@iconify/tailwind';
import tailwindPrimeUI from 'tailwindcss-primeui';

function genColSpan(start, end) {
  const spans = {};
  for (let i = start; i <= end; i++) {
    spans[`span-${i}`] = `span ${i} / span ${i}`;
  }
  return spans;
}

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
        60: 'repeat(60, minmax(0, 1fr))',
        form: 'max-content 1fr',
      },
      gridColumn: {
        ...genColSpan(13, 60),
      },
      flexGrow: {
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [tailwindPrimeUI, addIconSelectors(['carbon', 'solar'])],
};
