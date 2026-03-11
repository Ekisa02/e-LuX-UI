module.exports = {
  content: [
    "./frontend/src/**/*.{js,jsx,ts,tsx}",
    "./frontend/public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: '#00ff41',      // Matrix green
          secondary: '#0a0a0a',     // Dark background
          accent: '#ff00ff',        // Magenta for highlights
          warning: '#ffff00',       // Yellow
          danger: '#ff0000',        // Red
          info: '#00ffff',          // Cyan
          dark: '#0c0c0c',          // Almost black
          panel: '#1a1a1a',         // Panel background
          border: '#2a2a2a'         // Border color
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', '"Courier New"', 'monospace'],
        cyber: ['"Share Tech Mono"', 'monospace']
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'scan': 'scan 2s linear infinite',
        'pulse-green': 'pulse-green 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flicker': 'flicker 2s linear infinite'
      },
      keyframes: {
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' }
        },
        'scan': {
          '0%': { top: '0%' },
          '100%': { top: '100%' }
        },
        'pulse-green': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 }
        },
        'flicker': {
          '0%, 100%': { opacity: 1 },
          '41.99%': { opacity: 1 },
          '42%': { opacity: 0 },
          '43%': { opacity: 0 },
          '43.01%': { opacity: 1 },
          '45.99%': { opacity: 1 },
          '46%': { opacity: 0 },
          '46.99%': { opacity: 0 },
          '47%': { opacity: 1 }
        }
      }
    },
  },
  plugins: [],
}