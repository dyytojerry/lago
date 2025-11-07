# Lago 开发指南

> **重要提示**: 这是项目的核心开发文档，提供给AI作为context使用。包含所有关键的开发流程、规范和最佳实践。

> **⚠️ 包管理器说明**: 本项目**使用 npm 进行依赖管理和构建**，不使用 pnpm。所有安装和构建命令必须使用 `npm`。

## 📚 文档导航

本项目采用精简文档策略，核心文档如下：

1. **DEVELOPMENT_GUIDE.md** (本文) - 开发流程和规范
2. **ARCHITECTURE.md** - 前后端架构设计
3. **DATABASE_DESIGN.md** - 数据库结构和迁移
4. **FEATURES_BY_PAGE.md** - 按页面组织的功能说明
5. **API_DOCUMENTATION.md** - API接口文档
6. **DEPLOYMENT_GUIDE.md** - 部署和运维指南

---

## 🎯 核心开发流程

### 1. API开发流程

#### 1.1 定义接口

**后端** - 在 `apps/lago-server/src/routes/` 目录下定义路由和Swagger文档:

**重要规范**：

1. **路由文件结构**：
   - 导入依赖
   - 创建 router 实例
   - 应用中间件（如需要）
   - **文件头部 tags 定义**（必须）
   - 接口定义（每个接口都有完整的 Swagger 注释）

2. **Tags 命名规范**：
   - Tag 名称使用**大驼峰形式**（多个单词连接，不使用空格）
     - ✅ `AdminDashboard`、`AdminUsers`、`AdminProducts`
     - ❌ `Admin Dashboard`、`Admin Users`
   - 每个接口的 tags 包含**两个值**：`[RouteTag, ProjectTag]`
     - 第一个 tag：route 的功能分类（如 `Auth`、`AdminProducts`）
     - 第二个 tag：项目类型（`App` 或 `Operation`）
   - 文件头部的 `tags.name` 只包含第一个 tag

3. **示例**：

```typescript
// apps/lago-server/src/routes/auth.routes.ts
import { Router } from "express";
import { wechatLogin, operationLogin } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validateRequest";
import { authUser, authOperation } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证相关接口
 */

/**
 * @swagger
 * /api/auth/wechat/login:
 *   post:
 *     summary: 微信登录（小程序端）
 *     tags: [Auth, App]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WechatLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/wechat/login', validateRequest(wechatLoginSchema), wechatLogin);

/**
 * @swagger
 * /api/auth/operation/login:
 *   post:
 *     summary: 运营系统登录
 *     tags: [Auth, Operation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OperationLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OperationLoginResponse'
 *       401:
 *         description: 登录失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/operation/login', validateRequest(operationLoginSchema), operationLogin);

4. **统一响应包装**：
   - 后端必须通过 `createSuccessResponse` / `createErrorResponse` 返回数据，统一结构为：`{ success: boolean, data?: object }` 或 `{ success: false, error: string }`
   - Swagger 描述中**必须体现这一层包装**，例如通过 `SuccessResponse` + `allOf` 或直接引用已经定义好的 `*Response` schema（内部已包含 `data` 节点）
   - 若接口仅返回提示信息，也需要放入 `data` 中，例如 `{ success: true, data: { message: '操作成功' } }`
   - `swagger.ts` 只保留**可复用的实体/基础结构**（如 `Product`、`Pagination`、`SuccessResponse`），**不要**为某个接口单独定义 `XXXListResponse`；在路由注释里通过 `allOf` + 内联 `data` 结构描述返回体

#### 1.2 定义验证Schema

**后端** - 在 `apps/lago-server/src/schemas/` 目录下定义验证规则:

```typescript
// apps/lago-server/src/schemas/productSchema.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  Min,
} from "class-validator";
import { ProductCategory, TransactionType } from "@prisma/client";

export class CreateProductSchema {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskCategory)
  category: TaskCategory;

  @IsEnum(TaskDifficulty)
  difficulty: TaskDifficulty;

  @IsInt()
  @Min(0)
  rewardPoints: number;
}

export const taskSchemas = {
  CreateTaskSchema,
  // ... 其他schemas
};
```

#### 1.3 生成前端API

**前端** - 运行脚本自动生成API调用函数:

```bash
# 步骤1: 确保后端swagger.json已更新
cd apps/lago-server
npm run build

# 步骤2: 复制swagger.json到前端
cp dist/swagger.json ../lago-web/swagger.json

