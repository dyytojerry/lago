# Lago Design System Manager

用于管理和编辑所有前端项目的 Tailwind CSS 设计系统的可视化工具。

## 功能特性

- 🎨 **可视化设计系统管理** - 查看和编辑所有前端项目的设计系统配置
- 📋 **分类管理** - 按颜色、字体、间距、圆角、阴影等分类组织
- 🔄 **一键复制** - 快速将设计系统配置复制到其他项目
- 💾 **实时保存** - 编辑后可直接保存到项目的 `tailwind.config.js` 文件
- 📱 **响应式界面** - 现代化的 UI 设计，支持各种设备

## 项目列表

- **lago** - 白皮书/静态页面
- **lago-app** - 用户端应用
- **lago-minigrame** - 小程序
- **lago-operation** - 运营/管理端

## 使用方法

### 启动应用

```bash
cd apps/ui
npm install
npm run dev
```

应用将在 `http://localhost:3001` 启动。

### 查看设计系统

1. 在首页选择要查看的项目
2. 进入项目详情页，可以看到所有设计系统的分类
3. 通过标签页切换不同的分类（颜色、字体、间距等）

### 编辑设计系统

1. 在项目详情页选择要编辑的分类
2. 修改相应的值（颜色值、字体、间距等）
3. 点击"保存更改"按钮将更改保存到项目的 `tailwind.config.js`

### 复制配置到其他项目

1. 在项目详情页点击"复制到项目"按钮
2. 选择目标项目
3. 配置将自动复制并更新到目标项目的 `tailwind.config.js`

### 复制配置到剪贴板

1. 在项目详情页点击"复制配置"按钮
2. 配置字符串将复制到剪贴板，可以手动粘贴到其他位置

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## 项目结构

```
apps/ui/
├── app/
│   ├── api/
│   │   └── projects/          # API 路由
│   ├── project/
│   │   └── [name]/            # 项目详情页
│   ├── layout.tsx             # 根布局
│   ├── page.tsx               # 首页
│   └── globals.css            # 全局样式
├── lib/
│   └── design-system.ts       # 设计系统管理工具
└── package.json
```

## API 端点

- `GET /api/projects` - 获取所有项目列表
- `GET /api/projects/[name]` - 获取指定项目的配置
- `PUT /api/projects/[name]` - 更新指定项目的配置
- `POST /api/projects/[name]/copy` - 复制配置到其他项目或获取配置字符串
