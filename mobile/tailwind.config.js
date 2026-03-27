/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0B0E1A",
        secondary: "#141829",
        surface: "#1C2038",
        pink: "#F2A7C3",
        lavender: "#C4B1D4",
        rose: "#E8788A",
        gold: "#F5D380",
        silver: "#C8D0E0",
        success: "#7ECFA0",
        muted: "#8A8FA8",
        textDefault: "#EDE9F5",
      },
      fontFamily: {
        heading: ["Quicksand"],
        body: ["Inter"],
        handwriting: ["Caveat"],
        mono: ["JetBrainsMono"],
      },
    },
  },
  plugins: [],
};