# 步骤3: 生成前端API代码
cd ../lago-web
node scripts/generate-api.js
```

生成的代码位于 `apps/lago-web/src/lib/apis/`:

- `types.ts` - 类型定义和DTO类
- `products.ts` - 商品相关API函数和Hooks
- `orders.ts` - 订单相关API函数和Hooks
- `index.ts` - 统一导出

#### 1.4 前端使用API

```tsx
// 使用React Query Hook
import { useCreateProduct, useProduct } from "@/lib/apis";

function ProductForm() {
  const createProduct = useCreateProduct({});

  const handleSubmit = async (data: CreateProductDTO) => {
    try {
      const result = await createProduct.mutateAsync(data);
      console.log("商品发布成功:", result);
    } catch (error) {
      console.error("发布失败:", error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* 表单内容 */}</form>;
}
```

---

### 2. 数据库变更流程

#### 2.1 修改Prisma Schema

**永远通过Prisma Schema来实现数据库变更**，不要直接执行SQL:

```prisma
// apps/lago-server/prisma/schema.prisma

// 示例：添加新字段
model Product {
  id            String         @id @default(cuid())
  title         String
  // 新增字段
  priority      Int           @default(0) // 优先级
  tags          String[]      // 标签数组
  // ...其他字段
}

// 示例：添加新表
model TaskTemplate {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    TaskCategory
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("task_templates")
}
```

#### 2.2 生成和执行迁移

```bash
cd apps/lago-server

# 开发环境：推送schema变更到数据库
npx prisma db push

# 生产环境：创建迁移文件
npx prisma migrate dev --name add_product_priority_and_tags
```

#### 2.3 在seed.ts中处理数据迁移

**对于需要数据处理的DDL操作，在seed.ts中实现**:

```typescript
// apps/lago-server/src/scripts/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始数据迁移...");

  // 示例：为现有商品设置默认优先级
  const products = await prisma.product.findMany({
    where: { priority: null },
  });

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        priority: product.price ? 2 : 1,
      },
    });
  }

  console.log(`更新了 ${products.length} 个商品的优先级`);

  // 初始化新的种子数据
  await seedProductCategories();
}

