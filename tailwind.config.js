/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nanosat-blue': '#1f4e79',
        'nanosat-light': '#3b82f6',
      }
    },
  },
  plugins: [],
}
