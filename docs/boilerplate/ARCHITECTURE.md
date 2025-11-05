# 技术架构设计

> **重要**: 本文档描述完整的前后端架构设计，包括技术栈选型、模块划分和通信机制。

> **⚠️ 包管理器说明**: 本项目**使用 npm 进行依赖管理和构建**，不使用 pnpm 或 yarn。所有安装和构建命令必须使用 `npm`。

## 🏗️ 项目概述

[PROJECT_NAME] 是一个基于 Next.js 14 + Express.js 的全栈应用。[PROJECT_DESCRIPTION]。采用前后端分离架构，支持 Web、小程序等多端访问。

## 🛠️ 技术栈

### 前端技术栈

- **框架**: Next.js 14 (App Router)
- **UI 库**: React 18 + TypeScript
- **样式**: Tailwind CSS v3
- **状态管理**: React Context + Zustand
- **数据请求**: Axios
- **实时通信**: Socket.IO Client（如需要）

### 后端技术栈

- **运行时**: Node.js 18+ + TypeScript
- **框架**: Express.js
- **数据库**: PostgreSQL 14+
- **ORM**: Prisma 5+
- **缓存**: Redis 7+（如需要）
- **认证**: JWT + bcrypt
- **验证**: class-validator + class-transformer
- **API 文档**: Swagger/OpenAPI
- **实时通信**: Socket.IO（如需要）

### 开发工具

- **代码检查**: ESLint + Prettier
- **类型检查**: TypeScript
- **构建**: Webpack 5 (Next.js) + tsc (Express)

## 🏛️ 系统架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         客户端层                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Web应用    │  │  管理后台     │                        │
│  │  (Next.js)   │  │  (Next.js)   │                        │
│  └──────────────┘  └──────────────┘                        │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTPS / WebSocket
             │
┌────────────▼────────────────────────────────────────────────┐
│                         API网关层                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Express.js API Server                    │   │
│  │  ┌───────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   路由    │  │  中间件     │  │  控制器    │     │   │
│  │  │  Routes   │  │ Middleware  │  │ Controllers│     │   │
│  │  └───────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────┘
             │
             │
┌────────────▼────────────────────────────────────────────────┐
│                         业务逻辑层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ 服务1    │  │ 服务2    │  │ 服务3    │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└────────────┬────────────────────────────────────────────────┘
             │
             │
┌────────────▼────────────────────────────────────────────────┐
│                         数据访问层                            │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Prisma ORM Client                      │     │
│  └────────────────────────────────────────────────────┘     │
└────────────┬────────────────────────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│PostgreSQL│    │  Redis  │
│  数据库  │    │  缓存   │
└─────────┘    └─────────┘
```

### 前后端通信

#### HTTP API 通信

```
前端 -> API请求 -> Express路由 -> 控制器 -> 服务层 -> 数据库
                                                        ↓
前端 <- JSON响应 <---------------------------- 统一响应格式
```

#### WebSocket 实时通信（如需要）

```
前端 -> Socket.IO Client -> Socket.IO Server -> 消息处理
                                                    ↓
前端 <- 实时推送 <---------------------- 广播/私聊消息
```

## 📦 项目结构

### Monorepo 结构

```
[PROJECT_NAME]/
├── apps/
│   ├── [project]-server/    # 后端服务
│   ├── [project]-app/       # 前端应用
│   └── [project]-admin/     # 管理后台（可选）
├── docs/                    # 项目文档
└── package.json            # 根配置（workspaces）
```

### 后端结构

```
src/
├── config/              # 配置文件
│   ├── swagger.ts       # Swagger Schema 定义
│   └── swagger.config.ts # Swagger 配置
├── controllers/         # 控制器
├── routes/             # 路由定义
├── schemas/            # 验证Schema
├── services/           # 业务服务
├── lib/                # 工具库
│   ├── prisma.ts       # Prisma客户端
│   └── auth.ts         # 认证工具
├── middleware/         # 中间件
│   ├── auth.ts         # 认证中间件
│   └── validate.ts     # 验证中间件
└── index.ts            # 入口文件
```

### 前端结构

```
app/                    # Next.js App Router
├── page.tsx           # 首页
├── layout.tsx         # 根布局
└── [feature]/         # 功能页面

components/            # 可复用组件
lib/                   # 工具库
│   ├── api.ts        # API客户端
│   └── auth.ts       # 认证工具
hooks/                 # 自定义Hooks
```

## 🔐 认证与授权

### JWT Token 认证

- **Token 生成**: 使用 `jsonwebtoken` 生成 JWT
- **Token 存储**: 前端存储在 localStorage
- **Token 验证**: 后端中间件验证 token
- **Token 刷新**: 根据业务需求实现刷新机制

### 权限控制

- **角色权限**: 基于角色的访问控制（RBAC）
- **中间件**: 使用认证和权限中间件保护路由

## 📡 API 设计

### RESTful API

- **GET**: 获取资源
- **POST**: 创建资源
- **PUT**: 更新资源（完整）
- **PATCH**: 更新资源（部分）
- **DELETE**: 删除资源

### 响应格式

```typescript
// 成功响应
{
  data: T,
  message?: string
}

// 错误响应
{
  error: string,
  code?: number
}
```

### Swagger 文档

- **访问地址**: `http://localhost:3001/api-docs`
- **Schema 定义**: `src/config/swagger.ts`
- **路由文档**: 在路由文件中使用 Swagger 注释

## 🗄️ 数据库设计

### Prisma ORM

- **Schema 定义**: `prisma/schema.prisma`
- **迁移**: 使用 `prisma migrate` 管理数据库变更
- **客户端**: 通过 `@prisma/client` 访问数据库

### 数据库原则

1. **永远通过 Prisma Schema 变更数据库**
2. **使用迁移管理数据库版本**
3. **合理使用索引优化查询**
4. **遵循数据库范式，避免冗余**

## 🎨 设计系统

### Tailwind CSS

- **配置文件**: `tailwind.config.js`
- **设计系统来源**: 必须从项目设计文档中提取（参考 `docs/DESIGN_SYSTEM.md`）
- **配置内容**: 颜色、字体、圆角、阴影、间距等从设计文档提取并配置
- **使用方式**: 使用设计系统类名，如 `bg-primary`, `text-accent`

### 设计系统提取流程

1. **查找设计文档**: 在 `docs/` 目录查找设计系统相关文档
2. **分析设计文档**: 提取颜色、字体、圆角、阴影、间距等信息
3. **配置到 Tailwind**: 将提取的信息配置到 `tailwind.config.js` 的 `theme.extend` 中

详细流程请参考 **`docs/DESIGN_SYSTEM.md`**。

### 组件设计原则

1. **可复用性**: 组件要可复用
2. **一致性**: 统一的视觉风格（使用从设计文档提取的设计系统）
3. **可访问性**: 支持无障碍访问
4. **响应式**: 适配不同屏幕尺寸

## 🚀 开发工作流

### 本地开发

```bash
# 使用 npm（不要使用 pnpm 或 yarn）
npm run dev          # 启动开发服务器
npm run lint         # 代码检查
npm run type-check   # 类型检查
npm run test         # 运行测试
```

### 生产构建

```bash
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
```

---

**提示**: 根据实际项目需求调整架构和技术栈，但保持核心设计原则的一致性。

