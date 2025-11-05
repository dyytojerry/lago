# Lago 运营系统设计系统

> **用途**: 平台管理后台（PC Web）的设计系统规范  
> **适用场景**: `apps/lago-admin` 后台管理系统

## 🎯 设计定位

运营系统设计系统面向**管理效率和操作准确性**，强调：
- **专业高效**: 数据密集、操作频繁，需要清晰的信息架构
- **功能优先**: 突出功能性和可用性，减少装饰性元素
- **一致性**: 统一的操作流程和视觉反馈

---

## 🎨 色彩系统

### 主色调

| 颜色名称 | HEX 值 | 用途 | Tailwind 类名 |
|---------|--------|------|--------------|
| **管理蓝** | `#2196F3` | 主色、链接、主要操作 | `primary` |
| **成功绿** | `#4CAF50` | 成功状态、通过操作 | `success` |
| **警告橙** | `#FF9800` | 警告状态、待处理 | `warning` |
| **错误红** | `#F44336` | 错误状态、拒绝操作 | `error` |
| **信息青** | `#00BCD4` | 信息提示、辅助操作 | `info` |
| **中性灰** | `#9E9E9E` | 次要文本、边框 | `neutral` |
| **背景白** | `#FFFFFF` | 页面背景 | `bg-white` |
| **背景灰** | `#F5F5F5` | 次要背景 | `bg-gray-50` |

### 功能色系统

```javascript
// tailwind.config.js 中的颜色配置
colors: {
  primary: {
    50: '#E3F2FD',   // 浅蓝背景
    100: '#BBDEFB',  // 浅蓝边框
    500: '#2196F3',  // 主色
    600: '#1976D2',  // hover 状态
    700: '#1565C0',  // 激活状态
  },
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    500: '#4CAF50',
    600: '#43A047',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    500: '#FF9800',
    600: '#FB8C00',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    500: '#F44336',
    600: '#E53935',
  },
  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    500: '#00BCD4',
    600: '#00ACC1',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    900: '#212121',
  },
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

| 元素 | 尺寸 | 字重 | 颜色 | 用途 |
|-----|------|------|------|------|
| **页面标题** | 24px | Bold | neutral-900 | 页面主标题 |
| **模块标题** | 18px | Semi-Bold | neutral-900 | 模块标题 |
| **表格标题** | 14px | Semi-Bold | neutral-700 | 表格列标题 |
| **正文** | 14px | Regular | neutral-700 | 主要内容 |
| **辅助文本** | 12px | Regular | neutral-500 | 时间戳、提示 |
| **按钮文字** | 14px | Semi-Bold | white/neutral-900 | 按钮文字 |

---

## 🎨 圆角系统

| 名称 | 值 | 用途 |
|-----|----|----|
| **小圆角** | 4px | 输入框、标签 |
| **标准圆角** | 8px | 按钮、卡片 |
| **大圆角** | 12px | 模态框、大卡片 |

---

## 🌑 阴影系统

| 名称 | 值 | 用途 |
|-----|----|----|
| **卡片阴影** | `0 1px 3px rgba(0, 0, 0, 0.1)` | 标准卡片 |
| **悬浮阴影** | `0 4px 6px rgba(0, 0, 0, 0.1)` | 悬浮卡片 |
| **模态框阴影** | `0 10px 25px rgba(0, 0, 0, 0.15)` | 模态框、下拉菜单 |

---

## 📐 间距系统

| 名称 | 值 | 用途 |
|-----|----|----|
| **紧凑间距** | 8px | 表单元素之间 |
| **标准间距** | 16px | 组件之间 |
| **大间距** | 24px | Section 之间 |
| **超大间距** | 32px | 页面区域之间 |

---

## 🧩 组件系统

### 布局组件

```tsx
// 页面容器
<div className="min-h-screen bg-gray-50">
  {/* 侧边栏 */}
  <aside className="w-64 bg-white border-r border-gray-200">
    {/* 导航 */}
  </aside>
  
  {/* 主内容区 */}
  <main className="flex-1 p-6">
    {/* 内容 */}
  </main>
</div>
```

### 表格组件

```tsx
// 数据表格
<div className="bg-white rounded-lg shadow overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">
          列标题
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      <tr>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          数据
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### 按钮组件

```tsx
// 主按钮
<button className="bg-primary-500 text-white px-4 py-2 rounded-lg 
                   hover:bg-primary-600 transition-colors">
  确认
</button>

// 次要按钮
<button className="bg-white text-primary-600 border border-primary-500 
                   px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors">
  取消
</button>

// 危险按钮
<button className="bg-error-500 text-white px-4 py-2 rounded-lg 
                   hover:bg-error-600 transition-colors">
  删除
</button>

// 文本按钮
<button className="text-neutral-600 hover:text-neutral-700 px-2 py-1">
  更多
</button>
```

### 状态标签

```tsx
// 通过状态
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                  text-xs font-medium bg-success-100 text-success-800">
  已通过
</span>

// 待审核状态
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                  text-xs font-medium bg-warning-100 text-warning-800">
  待审核
</span>

// 拒绝状态
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                  text-xs font-medium bg-error-100 text-error-800">
  已拒绝
</span>
```

### 表单组件

```tsx
// 输入框
<input 
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-primary-500 
             focus:border-transparent"
  placeholder="请输入..."
/>

// 选择框
<select className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-primary-500">
  <option>选项1</option>
</select>

// 标签
<label className="block text-sm font-medium text-gray-700 mb-1">
  标签名称
</label>
```

### 卡片组件

```tsx
// 数据卡片
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">标题</h3>
  <div className="space-y-2">
    {/* 内容 */}
  </div>
</div>

// 统计卡片
<div className="bg-white rounded-lg shadow p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500">总用户数</p>
      <p className="text-2xl font-bold text-gray-900">1,234</p>
    </div>
    <div className="text-primary-500">
      {/* 图标 */}
    </div>
  </div>
</div>
```

---

## 📊 数据可视化

### 图表颜色

```javascript
// Chart.js 颜色配置
const chartColors = {
  primary: '#2196F3',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#00BCD4',
  // 渐变色
  gradient: ['#2196F3', '#4CAF50', '#FF9800', '#F44336', '#00BCD4'],
}
```

---

## 🎯 使用原则

### ✅ 推荐做法

1. **清晰的信息层级**
   - 使用明确的标题层级
   - 重要信息突出显示
   - 次要信息使用浅色

2. **一致的操作反馈**
   - 所有操作按钮统一样式
   - 状态变化有明确的视觉反馈
   - 加载状态清晰可见

3. **高效的数据展示**
   - 表格使用斑马纹提高可读性
   - 重要数据使用大字体突出
   - 状态使用颜色标签区分

### ❌ 避免做法

1. **过度装饰**
   ```tsx
   ❌ 使用过多的渐变和阴影
   ❌ 装饰性图标过多
   ```

2. **信息混乱**
   ```tsx
   ❌ 没有明确的信息层级
   ❌ 颜色使用不统一
   ```

3. **操作不明确**
   ```tsx
   ❌ 按钮样式混乱
   ❌ 状态变化不明显
   ```

---

## 📚 参考文档

- [ADMIN_PANEL_DESIGN.md](./ADMIN_PANEL_DESIGN.md) - 后台功能详细设计
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 开发指南

---

**最后更新**: 2025-01-10  
**维护者**: Lago 设计团队  
**版本**: v1.0

