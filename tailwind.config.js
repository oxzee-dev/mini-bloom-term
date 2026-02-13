/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bloomberg: {
          orange: "#FF6B00",
          black: "#000000",
          dark: "#141414",
          gray: "#262626",
          "light-gray": "#404040",
          green: "#00CC00",
          red: "#FF3333",
          yellow: "#FFCC00",
          blue: "#0080FF",
        },
      },
      fontFamily: {
        terminal: ['"Courier New"', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        "blink": "blink 1s step-end infinite",
        "ticker": "ticker 30s linear infinite",
      },
      keyframes: {
        "blink": {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
}
