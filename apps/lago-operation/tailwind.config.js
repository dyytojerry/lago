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
        // 运营系统设计系统颜色
        primary: {
          50: '#E3F2FD',   // 浅蓝背景
          100: '#BBDEFB',   // 浅蓝边框
          500: '#2196F3',   // 管理蓝 - 主色
          600: '#1976D2',   // hover 状态
          700: '#1565C0',   // 激活状态
          DEFAULT: '#2196F3',
        },
        success: {
          50: '#E8F5E8',
          100: '#C8E6C9',
          500: '#4CAF50',   // 成功绿
          600: '#43A047',
          DEFAULT: '#4CAF50',
        },
        warning: {
          50: '#FFF8E1',
          100: '#FFECB3',
          500: '#FF9800',   // 警告橙
          600: '#FB8C00',
          DEFAULT: '#FF9800',
        },
        error: {
          50: '#FFEBEE',
          100: '#FFCDD2',
          500: '#F44336',   // 错误红
          600: '#E53935',
          DEFAULT: '#F44336',
        },
        info: {
          50: '#E1F5FE',
          100: '#B3E5FC',
          500: '#00BCD4',   // 信息青
          600: '#00ACC1',
          DEFAULT: '#00BCD4',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',   // 背景灰
          200: '#EEEEEE',
          300: '#E0E0E0',
          500: '#9E9E9E',   // 中性灰
          600: '#757575',
          700: '#616161',
          900: '#212121',   // 标题/正文
          DEFAULT: '#9E9E9E',
        },
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
      spacing: {
        'table': '1rem',    // 表格内边距
        'card': '1.5rem',   // 卡片内边距
      },
    },
  },
  plugins: [],
};

