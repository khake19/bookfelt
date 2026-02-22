/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Raw palette — the actual colors
        cream: {
          DEFAULT: '#F8F4EE',
          light: '#FDFBF7',
        },
        bark: '#3D2B1F',
        sage: '#4A6741',
        muted: '#9A8F85',

        // Semantic tokens — use these in components
        background: {
          DEFAULT: '#FDFBF7',  // cream-light: main screen bg
          card: '#F8F4EE',     // cream: cards, surfaces
        },
        foreground: {
          DEFAULT: '#3D2B1F',  // bark: primary text
          muted: '#9A8F85',    // muted: labels, secondary text
        },
        primary: {
          DEFAULT: '#4A6741',  // sage: main CTA buttons, links
          foreground: '#FDFBF7', // text on primary buttons
        },
        secondary: {
          DEFAULT: '#F8F4EE',  // cream: cancel, back, less prominent actions
          foreground: '#3D2B1F', // bark: text on secondary buttons
        },
        accent: {
          DEFAULT: '#4A6741',  // sage: highlights, icons
        },
        destructive: {
          DEFAULT: '#A0522D',  // sienna: errors, delete actions
        },
        border: {
          DEFAULT: '#E8E2DA',  // slightly darker cream for borders
        },
      },
    },
  },
  plugins: [],
}