async function seedProductCategories() {
  const categories = [
    {
      name: "玩具",
      slug: "toys",
      icon: "🧸",
    },
    {
      name: "游戏机",
      slug: "gaming",
      icon: "🎮",
    },
    // ... 更多分类
  ];

  for (const category of categories) {
    await prisma.productCategory.create({ data: category });
  }

  console.log("商品分类创建完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 2.4 运行种子数据

```bash
# 执行seed脚本
npx tsx src/scripts/seed.ts

# 或者使用package.json中定义的命令
npm run seed
```

---

### 3. 总结文档规范

#### 3.1 文档存放位置

- **WIP文档** (进行中的总结): `docs/WIP/`
- **完成的总结文档**: 移动到 `docs/` 根目录
- **测试文件**: `test/` 目录
- **测试脚本**: `test/` 或对应的 `scripts/` 目录

#### 3.2 文档命名规范

```
功能总结: {FEATURE_NAME}_SUMMARY.md
实现指南: {FEATURE_NAME}_GUIDE.md
快速开始: {FEATURE_NAME}_QUICK_START.md
测试文件: test-{feature-name}.js/ts
```

示例:

```
docs/WIP/VOICE_FEATURE_SUMMARY.md          # 进行中
docs/VOICE_FEATURE_SUMMARY.md              # 完成后移到这里
test/test-voice-feature.js                 # 测试文件
```

#### 3.3 文档模板

```markdown
# {功能名称} 实现总结

## 功能概述

简要描述功能的目标和价值

## 技术实现

### 后端实现

- 新增接口: ...
- 数据模型: ...
- 核心逻辑: ...

### 前端实现

- 页面组件: ...
- API调用: ...
- 状态管理: ...

## 数据库变更

列出所有schema变更

## 测试说明

如何测试该功能

## 部署注意事项

环境变量、依赖等

## 相关文档

链接到相关文档
```

---

## 🏗️ 项目结构

### 后端结构 (apps/lago-server/)

```
src/
├── config/              # 配置文件 (数据库、Redis、Swagger等)
├── controllers/         # 控制器 (处理HTTP请求)
├── routes/             # 路由定义 (定义API端点和Swagger文档)
├── schemas/            # 验证Schema (class-validator)
├── services/           # 业务服务 (AI、虚拟号、定时任务等)
├── lib/                # 工具库 (Prisma客户端、认证、通知等)
├── middleware/         # 中间件 (认证、错误处理、验证)
├── scripts/            # 脚本 (种子数据、迁移脚本)
└── index.ts            # 入口文件

prisma/
└── schema.prisma       # 数据库Schema定义
```

### 前端结构 (apps/lago-web/)

```
src/
├── app/                # Next.js App Router页面
│   ├── page.tsx       # 首页
│   ├── layout.tsx     # 根布局
│   ├── globals.css    # 全局样式
│   ├── products/      # 商品页面
│   ├── orders/        # 订单页面
│   ├── chat/          # 聊天页面
│   ├── publish/       # 发布页面
│   └── profile/       # 个人中心
│
├── components/         # 可复用组件
│   ├── Header.tsx     # 页头
│   ├── BottomNavigation.tsx # 底部导航
│   ├── PageLayout.tsx # 页面布局
│   ├── chat/          # 聊天相关组件
│   ├── portfolio/     # 作品集相关组件
│   └── ui/            # 基础UI组件
│
├── lib/               # 工具库
│   ├── apis/          # API调用 (自动生成)
│   │   ├── types.ts   # 类型定义
│   │   ├── tasks.ts   # 任务API
│   │   └── index.ts   # 统一导出
│   ├── api-request/   # API请求封装
│   └── storage.ts     # 本地存储
│
├── hooks/             # 自定义Hooks
│   ├── useWebSocket.ts
│   └── useAuthRequest.ts
│
└── providers/         # Context Providers
    ├── AuthProvider.tsx
    ├── WebSocketProvider.tsx
    └── ApiProvider.tsx

scripts/
└── generate-api.js    # API代码生成脚本
```

---

## 🎨 技术栈

### 包管理器

- **⚠️ 重要**: 本项目使用 **npm** 进行依赖管理和构建
- **不要使用**: pnpm、yarn 等其他包管理器
- **所有安装命令**: 使用 `npm install` 或 `npm install -D`

### 前端

- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **样式**: Tailwind CSS v3
- **状态管理**: React Context + Zustand
- **数据请求**: @tanstack/react-query
- **表单验证**: class-validator
- **实时通信**: Socket.IO Client

### 后端

- **运行时**: Node.js + TypeScript
- **框架**: Express.js
- **数据库**: PostgreSQL + Prisma ORM
- **缓存**: Redis
- **认证**: JWT
- **文档**: Swagger/OpenAPI
- **验证**: class-validator + class-transformer
- **AI服务**: 通义千问 (对话 + TTS)

---

## 🎨 Tailwind CSS 配置与应用

### 1. 安装依赖

**重要**:

- 新项目必须使用 Tailwind CSS v3，不要使用 v4（实验性版本）。
- **必须使用 npm 安装依赖**，不要使用 pnpm。

```bash
cd apps/your-app-name

# 安装 Tailwind CSS v3 及相关依赖（使用 npm）
npm install -D 'tailwindcss@^3' postcss autoprefixer eslint-plugin-tailwindcss
```

### 2. 初始化配置文件

创建 `tailwind.config.js` 和 `postcss.config.mjs`:

```bash
# 可选：使用 Tailwind CLI 初始化（但建议手动创建以包含设计系统）
# npx tailwindcss init -p
```

### 3. 配置文件结构

#### 3.1 `tailwind.config.js` - 设计系统核心配置

**所有设计系统定义必须放在 `tailwind.config.js` 中**，包括：

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. 颜色系统 - 从设计系统文档提炼
      colors: {
        primary: {
          DEFAULT: "#00C4CC", // 主色
          50: "#E8F6FF", // 浅色变体
          100: "#D4E7FF",
          // ... 50-900 色阶
        },
        accent: {
          DEFAULT: "#FF8C69", // 强调色
          // ... 色阶
        },
        background: {
          DEFAULT: "#F8F8F8",
          light: "#F7FBFF",
        },
        container: {
          DEFAULT: "#FFFFFF",
        },
        text: {
          DEFAULT: "#2A2A2A",
          primary: "#2A2A2A",
          secondary: "#4B5563",
          tertiary: "#888888",
        },
      },

      // 2. 字体系统
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          // ... 中文字体栈
        ],
      },

      // 3. 圆角系统
      borderRadius: {
        card: "0.75rem", // 12px - 卡片圆角
        "card-lg": "1rem", // 16px - 大卡片圆角
        "card-xl": "1.5rem", // 24px - 超大卡片圆角
        button: "9999px", // 胶囊按钮
      },

      // 4. 阴影系统
      boxShadow: {
        card: "0 2px 4px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 4px 12px rgba(0, 0, 0, 0.08)",
        button: "0 4px 6px rgba(0, 0, 0, 0.1)",
        "button-hover": "0 6px 12px rgba(0, 0, 0, 0.15)",
        elevated: "0 10px 25px rgba(0, 196, 204, 0.1)",
        "elevated-lg": "0 20px 40px rgba(0, 196, 204, 0.15)",
      },

      // 5. 间距系统（语义化）
      spacing: {
        section: "3rem", // 48px - Section 间距
        "section-lg": "4rem", // 64px - 大 Section 间距
        card: "1.5rem", // 24px - 卡片内边距
        "card-lg": "2rem", // 32px - 大卡片内边距
      },

      // 6. 渐变背景
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(to bottom right, #F7FBFF, #FFFFFF, #F7FBFF)",
        "gradient-card":
          "linear-gradient(to bottom right, #F1F9FF, #FFFFFF, #FFF5F2)",
        "gradient-lago":
          "linear-gradient(to bottom, #F7FBFF, #FFFFFF, #F7FBFF)",
      },

      // 7. 动画时长
      transitionDuration: {
        default: "300ms",
        fast: "150ms",
        slow: "500ms",
      },

      // 8. 响应式断点
      screens: {
        xs: "475px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
```

#### 3.2 `postcss.config.mjs` - PostCSS 配置

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;
```

#### 3.3 `app/globals.css` - 全局样式和组件类

**重要原则**:

- **不要**在 `globals.css` 中重复定义颜色、阴影等（已在 config 中定义）
- **不要**使用 `@apply` 应用自定义工具类（会造成循环依赖）
- **只**定义基础样式和可复用组件类

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply box-border;
    margin: 0;
    padding: 0;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-background text-text-primary font-sans;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    @apply no-underline transition-all duration-default;
  }

  button,
  a[role="button"] {
    @apply cursor-pointer transition-all duration-default;
  }
}

