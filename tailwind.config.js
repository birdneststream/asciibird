import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/style.scss",
  ],
  theme: {
    extend: {
      colors: {
        // Obsidian Creative System — Surface
        surface: '#131313',
        'surface-bright': '#393939',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',

        // Obsidian Creative System — Surface content
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#c1c6d7',
        'surface-variant': '#353534',
        'surface-tint': '#adc6ff',
        'on-background': '#e5e2e1',

        // Obsidian Creative System — Primary (Electric Blue)
        primary: '#adc6ff',
        'on-primary': '#002e69',
        'primary-container': '#4b8eff',
        'on-primary-container': '#00285c',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#adc6ff',
        'on-primary-fixed': '#001a41',
        'on-primary-fixed-variant': '#004493',
        'inverse-primary': '#005bc1',

        // Obsidian Creative System — Secondary (Cyber Lime)
        secondary: '#ffffff',
        'on-secondary': '#283500',
        'secondary-container': '#c3f400',
        'on-secondary-container': '#556d00',
        'secondary-fixed': '#c3f400',
        'secondary-fixed-dim': '#abd600',
        'on-secondary-fixed': '#161e00',
        'on-secondary-fixed-variant': '#3c4d00',

        // Obsidian Creative System — Tertiary
        tertiary: '#c8c6c5',
        'on-tertiary': '#303030',
        'tertiary-container': '#929090',
        'on-tertiary-container': '#2a2a2a',
        'tertiary-fixed': '#e5e2e1',
        'tertiary-fixed-dim': '#c8c6c5',
        'on-tertiary-fixed': '#1b1b1c',
        'on-tertiary-fixed-variant': '#474746',

        // Obsidian Creative System — Inverse
        'inverse-surface': '#e5e2e1',
        'inverse-on-surface': '#313030',

        // Obsidian Creative System — Outline
        outline: '#8b90a0',
        'outline-variant': '#414755',

        // Obsidian Creative System — Error
        error: '#ffb4ab',
        'on-error': '#690005',
        'error-container': '#93000a',
        'on-error-container': '#ffdad6',

        // Obsidian Creative System — Background
        background: '#131313',
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'monospace'],
        ui: ['JetBrains Mono', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
        canvas: ['Hack', 'monospace'],
        'label-mono': ['JetBrains Mono', 'monospace'],
      },
      zIndex: {
        statusbar: '40',
        panel: '100',
        picker: '5000',
        menu: '9000',
        toast: '9500',
        modal: '10000',
      },
      fontSize: {
        'headline-lg': [
          '24px',
          { lineHeight: '32px', letterSpacing: '-0.02em', fontWeight: '600' },
        ],
        'headline-md': [
          '18px',
          { lineHeight: '24px', fontWeight: '600' },
        ],
        'body-md': [
          '14px',
          { lineHeight: '20px', fontWeight: '400' },
        ],
        'body-sm': [
          '12px',
          { lineHeight: '16px', fontWeight: '400' },
        ],
        'label-mono': [
          '12px',
          { lineHeight: '16px', fontWeight: '500' },
        ],
        'canvas-ascii': [
          '14px',
          { lineHeight: '14px', letterSpacing: '0em', fontWeight: '400' },
        ],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'gutter': '12px',
        'panel-width': '280px',
      },
      boxShadow: {
        'panel': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'panel-lg': '0px 4px 12px rgba(0, 0, 0, 0.5)',
        'panel-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
      },
    },
  },
  plugins: [
    forms,
  ],
}
