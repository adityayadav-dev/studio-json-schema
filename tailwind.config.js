import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {

      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: '100ch', // Increase max width for better readability on wide screens
            color: theme('colors.slate.700'),
            a: {
              color: theme('colors.blue.600'),
              '&:hover': {
                color: theme('colors.blue.800'),
              },
            },
            // Enhance headings
            h1: {
              fontWeight: '800',
              letterSpacing: '-0.025em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.slate.300'),
            a: {
              color: theme('colors.blue.400'),
              '&:hover': {
                color: theme('colors.blue.300'),
              },
            },
            h1: {
              color: theme('colors.white'),
            },
            h2: {
              color: theme('colors.slate.100'),
            },
            h3: {
              color: theme('colors.slate.200'),
            },
            strong: {
              color: theme('colors.white'),
            },
            code: {
              color: theme('colors.slate.200'),
              backgroundColor: theme('colors.slate.800'),
            }
          }
        }
      }),
    },
  },
  darkMode: ['class', '[data-theme="dark"]'], // Ensure class-based dark mode works with 'prose-invert' if needed, or matched your app's usage
  plugins: [
    typography,
  ],
}

