/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@mriqbox/ui-kit/tailwind-preset')],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@mriqbox/ui-kit/dist/**/*.{js,mjs}',
  ],
  plugins: [require('tailwindcss-animate')],
}
