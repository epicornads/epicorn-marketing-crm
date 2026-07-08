/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4b6700',
          container: '#baf91a',
          fixed: '#b8f615',
          'fixed-dim': '#a0d800',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#517000',
          fixed: '#141f00',
        },
        secondary: {
          DEFAULT: '#5b5e66',
          container: '#dfe2eb',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#61646c',
        },
        tertiary: {
          DEFAULT: '#586152',
          container: '#dfe8d5',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#60695a',
        },
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#eff4ff',
          container: '#e5eeff',
          'container-high': '#dce9ff',
          'container-highest': '#d3e4fe',
          variant: '#d3e4fe',
        },
        'on-surface': {
          DEFAULT: '#0b1c30',
          variant: '#434934',
        },
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: {
          DEFAULT: '#737a61',
          variant: '#c3caad',
        },
        background: '#f8f9ff',
        'on-background': '#0b1c30',
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        hanken: ['var(--font-hanken)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
      },
    },
  },
  plugins: [],
}
