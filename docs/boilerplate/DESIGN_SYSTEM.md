# 设计系统配置指南

> **重要**: 本文档说明如何从项目文档中分析并配置设计系统到 Tailwind CSS。

## 📋 设计系统分析流程

### 1. 查找项目设计文档

首先查找项目中的设计相关文档，通常位于：
- `docs/DESIGN_SYSTEM*.md` - 设计系统文档
- `docs/PRD.md` - 产品需求文档（可能包含设计规范）
- `docs/ADMIN_PANEL_DESIGN.md` - 管理后台设计文档
- `docs/WHITEPAPER*.md` - 产品白皮书（可能包含设计说明）

### 2. 分析设计文档

从设计文档中提取以下信息：

#### 2.1 颜色系统

查找文档中的颜色定义，通常包括：
- **主色调**: 主要品牌色、主题色
- **强调色**: 用于突出显示、CTA按钮等
- **功能色**: 成功（success）、警告（warning）、错误（error）、信息（info）
- **中性色**: 文本颜色、背景色、边框色
- **色阶**: 浅色变体、深色变体、hover状态等

**查找关键词**: 
- "颜色"、"色彩"、"Color"、"Palette"
- "主色"、"强调色"、"功能色"
- HEX值、RGB值、颜色表

#### 2.2 字体系统

查找文档中的字体定义：
- **字体族**: 中文字体栈、英文字体栈
- **字体大小**: 标题、正文、辅助文字等
- **字体粗细**: 字重定义

**查找关键词**:
- "字体"、"Typography"、"字体栈"
- "字号"、"字体大小"、"Font Size"

#### 2.3 圆角系统

查找文档中的圆角定义：
- 卡片圆角、按钮圆角、输入框圆角等

**查找关键词**:
- "圆角"、"Border Radius"、"Rounded"

#### 2.4 阴影系统

查找文档中的阴影定义：
- 卡片阴影、按钮阴影、悬浮阴影等

**查找关键词**:
- "阴影"、"Shadow"、"Box Shadow"

#### 2.5 间距系统

查找文档中的间距定义：
- 页面间距、卡片内边距、组件间距等

**查找关键词**:
- "间距"、"Spacing"、"Padding"、"Margin"

### 3. 提取设计系统信息

创建一个临时的设计系统提取清单：

```markdown
## 颜色系统
- 主色: #HEX (用途: xxx)
- 强调色: #HEX (用途: xxx)
- 成功色: #HEX
- 警告色: #HEX
- 错误色: #HEX
- 背景色: #HEX
- 文本主色: #HEX
- 文本次色: #HEX

## 字体系统
- 字体栈: xxx
- 标题字号: xxpx
- 正文字号: xxpx

## 圆角系统
- 卡片圆角: xxpx
- 按钮圆角: xxpx

## 阴影系统
- 卡片阴影: xxx
- 按钮阴影: xxx

## 间距系统
- 页面间距: xxpx
- 卡片内边距: xxpx
```

### 4. 配置到 Tailwind

将提取的设计系统信息配置到 `tailwind.config.js`：

## 🎨 Tailwind CSS 配置

### 1. 安装依赖

**⚠️ 重要**: 
- 必须使用 Tailwind CSS **v3**，不要使用 v4（实验性版本）
- **必须使用 npm 安装依赖**，不要使用 pnpm

```bash
cd apps/[project]-app

# 安装 Tailwind CSS v3 及相关依赖（使用 npm）
npm install -D 'tailwindcss@^3' postcss autoprefixer eslint-plugin-tailwindcss
```

### 2. 初始化配置文件

