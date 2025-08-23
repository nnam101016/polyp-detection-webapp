module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'select-yellow': '#FFB800',
        'clear-sky': '#70Cfff',
        'egypt-blue': '#0a369d',
      },
      backgroundImage: {
        'homepage-banner': "url('/homepage_banner.jpg')",
      },
    },
  },
  plugins: [require('@tailwindcss/forms')], // optional but recommended
};
