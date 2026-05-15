/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcf6",
          100: "#d9f7e8",
          500: "#16a34a",
          600: "#15803d",
          700: "#15803d",
          900: "#14532d"
        }
      }
    }
  },
  plugins: [],
};
