const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/**
 * Generate color palette similar to Fuse but independent
 */
function generatePalette(color) {
  return {
    50: `color-mix(in srgb, ${color} 5%, white)`,
    100: `color-mix(in srgb, ${color} 10%, white)`,
    200: `color-mix(in srgb, ${color} 20%, white)`,
    300: `color-mix(in srgb, ${color} 30%, white)`,
    400: `color-mix(in srgb, ${color} 40%, white)`,
    500: color,
    600: `color-mix(in srgb, ${color} 80%, black)`,
    700: `color-mix(in srgb, ${color} 70%, black)`,
    800: `color-mix(in srgb, ${color} 60%, black)`,
    900: `color-mix(in srgb, ${color} 50%, black)`,
    DEFAULT: color,
  };
}

/**
 * Custom palettes for ChatFrontend
 */
const customPalettes = {
  primary: generatePalette('#233559'),
  brandRed: generatePalette('#C90000'),
  brandGray: generatePalette('#87898C'),
  brandLight: generatePalette('#BEBEBE'),
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector', '.dark'],
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/*.component.html",
    "./src/**/*.component.ts",
    "./styles/**/*.scss"
  ],
  important: true,
  theme: {
    fontSize: {
      xs: '0.625rem',
      sm: '0.75rem',
      md: '0.8125rem',
      base: '0.875rem',
      lg: '1rem',
      xl: '1.125rem',
      '2xl': '1.25rem',
      '3xl': '1.5rem',
      '4xl': '2rem',
      '5xl': '2.25rem',
      '6xl': '2.5rem',
      '7xl': '3rem',
      '8xl': '4rem',
      '9xl': '6rem',
      '10xl': '8rem',
    },
    screens: {
      sm: '600px',
      md: '960px',
      lg: '1280px',
      xl: '1440px'
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      colors: {
        // Corporate colors
        primary: customPalettes.primary,
        brandRed: customPalettes.brandRed,
        brandGray: customPalettes.brandGray,
        brandLight: customPalettes.brandLight,
        
        // Standard colors
        gray: colors.slate,
        accent: {
          ...colors.slate,
          DEFAULT: colors.slate[800],
        },
        warn: {
          ...colors.red,
          DEFAULT: colors.red[600],
        },
        
        // Custom semantic colors for theming
        default: {
          light: '#ffffff',
          dark: '#1a1a1a',
          DEFAULT: '#ffffff',
        },
        card: {
          light: '#ffffff',
          dark: '#2d2d2d',
          DEFAULT: '#ffffff',
        },
        disabled: {
          light: '#9ca3af',
          dark: '#6b7280',
          DEFAULT: '#9ca3af',
        },
      },
      flex: {
        0: '0 0 auto',
      },
      fontFamily: {
        sans: `"Inter var", ${defaultTheme.fontFamily.sans.join(',')}`,
        mono: `"IBM Plex Mono", ${defaultTheme.fontFamily.mono.join(',')}`,
      },
      opacity: {
        12: '0.12',
        38: '0.38',
        87: '0.87',
      },
      rotate: {
        '-270': '270deg',
        15: '15deg',
        30: '30deg',
        60: '60deg',
        270: '270deg',
      },
      scale: {
        '-1': '-1',
      },
      zIndex: {
        '-1': -1,
        49: 49,
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        99: 99,
        999: 999,
        9999: 9999,
        99999: 99999,
      },
      spacing: {
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        50: '12.5rem',
        90: '22.5rem',
        100: '25rem',
        120: '30rem',
        128: '32rem',
        140: '35rem',
        160: '40rem',
        180: '45rem',
        192: '48rem',
        200: '50rem',
        240: '60rem',
        256: '64rem',
        280: '70rem',
        320: '80rem',
        360: '90rem',
        400: '100rem',
        480: '120rem',
        '1/2': '50%',
        '1/3': '33.333333%',
        '2/3': '66.666667%',
        '1/4': '25%',
        '2/4': '50%',
        '3/4': '75%',
      },
      minHeight: ({ theme }) => ({
        ...theme('spacing'),
      }),
      maxHeight: {
        none: 'none',
      },
      minWidth: ({ theme }) => ({
        ...theme('spacing'),
        screen: '100vw',
      }),
      maxWidth: ({ theme }) => ({
        ...theme('spacing'),
        screen: '100vw',
      }),
      transitionDuration: {
        400: '400ms',
      },
      transitionTimingFunction: {
        drawer: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
    },
  },
  corePlugins: {
    appearance: false,
    container: false,
    float: false,
    clear: false,
    placeholderColor: false,
    placeholderOpacity: false,
    verticalAlign: false,
  },
  plugins: [
    // Custom plugin to define semantic classes
    function({ addUtilities, addBase, addComponents }) {
      // Add icon size utilities in utilities layer
      addUtilities({
        '.icon-size-3': { width: '0.75rem', height: '0.75rem' },
        '.icon-size-4': { width: '1rem', height: '1rem' },
        '.icon-size-5': { width: '1.25rem', height: '1.25rem' },
        '.icon-size-6': { width: '1.5rem', height: '1.5rem' },
        '.icon-size-7': { width: '1.75rem', height: '1.75rem' },
        '.icon-size-8': { width: '2rem', height: '2rem' },
        '.icon-size-10': { width: '2.5rem', height: '2.5rem' },
        '.icon-size-12': { width: '3rem', height: '3rem' },
        '.icon-size-14': { width: '3.5rem', height: '3.5rem' },
        '.icon-size-16': { width: '4rem', height: '4rem' },
        '.icon-size-20': { width: '5rem', height: '5rem' },
        '.icon-size-24': { width: '6rem', height: '6rem' },
        '.icon-size-32': { width: '8rem', height: '8rem' },
        '.icon-size-40': { width: '10rem', height: '10rem' },
        '.icon-size-48': { width: '12rem', height: '12rem' },
        '.icon-size-56': { width: '14rem', height: '14rem' },
        '.icon-size-64': { width: '16rem', height: '16rem' },
      });
      
      // Add semantic color utilities in utilities layer
      addUtilities({
        // Background utilities
        '.bg-default': {
          backgroundColor: '#ffffff',
        },
        '.bg-card': {
          backgroundColor: '#ffffff',
        },
        
        // Text utilities  
        '.text-default': {
          color: '#111827', // gray-900
        },
        '.text-secondary': {
          color: '#4b5563', // gray-600
        },
        '.text-disabled': {
          color: '#9ca3af',
        },
        '.text-hint': {
          color: '#9ca3af', // gray-400
        },
        '.text-on-primary': {
          color: '#ffffff', // white text on primary background
        },
        '.text-on-accent': {
          color: '#ffffff', // white text on accent background
        },
        '.text-on-warn': {
          color: '#ffffff', // white text on warn background
        },
        
        // Border utilities
        '.border-default': {
          borderColor: '#e5e7eb', // gray-200
        },
        
        // Dark mode variants
        '.dark .bg-default': {
          backgroundColor: '#1a1a1a',
        },
        '.dark .bg-card': {
          backgroundColor: '#2d2d2d',
        },
        '.dark .text-default': {
          color: '#f9fafb', // gray-100
        },
        '.dark .text-secondary': {
          color: '#9ca3af', // gray-400
        },
        '.dark .text-disabled': {
          color: '#6b7280',
        },
        '.dark .text-hint': {
          color: '#4b5563', // gray-600
        },
        '.dark .text-on-primary': {
          color: '#ffffff', // white text on primary background (same in dark)
        },
        '.dark .text-on-accent': {
          color: '#ffffff', // white text on accent background (same in dark)
        },
        '.dark .text-on-warn': {
          color: '#ffffff', // white text on warn background (same in dark)
        },
        '.dark .border-default': {
          borderColor: '#374151', // gray-700
        },
      });
    },
  ],
};

