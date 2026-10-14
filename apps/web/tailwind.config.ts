import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          maroon: {
            50: '#FDF2F3',
            100: '#FBE4E6',
            200: '#F7CCD0',
            300: '#EF9AA2',
            400: '#E45E6B',
            500: '#B81D2D',
            600: '#8E1321', // Primary brand maroon
            700: '#7A131A', // Deep tandoori maroon
            800: '#540810',
            900: '#38040A',
            950: '#1C0205',
          },
          gold: {
            50: '#FFFBEB',
            100: '#FEF3C7',
            200: '#FDE68A',
            300: '#FCD34D',
            400: '#FBBF24',
            500: '#F59E0B',
            600: '#D97706', // Royal saffron gold
            700: '#B45309',
            800: '#92400E',
            900: '#78350F',
          },
          cream: {
            50: '#FFFDF9',
            100: '#FAF4E8',
            200: '#F5E8D2',
            300: '#ECD5B0',
            400: '#DEC08A',
            500: '#CDB175',
          },
          veg: '#1E7E34',
          nonveg: '#9E1A1A',
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 10px 25px -5px rgba(122, 19, 26, 0.1), 0 8px 10px -6px rgba(122, 19, 26, 0.05)',
        'gold-glow': '0 0 20px -3px rgba(217, 119, 6, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
