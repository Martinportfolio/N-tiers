/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            light: '#4da6ff',
            DEFAULT: '#0078ff',
            dark: '#0057b8',
          },
        },
      },
    },
    plugins: [],
  }