创建以下配置文件：

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // TODO: 从设计文档中提取并配置以下内容
      colors: {
        // 主色调
        primary: {
          DEFAULT: '#YOUR_PRIMARY_COLOR', // 从设计文档提取
          50: '#YOUR_LIGHT_BG',           // 浅色背景
          100: '#YOUR_LIGHT_BORDER',      // 浅色边框
          500: '#YOUR_PRIMARY_COLOR',     // 主色
          600: '#YOUR_HOVER_COLOR',       // hover状态
        },
        // 强调色
        accent: {
          DEFAULT: '#YOUR_ACCENT_COLOR',
          // ... 色阶
        },
        // 功能色（如需要）
        success: {
          DEFAULT: '#YOUR_SUCCESS_COLOR',
          // ... 色阶
        },
        warning: {
          DEFAULT: '#YOUR_WARNING_COLOR',
          // ... 色阶
        },
        error: {
          DEFAULT: '#YOUR_ERROR_COLOR',
          // ... 色阶
        },
        // 中性色
        background: {
          DEFAULT: '#YOUR_BG_COLOR',
        },
        container: {
          DEFAULT: '#YOUR_CONTAINER_COLOR',
        },
        text: {
          primary: '#YOUR_TEXT_PRIMARY',
          secondary: '#YOUR_TEXT_SECONDARY',
        },
      },
      fontFamily: {
        // 从设计文档提取字体栈
        sans: [
          // 中文字体栈
        ],
      },
      borderRadius: {
        // 从设计文档提取圆角值
        card: 'XXpx',
        'card-lg': 'XXpx',
        button: 'XXpx',
      },
      boxShadow: {
        // 从设计文档提取阴影值
        card: 'XXX',
        'card-hover': 'XXX',
        button: 'XXX',
      },
      spacing: {
        // 从设计文档提取间距值
        section: 'XXrem',
        card: 'XXrem',
      },
    },
  },
  plugins: [],
};
```

```javascript
// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

### 3. 配置全局样式

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## 📝 配置示例

### 示例：从设计文档提取颜色

假设设计文档中有：

```markdown
## 色彩系统

| 颜色名称 | HEX 值 | 用途 |
|---------|--------|------|
| 科技信赖蓝 | `#00C4CC` | 导航栏、链接、AI 模块 |
| 活力橙 | `#FF8C69` | 核心 CTA 按钮、活动高亮 |
| 极浅灰 | `#F8F8F8` | 页面背景色 |
```

配置到 `tailwind.config.js`：

```javascript
colors: {
  primary: {
    DEFAULT: '#00C4CC',  // 科技信赖蓝
    500: '#00C4CC',
    600: '#00B0B8',      // 根据主色生成hover色
  },
  accent: {
    DEFAULT: '#FF8C69',  // 活力橙
    500: '#FF8C69',
    600: '#FF7A57',      // hover色
  },
  background: {
    DEFAULT: '#F8F8F8',  // 极浅灰
  },
}
```

## ✅ 检查清单

配置设计系统时，确保：

- [ ] 已查找并阅读项目设计文档
- [ ] 已提取所有颜色定义（主色、强调色、功能色、中性色）
- [ ] 已提取字体系统定义
- [ ] 已提取圆角、阴影、间距定义
- [ ] 已安装 Tailwind CSS v3（使用 npm）
- [ ] 已配置 `tailwind.config.js`（包含提取的设计系统）
- [ ] 已配置 `postcss.config.mjs`
- [ ] 已在 `globals.css` 中导入 Tailwind
- [ ] 已测试设计系统类名是否生效
- [ ] 已配置 ESLint Tailwind 插件

## 🔍 如果找不到设计文档

如果项目中没有设计文档，可以：

1. **询问产品/设计团队**: 获取设计规范文档
2. **参考现有页面**: 从现有UI中提取颜色值（使用浏览器开发者工具）
3. **使用默认值**: 先使用 Tailwind 默认颜色，后续再更新

## 💡 提示

- **保持一致性**: 确保设计系统配置与实际设计文档一致
- **定期更新**: 当设计文档更新时，同步更新 Tailwind 配置
- **文档化**: 在代码注释中标注颜色来源，便于维护

---

**重要**: 设计系统必须从项目文档中提取，不要使用模板中的示例值。

