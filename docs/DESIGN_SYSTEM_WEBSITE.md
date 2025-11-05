# Lago 官网设计系统

> **用途**: 产品官网（PC + Mobile）的设计系统规范  
> **适用场景**: `apps/lago` 官网项目

## 🎯 设计定位

官网设计系统面向**产品展示和品牌传播**，强调：
- **专业可信**: 展示产品能力，建立品牌信任
- **现代简洁**: 清晰的视觉层次，突出核心信息
- **多端适配**: PC 和移动端统一体验

---

## 🎨 色彩系统

### 主色调

| 颜色名称 | HEX 值 | 用途 | Tailwind 类名 |
|---------|--------|------|--------------|
| **科技信赖蓝** | `#00C4CC` | 主色、链接、AI 相关元素 | `primary` |
| **活力橙** | `#FF8C69` | 强调色、CTA 按钮 | `accent` |
| **极浅灰** | `#F8F8F8` | 页面背景 | `background` |
| **纯白** | `#FFFFFF` | 容器背景 | `container` |
| **标题/正文** | `#2A2A2A` | 主要文本 | `text-primary` |
| **辅助文字** | `#4B5563` | 次要文本 | `text-secondary` |
| **辅助文字浅** | `#888888` | 更浅的辅助文本 | `text-tertiary` |

### 色阶系统

```javascript
// tailwind.config.js 中的颜色配置
primary: {
  DEFAULT: '#00C4CC',  // 主色
  50: '#E8F6FF',        // 最浅 - 背景色
  100: '#D4E7FF',      // 浅 - 边框、背景
  200: '#B8E6F0',      // 浅 - 边框
  300: '#A6D9FF',      // 中浅
  400: '#7BC8D9',      // 中
  500: '#00C4CC',      // 主色（DEFAULT）
  600: '#00B0B8',      // 中深 - hover 状态
  700: '#009CA4',      // 深
  800: '#008890',      // 更深
  900: '#00747C',      // 最深
}

accent: {
  DEFAULT: '#FF8C69',  // 强调色
  50: '#FFF5F2',        // 最浅
  100: '#FFE8E0',      // 浅
  200: '#FFD4C2',      // 浅
  300: '#FFB9A7',      // 中浅
  400: '#FF9D80',      // 中
  500: '#FF8C69',      // 主色（DEFAULT）
  600: '#FF7A57',      // 中深
  700: '#FF6845',      // 深
  800: '#FF5633',      // 更深
  900: '#FF4421',      // 最深
}
```

---

## 📝 字体与排版

### 字体栈

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", 
  "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

### 字体层级

| 元素 | 移动端 | 平板 | PC | 字重 | 颜色 | Tailwind 类名 |
|-----|-------|------|----|----|----|--------------|
| **页面主标题** | 3xl (30px) | 4xl (36px) | 5xl-6xl (48-60px) | Bold | text-primary | `text-heading` |
| **Section 标题** | 2xl (24px) | 3xl (30px) | 4xl-5xl (36-48px) | Bold | text-primary | `section-title` |
| **正文** | base (16px) | lg (18px) | xl (20px) | Regular | text-secondary | `text-body` |
| **标签/说明** | sm (14px) | base (16px) | base (16px) | Semibold | text-primary | `text-label` |
| **辅助信息** | xs (12px) | sm (14px) | sm (14px) | Regular | text-secondary | `text-caption` |

### 组件类

```css
/* 在 globals.css 中定义 */
.text-heading {
  @apply text-3xl font-bold leading-tight text-text-primary 
         sm:text-4xl md:text-5xl lg:text-6xl;
}

.section-title {
  @apply text-2xl font-bold text-text-primary 
         sm:text-3xl md:text-4xl lg:text-5xl;
}

.section-subtitle {
  @apply mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary 
         sm:text-base lg:text-lg;
}

.text-body {
  @apply text-base leading-relaxed text-text-secondary 
         sm:text-lg lg:text-xl;
}

.text-label {
  @apply text-sm font-semibold text-text-primary sm:text-base;
}

.text-caption {
  @apply text-xs text-text-secondary sm:text-sm;
}
```

---

## 🎨 圆角系统

| 名称 | 值 | 用途 | Tailwind 类名 |
|-----|----|----|--------------|
| **卡片圆角** | 12px (0.75rem) | 标准卡片 | `rounded-card` |
| **大卡片圆角** | 16px (1rem) | 大卡片 | `rounded-card-lg` |
| **超大卡片圆角** | 24px (1.5rem) | 超大卡片、Hero 区域 | `rounded-card-xl` |
| **按钮圆角** | 9999px | 胶囊按钮 | `rounded-button` |

---

## 🌑 阴影系统

| 名称 | 值 | 用途 | Tailwind 类名 |
|-----|----|----|--------------|
| **卡片阴影** | `0 2px 4px rgba(0, 0, 0, 0.04)` | 标准卡片 | `shadow-card` |
| **卡片悬停** | `0 4px 12px rgba(0, 0, 0, 0.08)` | 卡片 hover | `shadow-card-hover` |
| **按钮阴影** | `0 4px 6px rgba(0, 0, 0, 0.1)` | 标准按钮 | `shadow-button` |
| **按钮悬停** | `0 6px 12px rgba(0, 0, 0, 0.15)` | 按钮 hover | `shadow-button-hover` |
| **提升阴影** | `0 10px 25px rgba(0, 196, 204, 0.1)` | 重要元素 | `shadow-elevated` |
| **大提升阴影** | `0 20px 40px rgba(0, 196, 204, 0.15)` | 特别重要元素 | `shadow-elevated-lg` |

---

## 📐 间距系统