@layer components {
  /* 容器组件 */
  .container-lago {
    @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8;
  }

  /* 卡片组件 */
  .card {
    @apply rounded-card bg-container p-card shadow-card transition-all duration-default;
  }

  .card-hover {
    @apply card hover:-translate-y-1 hover:shadow-card-hover;
  }

  /* 按钮组件 */
  .btn-primary {
    @apply inline-flex items-center justify-center rounded-button bg-primary px-6 py-3 text-sm font-semibold text-white shadow-button transition-all duration-default hover:scale-105 hover:bg-primary-600 hover:shadow-button-hover sm:px-8 sm:py-3.5 sm:text-base;
  }

  .btn-secondary {
    @apply inline-flex items-center justify-center rounded-button border-2 border-primary bg-transparent px-6 py-3 text-sm font-semibold text-primary transition-all duration-default hover:scale-105 hover:bg-primary-50 sm:px-8 sm:py-3.5 sm:text-base;
  }

  .btn-accent {
    @apply inline-flex items-center justify-center rounded-button bg-accent px-6 py-3 text-sm font-semibold text-white shadow-button transition-all duration-default hover:scale-105 hover:bg-accent-600 hover:shadow-button-hover sm:px-8 sm:py-3.5 sm:text-base;
  }

  /* Section 标题 */
  .section-title {
    @apply text-2xl font-bold text-text-primary sm:text-3xl md:text-4xl lg:text-5xl;
  }

  .section-subtitle {
    @apply mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base lg:text-lg;
  }

  /* 文本样式 */
  .text-heading {
    @apply text-3xl font-bold leading-tight text-text-primary sm:text-4xl md:text-5xl lg:text-6xl;
  }

  .text-body {
    @apply text-base leading-relaxed text-text-secondary sm:text-lg lg:text-xl;
  }

  .text-label {
    @apply text-sm font-semibold text-text-primary sm:text-base;
  }

  .text-caption {
    @apply text-xs text-text-secondary sm:text-sm;
  }
}
```

### 4. 设计系统提炼流程

#### 4.1 从设计文档提炼颜色

参考 `DESIGN_SYSTEM.md`，提取所有颜色定义：

```javascript
// 从 DESIGN_SYSTEM.md 中提取
colors: {
  primary: '#00C4CC',      // 科技信赖蓝
  accent: '#FF8C69',       // 活力橙
  background: '#F8F8F8',   // 极浅灰
  container: '#FFFFFF',    // 纯白
  text: {
    primary: '#2A2A2A',     // 标题/正文
    secondary: '#888888',   // 辅助文字
  },
}
```

#### 4.2 生成色阶

使用在线工具或手动生成 50-900 色阶，确保颜色渐变自然。

#### 4.3 提炼圆角、阴影、间距

从设计规范和实际使用中提炼：

- 圆角：卡片、按钮的统一圆角值
- 阴影：不同层级的阴影效果
- 间距：语义化的间距值

### 5. 使用规范

#### 5.1 优先使用设计系统类名

✅ **正确**:

```tsx
<div className="bg-primary text-white rounded-card shadow-card">
  <h1 className="text-heading">标题</h1>
  <p className="text-body">正文内容</p>
  <button className="btn-primary">按钮</button>
