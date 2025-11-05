# 小猪存钱宝 - 小程序分享图片

## 📸 分享图片说明

本项目包含以下分享图片资源：

### 1. 默认分享图片
- **文件位置**: `miniprogram/images/share-logo.png`
- **来源**: 从web应用的logo复制而来
- **用途**: 小程序分享时的默认图片

### 2. 自定义分享图片生成工具

#### 工具1: 基础分享图片生成器
- **文件**: `miniprogram/scripts/generate-share-image.html`
- **功能**: 生成简洁的分享图片
- **特点**: 渐变背景 + 小猪emoji + 应用标题

#### 工具2: 高级分享图片生成器
- **文件**: `miniprogram/scripts/create-share-logo.html`
- **功能**: 生成更精美的分享图片
- **特点**: 
  - 动态光泽效果
  - 圆角设计
  - 功能标签展示
  - 专业渐变背景

## 🎨 使用方法

### 方法1: 使用现有图片
直接使用已复制的 `share-logo.png`，这是最简单的方式。

### 方法2: 生成自定义图片
1. 在浏览器中打开 `miniprogram/scripts/create-share-logo.html`
2. 预览生成的分享图片
3. 点击"下载分享图片"按钮
4. 将下载的图片重命名为 `share-logo.png`
5. 替换 `miniprogram/images/share-logo.png`

## 🎯 分享图片规格

- **尺寸**: 500x400px (5:4比例)
- **格式**: PNG
- **背景**: 渐变色彩
- **主要元素**:
  - 🐷 小猪emoji
  - "小猪存钱宝" 标题
  - "让孩子学会理财的好帮手" 副标题
  - 功能标签：💰 存钱管理 ✅ 任务奖励 📚 财商教育

## 🔧 自定义修改

如果需要修改分享图片，可以编辑HTML文件中的以下部分：

```css
/* 修改背景颜色 */
background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #ff6b6b 100%);

/* 修改标题 */
.app-title { font-size: 36px; }

/* 修改副标题 */
.app-subtitle { font-size: 20px; }
```

## 📱 小程序中的使用

在 `webview.js` 中，分享图片的路径已经正确配置：

```javascript
imageUrl: '/images/share-logo.png'
```

确保图片文件存在于 `miniprogram/images/` 目录下即可。
