# Lago 小程序设计系统

> **用途**: 微信小程序（用户端）的设计系统规范  
> **适用场景**: `apps/lago-web` 小程序项目

## 🎯 设计定位

小程序设计系统面向**移动端用户体验**，强调：
- **可信赖 (Trust)**: 专业的形象，建立交易信心
- **乐趣性 (Playful)**: 体现玩具/游戏的活力，鼓励参与
- **AI 驱动 (Smart)**: 突出 AI 带来的效率和个性化
- **高效性 (Efficient)**: 快速完成 C2C 和租赁交易

---

## 🎨 色彩系统

### 主色调

| 颜色名称 | HEX 值 | 用途 | Tailwind 类名 |
|---------|--------|------|--------------|
| **科技信赖蓝** | `#00C4CC` | 导航栏、链接、AI 模块、认证徽章 | `primary` |
| **活力橙** | `#FF8C69` | 核心 CTA 按钮、活动高亮、直播互动 | `accent` |
| **极浅灰** | `#F8F8F8` | 页面背景色 | `background` |
| **纯白** | `#FFFFFF` | 商品卡片、输入框、模态框 | `container` |
| **标题/正文** | `#2A2A2A` | 标题、商品名称、主要信息 | `text-primary` |
| **辅助文字** | `#888888` | 时间戳、小标签、价格单位 | `text-secondary` |

### 色阶系统

```javascript
// tailwind.config.js 中的颜色配置
primary: {
  DEFAULT: '#00C4CC',  // 科技信赖蓝
  50: '#E8F6FF',        // 浅蓝背景
  100: '#D4E7FF',      // 浅蓝边框
  500: '#00C4CC',      // 主色
  600: '#00B0B8',      // hover 状态
}

accent: {
  DEFAULT: '#FF8C69',  // 活力橙
  50: '#FFF5F2',        // 浅橙背景
  100: '#FFE8E0',      // 浅橙边框
  500: '#FF8C69',      // 主色
  600: '#FF7A57',      // hover 状态
}
```

---

## 📝 字体与排版

### 字体选择

移动端优先使用系统默认字体，保持性能和原生体验：
- iOS: 苹方 SC (PingFang SC)
- Android: 思源黑体 / Roboto
- 通用: San Francisco / Helvetica Neue

### 字体层级

| 元素 | 尺寸 (px) | 字重 | 颜色 | 示例应用 |
|-----|----------|------|------|---------|
| **页面标题** | 24 | Bold | `#2A2A2A` | 页面顶部的导航标题 |
| **模块标题** | 18 | Semi-Bold | `#2A2A2A` | 列表中的分类标题 |
| **商品价格** | 20 | Bold | `#FF8C69` | **突出显示，使用强调色** |
| **商品名称** | 16 | Semi-Bold | `#2A2A2A` | 列表中的商品名称 |
| **辅助信息** | 12 | Regular | `#888888` | 发布时间、地理位置 |
| **CTA 按钮** | 16 | Semi-Bold | `White` | 按钮文字 |

---

## 🎨 圆角系统

| 名称 | 值 | 用途 |
|-----|----|----|
| **通用圆角** | 8px 或 10px | 所有卡片、按钮、输入框 |
| **大圆角** | 12px | 强调卡片 |

---

## 🌑 阴影系统

| 名称 | 值 | 用途 |
|-----|----|----|
| **卡片阴影** | `0px 2px 4px rgba(0, 0, 0, 0.04)` | 轻微、柔和的底部阴影 |

---

## 🧩 组件系统

### 按钮系统

| 类型 | 颜色 | 用途 | 形状 |
|-----|------|------|------|
| **主要交易 CTA** | 活力橙填充 | 购买、租赁、立即发布、确认支付 | 高圆角或胶囊形 |
| **次要连接 CTA** | 科技信赖蓝填充 | 聊天、关注、加入小区频道、申请认证 | 高圆角或胶囊形 |
| **轻量级操作** | 透明背景 + 科技信赖蓝边框 | 取消、返回、查看更多 | 保持圆角 |

### 商品卡片

```tsx
// 商品列表卡片
<div className="bg-white rounded-lg shadow-card">
  {/* 商品图片 */}
  <img className="w-full rounded-t-lg" src="..." />
  
  <div className="p-3">
    {/* 价格 - 使用活力橙 */}
    <p className="text-xl font-bold text-accent">¥99/天</p>
    
    {/* 商品名称 */}
    <p className="text-base font-semibold text-primary mt-1">
      任天堂 Switch
    </p>
    
    {/* 地理位置 - 使用科技信赖蓝 */}
    <div className="flex items-center gap-1 mt-2">
      <Icon className="text-primary" />
      <span className="text-xs text-secondary">XX小区</span>
    </div>
  </div>
</div>
```

### 搜索框

```tsx
// AI 语义搜索框
<div className="bg-white rounded-full px-4 py-3 shadow-card">
  <input 
    type="text"
    placeholder="我想租个 Switch 一个周末"
    className="w-full text-sm text-primary placeholder:text-secondary"
  />
</div>
```

### 信任模块