</div>
```

❌ **错误**:

```tsx
<div className="bg-[#00C4CC] text-white rounded-[12px] shadow-[0_2px_4px_rgba(0,0,0,0.04)]">
  {/* 使用硬编码颜色和值 */}
</div>
```

#### 5.2 响应式设计

使用 Tailwind 响应式前缀：

```tsx
<div className="text-sm sm:text-base md:text-lg lg:text-xl">
  {/* 响应式字体大小 */}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 响应式网格布局 */}
</div>
```

#### 5.3 使用组件类

优先使用预定义的组件类：

```tsx
// 使用容器类
<div className="container-lago">
  {/* 内容 */}
</div>

// 使用卡片类
<div className="card-hover">
  {/* 卡片内容 */}
</div>

// 使用按钮类
<button className="btn-primary">提交</button>
<button className="btn-secondary">取消</button>
```

### 6. 常见问题

#### 6.1 循环依赖错误

**错误**: `You cannot @apply the shadow-elevated-lg utility here because it creates a circular dependency.`

**原因**: 在 `@layer utilities` 中使用 `@apply` 应用自定义工具类。

**解决**: 不要在 `@layer utilities` 中定义工具类，直接使用 config 中定义的类名。

❌ **错误示例**:

```css
@layer utilities {
  .shadow-elevated-lg {
    @apply shadow-elevated-lg; /* 循环依赖 */
  }
}
```

✅ **正确做法**:

```tsx
// 直接在组件中使用
<div className="shadow-elevated-lg">{/* 内容 */}</div>
```

#### 6.2 颜色不生效

**原因**: 颜色定义在 `globals.css` 中而不是 `tailwind.config.js`。

**解决**: 所有颜色定义必须在 `tailwind.config.js` 的 `theme.extend.colors` 中。

#### 6.3 自定义类找不到

**原因**: `content` 配置不包含文件路径。

**解决**: 确保 `tailwind.config.js` 的 `content` 数组包含所有需要扫描的文件。

### 7. 检查清单

新项目配置 Tailwind CSS 时，确保：

- [ ] 安装 `tailwindcss@^3`、`postcss`、`autoprefixer`、`eslint-plugin-tailwindcss`
- [ ] 创建 `tailwind.config.js` 并提炼设计系统
- [ ] 创建 `postcss.config.mjs`
- [ ] 在 `globals.css` 中导入 Tailwind 指令
- [ ] 所有颜色、阴影、圆角定义在 `tailwind.config.js` 中
- [ ] `globals.css` 只包含基础样式和组件类
- [ ] 没有循环依赖（不在 `@layer utilities` 中使用 `@apply` 自定义工具类）
- [ ] 使用设计系统类名而不是硬编码值

### 8. 参考示例

完整配置示例参考：

- `apps/lago/tailwind.config.js` - 设计系统配置
- `apps/lago/app/globals.css` - 全局样式和组件类
- `apps/lago/postcss.config.mjs` - PostCSS 配置

---

## 📋 开发规范

### 代码风格

1. **TypeScript**: 所有代码必须有完整类型定义
2. **命名规范**:
   - 文件: `camelCase.ts` 或 `PascalCase.tsx` (组件)
   - 变量/函数: `camelCase`
   - 类/接口: `PascalCase`
   - 常量: `UPPER_SNAKE_CASE`
   - 数据库字段: `snake_case` (Prisma自动映射)

3. **组件开发**:
   - 优先使用函数式组件
   - 使用TypeScript定义Props
   - 提取可复用逻辑到自定义Hooks

### Git提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

示例:

```bash
git commit -m "feat: 添加任务优先级功能"
git commit -m "fix: 修复任务列表排序问题"
git commit -m "docs: 更新API文档"
```

---

## 🔧 环境配置

### 必需环境变量

```bash
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/lago"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT密钥
JWT_SECRET="your-secret-key"

