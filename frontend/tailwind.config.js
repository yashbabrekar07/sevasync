/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        urgency: "#dc2626",
        success: "#16a34a",
        bg: "#f0f4ff",
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(37, 99, 235, 0.08), 0 1px 4px rgba(0,0,0,0.05)',
        'strong': '0 20px 60px -10px rgba(37, 99, 235, 0.18)',
        'glow': '0 0 30px rgba(37, 99, 235, 0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
