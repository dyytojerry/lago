/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Lago 设计系统 - 颜色
      colors: {
        // 主色：科技信赖蓝
        primary: {
          DEFAULT: '#00C4CC',
          50: '#E8F6FF',
          100: '#D4E7FF',
          200: '#B8E6F0',
          300: '#A6D9FF',
          400: '#7BC8D9',
          500: '#00C4CC',
          600: '#00B0B8',
          700: '#009CA4',
          800: '#008890',
          900: '#00747C',
        },
        // 强调色：活力橙
        accent: {
          DEFAULT: '#FF8C69',
          50: '#FFF5F2',
          100: '#FFE8E0',
          200: '#FFD4C2',
          300: '#FFB9A7',
          400: '#FF9D80',
          500: '#FF8C69',
          600: '#FF7A57',
          700: '#FF6845',
          800: '#FF5633',
          900: '#FF4421',
        },
        // 背景色
        background: {
          DEFAULT: '#F8F8F8',
          light: '#F7FBFF',
          lighter: '#FFFFFF',
        },
        // 容器色
        container: {
          DEFAULT: '#FFFFFF',
        },
        // 文本色
        text: {
          DEFAULT: '#2A2A2A',
          primary: '#2A2A2A',
          secondary: '#4B5563',
          tertiary: '#888888',
          light: '#1F2A37',
          dark: '#0B1120',
        },
      },
      // 字体系统
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      // 字重
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      // 圆角系统
      borderRadius: {
        'card': '0.75rem',      // 12px - 卡片圆角
        'card-lg': '1rem',      // 16px - 大卡片圆角
        'card-xl': '1.5rem',    // 24px - 超大卡片圆角
        'button': '9999px',     // 胶囊按钮
      },
      // 阴影系统
      boxShadow: {
        'card': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'button': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 6px 12px rgba(0, 0, 0, 0.15)',
        'elevated': '0 10px 25px rgba(0, 196, 204, 0.1)',
        'elevated-lg': '0 20px 40px rgba(0, 196, 204, 0.15)',
      },
      // 间距系统（基于设计系统）
      spacing: {
        'section': '3rem',      // 48px - Section 间距
        'section-lg': '4rem',   // 64px - 大 Section 间距
        'card': '1.5rem',       // 24px - 卡片内边距
        'card-lg': '2rem',      // 32px - 大卡片内边距
      },
      // 渐变
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, #F7FBFF, #FFFFFF, #F7FBFF)',
        'gradient-card': 'linear-gradient(to bottom right, #F1F9FF, #FFFFFF, #FFF5F2)',
        'gradient-accent': 'linear-gradient(to right, #00C4CC, rgba(0, 196, 204, 0.8))',
        'gradient-orange': 'linear-gradient(to right, #FF8C69, rgba(255, 140, 105, 0.8))',
        'gradient-lago': 'linear-gradient(to bottom, #F7FBFF, #FFFFFF, #F7FBFF)',
      },
      // 动画
      transitionDuration: {
        'default': '300ms',
        'fast': '150ms',
        'slow': '500ms',
      },
      // 响应式断点（基于设计系统）
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
};