# AI服务
AI_API_KEY="your-qwen-api-key"
AI_API_BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"

# 阿里云OSS (图片上传)
OSS_ACCESS_KEY_ID="your-access-key"
OSS_ACCESS_KEY_SECRET="your-secret-key"
OSS_BUCKET="your-bucket-name"
OSS_REGION="oss-cn-hangzhou"

# 端口配置
PORT=3001  # 后端端口
NEXT_PUBLIC_API_URL="http://localhost:3001"  # 前端API地址
```

---

## 🚀 快速开始

> **⚠️ 重要**: 本项目使用 **npm** 作为包管理器，所有安装和构建命令必须使用 `npm`，不要使用 `pnpm` 或 `yarn`。

### 本地开发

```bash
# 1. 安装依赖（使用 npm）
npm install

# 2. 启动数据库和Redis (使用Docker)
docker-compose up -d

# 3. 初始化数据库
cd apps/lago-server
npx prisma db push
npx tsx src/scripts/seed.ts

# 4. 启动后端
npm run dev

# 5. 启动前端 (新终端)
cd ../lago-web
npm run dev
```

访问:

- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- Swagger文档: http://localhost:3001/api-docs

---

## 📦 部署流程

### 生产环境部署

```bash
# 1. 构建前端
cd apps/lago-web
npm run build

# 2. 构建后端
cd ../lago-server
npm run build

# 3. 使用Docker部署
cd ../..
docker-compose -f docker-compose.prod.yml up -d
```

详细部署文档见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd apps/lago-server
npm test

# 前端测试
cd apps/lago-web
npm test

# E2E测试
npm run test:e2e
```

### 测试文件位置

- 单元测试: 与源文件同目录，命名为 `*.test.ts`
- 集成测试: `test/` 目录
- E2E测试: `test/e2e/` 目录

---

## 📝 常用命令

### 数据库相关

```bash
# Prisma Studio (可视化数据库管理)
npx prisma studio

# 生成Prisma Client
npx prisma generate

# 重置数据库
npx prisma migrate reset

# 查看数据库状态
npx prisma migrate status
```

### API相关

```bash
# 生成前端API代码
cd apps/lago-web
node scripts/generate-api.js

# 验证Swagger文档
cd apps/lago-server
npm run build
# 访问 http://localhost:3001/api-docs
```

---

## 🎯 最佳实践

### 1. API设计

- 使用RESTful风格
- 统一的响应格式
- 完整的错误处理
- Swagger文档必须完整

### 2. 数据库操作

- 永远使用Prisma ORM
- 使用事务处理关联操作
- 添加适当的索引
- 定期优化查询性能

### 3. 前端开发

- 使用React Query管理服务端状态
- 组件保持单一职责
- 提取共用逻辑到Hooks
- 做好错误边界处理

### 4. 性能优化

- 使用Redis缓存热点数据
- 前端使用虚拟滚动处理长列表
- 图片使用CDN和懒加载
- API响应使用分页

---

## 🔍 故障排查

### 常见问题

1. **Prisma连接失败**

   ```bash
   # 检查DATABASE_URL是否正确
   # 重新生成Prisma Client
   npx prisma generate
   ```

2. **API生成失败**

   ```bash
   # 确保swagger.json存在且格式正确
   cd apps/lago-server
   npm run build
   cp dist/swagger.json ../lago-web/swagger.json
   ```

3. **前端API调用401错误**

   ```bash

   ```

# 检查Token是否有效

# 清除localStorage中的token

localStorage.removeItem('lago_token')

```

---

## 📚 相关文档

- [架构设计](./ARCHITECTURE.md) - 前后端架构详解
- [数据库设计](./DATABASE_DESIGN.md) - 数据库表结构
- [功能文档](./FEATURES_BY_PAGE.md) - 按页面组织的功能
- [API文档](./API_DOCUMENTATION.md) - API接口详细说明
- [部署指南](./DEPLOYMENT_GUIDE.md) - 生产环境部署

---

## 🤝 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证

---

**最后更新**: 2025-10-10

```