```tsx
// 邻里认证徽章
<div className="flex items-center gap-2">
  <img src="avatar.jpg" className="w-10 h-10 rounded-full" />
  <div>
    <div className="flex items-center gap-1">
      <span className="text-sm font-semibold text-primary">用户名</span>
      {/* 认证徽章 - 使用科技信赖蓝 */}
      <span className="px-2 py-0.5 bg-primary/10 text-primary 
                        text-xs rounded-full border border-primary/20">
        邻里认证
      </span>
    </div>
    <p className="text-xs text-secondary">XX小区 · 信用分 850</p>
  </div>
</div>
```

### AI 推荐 Banner

```tsx
// 智能推荐 Banner
<div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
  <div className="flex items-center gap-2 mb-2">
    <Icon className="text-primary" />
    <span className="text-sm font-semibold text-primary">
      基于您的邻里画像，AI 推荐了以下商品
    </span>
  </div>
  {/* 推荐商品列表 */}
</div>
```

### 底部导航

```tsx
// Tab Bar
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
  <div className="flex justify-around items-center h-16">
    {/* Tab 项 */}
    <div className="flex flex-col items-center">
      <Icon className={isActive ? 'text-primary' : 'text-secondary'} />
      <span className={`text-xs mt-1 ${isActive ? 'text-primary' : 'text-secondary'}`}>
        首页
      </span>
    </div>
    {/* 小区频道 Tab - 使用科技信赖蓝激活色 */}
    <div className="flex flex-col items-center">
      <Icon className="text-primary" />
      <span className="text-xs mt-1 text-primary">小区频道</span>
    </div>
  </div>
</nav>
```

### 直播卡片

```tsx
// 实时直播入口卡片
<div className="relative bg-white rounded-lg shadow-card overflow-hidden">
  <img src="live-bg.jpg" className="w-full h-32 object-cover" />
  
  {/* Live 角标 - 使用半透明活力橙 */}
  <div className="absolute top-2 right-2 bg-accent/80 text-white 
                   px-2 py-1 rounded text-xs font-semibold">
    Live
  </div>
  
  <div className="p-3">
    <p className="text-sm font-semibold text-primary">周末玩具回收节</p>
    <p className="text-xs text-secondary mt-1">正在进行中</p>
  </div>
</div>
```

---

## 🎯 核心功能组件设计

### 1. 商品列表页

**布局**: 瀑布流或双列卡片

**卡片必须包含**:
1. 商品图片 (大图，圆角)
2. **价格 (活力橙，Bold)**
3. 商品名称 (Semi-Bold)
4. **地理位置/小区名称 (12px 辅助信息，Icon 科技信赖蓝)**

**筛选与搜索**:
- **搜索框**: 默认提示语为"我想租个 Switch 一个周末" (语义搜索示例)
- **地理筛选**: 顶部导航栏显示"当前小区：[小区名称]"，名称使用科技信赖蓝

### 2. 详情页

**信任模块**: 
- 卖家头像旁边醒目展示"邻里认证"徽章（科技信赖蓝）

**交易操作区**:
- **租赁/购买 CTA**: 底部悬浮栏，使用活力橙按钮，清晰显示价格和操作
- **面交/自提提示**: 商品描述区，使用浅科技信赖蓝背景的小卡片

### 3. AI 交互与提示

**智能推荐 Banner**: 
- 浅科技信赖蓝背景，显示"基于您的邻里画像，AI 推荐了以下商品"

**智能客服入口**: 
- AI 客服对话气泡使用科技信赖蓝边框
- 人工客服使用中性灰，区分服务层级

### 4. 社区与直播

**小区频道 Tab**: 
- Tab Bar 中的"小区频道"图标融合家和播放按钮
- 使用科技信赖蓝激活色

**直播卡片**: 
- 实时直播入口卡片使用半透明活力橙角标提示"Live"或"活动中"

---

## 🎨 图标系统

### 风格

统一采用**圆润的线描风格 (Rounded Line Icons)**，确保友好和现代感。

### 核心图标颜色

- **信任/安全**: 锁、盾牌、身份认证 → 使用科技信赖蓝
- **乐趣/活动**: 玩具、游戏手柄、礼品、抽奖 → 使用活力橙
- **交易/物流**: 购物车、租金、柜子 → 使用中性灰或科技信赖蓝
- **AI/数据**: 芯片、节点、搜索 → 必须使用科技信赖蓝，体现核心壁垒

---

## 🎯 使用原则

### ✅ 推荐做法

1. **突出信任元素**
   - 邻里认证徽章使用科技信赖蓝
   - 地理位置信息清晰可见

2. **强调交易操作**
   - 核心 CTA 使用活力橙
   - 价格信息突出显示

3. **AI 功能可视化**
   - AI 相关元素使用科技信赖蓝
   - 语义搜索提示清晰

### ❌ 避免做法

1. **颜色使用混乱**
   ```tsx
   ❌ 随意使用颜色，不遵循设计系统
   ❌ 重要信息不使用强调色
   ```

2. **信息层级不清**
   ```tsx
   ❌ 价格信息不明显
   ❌ 地理位置信息被忽略
   ```

3. **信任元素缺失**
   ```tsx
   ❌ 没有邻里认证标识
   ❌ 小区信息不突出
   ```

---

## 📚 参考文档

- [PRD.md](./PRD.md) - 产品需求文档
- [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md) - 页面功能说明
- [DESIGN.md](./DESIGN.md) - 详细设计规范

---

**最后更新**: 2025-01-10  
**维护者**: Lago 设计团队  
**版本**: v2.0

