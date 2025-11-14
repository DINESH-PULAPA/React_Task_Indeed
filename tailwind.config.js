/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'text': 'var(--color-text)',
        'bg': 'var(--color-bg)',
        'link': 'var(--color-link)',
        'link-hover': 'var(--color-link-hover)',
        'close': 'var(--color-close)',
      },
      fontFamily: {
        'display': ['halyard-display', 'sans-serif'],
        'narrow': ['owners-xnarrow', 'sans-serif'],
      },
      fontSize: {
        'l': 'var(--font-size-l)',
        'xl-responsive': 'var(--font-size-xl)',
      },
      spacing: {
        'page': 'var(--page-padding)',
      },
      gap: {
        'c': 'var(--c-gap)',
        'panel': 'var(--panel-gap)',
      },
    },
  },
  plugins: [],
}
