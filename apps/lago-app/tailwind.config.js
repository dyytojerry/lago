/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 小程序设计系统颜色
        primary: {
          DEFAULT: '#00C4CC', // 科技信赖蓝
          50: '#E8F6FF',      // 浅蓝背景
          100: '#D4E7FF',     // 浅蓝边框
          500: '#00C4CC',     // 主色
          600: '#00B0B8',     // hover 状态
        },
        accent: {
          DEFAULT: '#FF8C69', // 活力橙
          50: '#FFF5F2',      // 浅橙背景
          100: '#FFE8E0',     // 浅橙边框
          500: '#FF8C69',     // 主色
          600: '#FF7A57',     // hover 状态
        },
        background: {
          DEFAULT: '#F8F8F8',  // 极浅灰 - 页面背景色
        },
        container: {
          DEFAULT: '#FFFFFF',  // 纯白 - 商品卡片、输入框、模态框
        },
        text: {
          primary: '#2A2A2A',   // 标题/正文
          secondary: '#888888', // 辅助文字
        },
      },
      borderRadius: {
        card: '8px',      // 通用圆角
        'card-lg': '12px', // 大圆角
      },
      boxShadow: {
        card: '0px 2px 4px rgba(0, 0, 0, 0.04)', // 卡片阴影
      },
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
    },
  },
  plugins: [],
};

