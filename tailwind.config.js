import { addIconSelectors } from '@iconify/tailwind';
import tailwind_bootstrap_grid from 'tailwind-bootstrap-grid';
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
        1: '1',
        2: '2',
        3: '3',
      },
    },
  },
  plugins: [
    tailwindPrimeUI,
    addIconSelectors(['carbon', 'solar']),
    tailwind_bootstrap_grid({
      container_max_widths: [
        'sm',
        '540px',
        'md',
        '720px',
        'lg',
        '960px',
        'xl',
        '1140px',
        '2xl',
        '1320px',
      ],
      grid_gutters: ['2', '0.5rem'],
    }),
  ],
};