| 名称 | 值 | 用途 | Tailwind 类名 |
|-----|----|----|--------------|
| **Section 间距** | 48px (3rem) | Section 之间的垂直间距 | `py-section` |
| **大 Section 间距** | 64px (4rem) | 大 Section 之间的间距 | `py-section-lg` |
| **卡片内边距** | 24px (1.5rem) | 标准卡片内边距 | `p-card` |
| **大卡片内边距** | 32px (2rem) | 大卡片内边距 | `p-card-lg` |

---

## 🎨 渐变背景

| 名称 | 值 | 用途 | Tailwind 类名 |
|-----|----|----|--------------|
| **主渐变** | `linear-gradient(to bottom, #F7FBFF, #FFFFFF, #F7FBFF)` | 页面背景 | `bg-gradient-lago` |
| **卡片渐变** | `linear-gradient(to bottom right, #F1F9FF, #FFFFFF, #FFF5F2)` | 特殊卡片 | `bg-gradient-card` |

---

## 🧩 组件系统

### 容器组件

```tsx
// 统一容器
<div className="container-lago">
  {/* 内容 */}
</div>

// Tailwind 配置
.container-lago {
  @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
}
```

### 卡片组件

```tsx
// 标准卡片
<div className="card">
  {/* 内容 */}
</div>

// 带悬停效果的卡片
<div className="card-hover">
  {/* 内容 */}
</div>

// Tailwind 配置
.card {
  @apply rounded-card bg-container p-card shadow-card 
         transition-all duration-default;
}

.card-hover {
  @apply card hover:-translate-y-1 hover:shadow-card-hover;
}
```

### 按钮组件

```tsx
// 主按钮
<button className="btn-primary">了解产品</button>

// 次要按钮
<button className="btn-secondary">查看更多</button>

// 强调按钮
<button className="btn-accent">立即体验</button>

// Tailwind 配置
.btn-primary {
  @apply inline-flex items-center justify-center rounded-button 
         bg-primary px-6 py-3 text-sm font-semibold text-white 
         shadow-button transition-all duration-default 
         hover:scale-105 hover:bg-primary-600 hover:shadow-button-hover 
         sm:px-8 sm:py-3.5 sm:text-base;
}

.btn-secondary {
  @apply inline-flex items-center justify-center rounded-button 
         border-2 border-primary bg-transparent px-6 py-3 
         text-sm font-semibold text-primary transition-all duration-default 
         hover:scale-105 hover:bg-primary-50 
         sm:px-8 sm:py-3.5 sm:text-base;
}

.btn-accent {
  @apply inline-flex items-center justify-center rounded-button 
         bg-accent px-6 py-3 text-sm font-semibold text-white 
         shadow-button transition-all duration-default 
         hover:scale-105 hover:bg-accent-600 hover:shadow-button-hover 
         sm:px-8 sm:py-3.5 sm:text-base;
}
```

---

## 📱 响应式设计

### 断点系统

| 断点 | 宽度 | 设备 | 用途 |
|-----|------|------|------|
| **xs** | 475px | 小手机 | 极小屏幕 |
| **sm** | 640px | 手机 | 移动端 |
| **md** | 768px | 平板 | 平板竖屏 |
| **lg** | 1024px | 平板横屏/小笔记本 | PC 端 |
| **xl** | 1280px | 笔记本 | 大 PC 端 |
| **2xl** | 1536px | 桌面显示器 | 超大屏幕 |

### 响应式使用示例

```tsx
// 响应式字体
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
  标题
</h1>

// 响应式网格
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 内容 */}
</div>

// 响应式间距
<section className="py-12 sm:py-16 lg:py-24">
  {/* 内容 */}
</section>

// 响应式内边距
<div className="p-4 sm:p-6 lg:p-8">
  {/* 内容 */}
</div>
```

---

## ✨ 动画与交互

### 过渡时长

| 名称 | 值 | 用途 |
|-----|----|----|
| **默认** | 300ms | 标准过渡 |
| **快速** | 150ms | 快速交互 |
| **慢速** | 500ms | 强调动画 |

### 常用交互效果

```tsx
// 悬停缩放
<div className="hover:scale-105 transition-transform duration-default">
  {/* 内容 */}
</div>

// 悬停上浮
<div className="hover:-translate-y-1 transition-transform duration-default">
  {/* 内容 */}
</div>

// 悬停阴影变化
<div className="shadow-card hover:shadow-card-hover transition-shadow duration-default">
  {/* 内容 */}
</div>
```

---

## 🎯 使用原则

### ✅ 推荐做法

1. **使用设计系统类名**
   ```tsx
   ✅ <div className="bg-primary text-white rounded-card shadow-card">
   ```

2. **使用组件类**
   ```tsx
   ✅ <button className="btn-primary">按钮</button>
   ✅ <div className="container-lago">...</div>
   ```

3. **响应式设计**
   ```tsx
   ✅ <div className="text-sm sm:text-base lg:text-lg">
   ```

### ❌ 避免做法

1. **硬编码颜色和值**
   ```tsx
   ❌ <div className="bg-[#00C4CC] rounded-[12px]">
   ```

2. **不使用设计系统**
   ```tsx
   ❌ <div className="bg-blue-500 text-white rounded-lg">
   ```

3. **忽略响应式**
   ```tsx
   ❌ <div className="text-lg"> {/* 固定大小 */}
   ```

---

## 📚 配置文件位置

- **Tailwind 配置**: `apps/lago/tailwind.config.js`
- **全局样式**: `apps/lago/app/globals.css`
- **PostCSS 配置**: `apps/lago/postcss.config.mjs`

---

**最后更新**: 2025-01-10  
**维护者**: Lago 设计团队  
**版本**: v1.0

