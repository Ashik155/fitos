import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#090b0e',
        s1: '#0f1117',
        s2: '#161921',
        s3: '#1c2029',
        s4: '#222636',
        gold: '#e8c27a',
        blue2: '#5b8dee',
        green2: '#4ade80',
        red2: '#f87171',
        teal2: '#2dd4bf',
        orange2: '#fb923c',
        purple2: '#a78bfa',
        text: '#eeeae3',
        muted: '#555c6b',
        muted2: '#8b93a5',
      },
      fontFamily: {
        clash: ['Clash Display', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};

export default config;
