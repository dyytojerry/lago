# 项目结构说明

> **重要**: 本文档描述标准的 monorepo 项目结构，适用于前后端分离的全栈项目。

## 🏗️ 整体结构

```
[PROJECT_NAME]/
├── apps/                      # 应用目录（monorepo workspaces）
│   ├── [project]-server/      # 后端服务
│   ├── [project]-app/         # 前端应用（Next.js）
│   ├── [project]-admin/       # 管理后台（可选）
│   └── [project]-miniprogram/ # 小程序（可选）
├── docs/                      # 项目文档
│   ├── README.md              # 文档导航
│   ├── DEVELOPMENT_GUIDE.md   # 开发指南
│   ├── ARCHITECTURE.md        # 架构设计
│   └── ...                    # 其他文档
├── scripts/                   # 脚本文件
├── package.json              # 根 package.json（workspaces 配置）
└── .cursorrules              # Cursor AI 规则
```

## 📦 后端服务结构（apps/[project]-server/）

```
src/
├── config/              # 配置文件
│   ├── swagger.ts       # Swagger Schema 定义（用于 $ref 引用）
│   └── swagger.config.ts # Swagger 配置
├── controllers/         # 控制器（处理HTTP请求）
├── routes/             # 路由定义（定义API端点和Swagger文档）
├── schemas/            # 验证Schema (class-validator)
├── services/           # 业务服务（业务逻辑）
├── lib/                # 工具库
│   ├── prisma.ts       # Prisma客户端
│   └── auth.ts         # 认证工具
├── middleware/         # 中间件
│   ├── auth.ts         # 认证中间件
│   └── validate.ts     # 验证中间件
├── scripts/            # 脚本
│   └── seed.ts         # 种子数据
└── index.ts            # 入口文件

prisma/
└── schema.prisma       # 数据库Schema定义
```

### 关键文件说明

- **`src/config/swagger.ts`**: 定义 Swagger Schema，通过 `$ref` 引用，减少重复代码
- **`src/routes/*.ts`**: 路由定义，包含 Swagger 注释，使用 `$ref` 引用 schema
- **`src/schemas/*.ts`**: 使用 class-validator 定义验证规则
- **`src/controllers/*.ts`**: 处理 HTTP 请求，调用 service 层
- **`src/services/*.ts`**: 业务逻辑，数据库操作

## 🎨 前端应用结构（apps/[project]-app/）

```
app/                    # Next.js App Router
├── page.tsx           # 首页
├── layout.tsx         # 根布局
├── globals.css        # 全局样式
├── login/             # 登录页面
│   └── page.tsx
└── [feature]/         # 功能页面
    └── page.tsx

components/            # 可复用组件
├── ui/                # 基础UI组件
└── [feature]/         # 功能组件

lib/                   # 工具库
├── api.ts             # API客户端（axios封装）
├── auth.ts            # 认证工具
└── utils.ts           # 工具函数

hooks/                 # 自定义Hooks
└── useAuth.ts

providers/             # Context Providers
└── AuthProvider.tsx
```

### 关键文件说明

- **`lib/api.ts`**: API 客户端，配置 axios 拦截器（token、错误处理）
- **`lib/auth.ts`**: 认证相关工具（登录、token管理、用户信息）
- **`tailwind.config.js`**: Tailwind 配置，包含设计系统颜色定义

## 📁 文件命名规范

### 后端

- **路由文件**: `*.routes.ts` (如 `auth.routes.ts`)
- **控制器**: `*.controller.ts` (如 `auth.controller.ts`)
- **服务**: `*.service.ts` (如 `auth.service.ts`)
- **Schema**: `*.schema.ts` (如 `auth.schema.ts`)

### 前端

- **页面**: `page.tsx` (Next.js App Router)
- **组件**: `PascalCase.tsx` (如 `Button.tsx`)
- **工具**: `camelCase.ts` (如 `api.ts`, `auth.ts`)
- **Hook**: `use*.ts` (如 `useAuth.ts`)

## 🔧 配置文件

### 根目录

- **`package.json`**: 配置 workspaces，定义根脚本
- **`.cursorrules`**: Cursor AI 规则和上下文优先级

### 后端（apps/[project]-server/）

- **`package.json`**: 后端依赖和脚本
- **`tsconfig.json`**: TypeScript 配置
- **`prisma/schema.prisma`**: 数据库 Schema
- **`.env.example`**: 环境变量示例

### 前端（apps/[project]-app/）

- **`package.json`**: 前端依赖和脚本
- **`tsconfig.json`**: TypeScript 配置
- **`next.config.ts`**: Next.js 配置
- **`tailwind.config.js`**: Tailwind 配置（包含设计系统）
- **`postcss.config.mjs`**: PostCSS 配置
- **`.env.example`**: 环境变量示例

## 📝 文档结构（docs/）

```
docs/
├── README.md              # 文档导航
├── PROJECT_STRUCTURE.md   # 项目结构（本文档）
├── DEVELOPMENT_GUIDE.md   # 开发指南
├── ARCHITECTURE.md        # 架构设计
├── API_DEVELOPMENT.md     # API开发规范
├── DATABASE_GUIDE.md      # 数据库指南
├── DESIGN_SYSTEM.md       # 设计系统
└── .cursorrules           # Cursor规则
```

## 🚀 快速初始化

### 1. 创建项目结构

```bash
mkdir -p apps/[project]-server/src/{config,controllers,routes,schemas,services,lib,middleware,scripts}
mkdir -p apps/[project]-app/{app,components,lib,hooks,providers}
```

### 2. 初始化配置文件

参考模板项目中的配置文件，创建对应的 `package.json`, `tsconfig.json`, `tailwind.config.js` 等。

### 3. 复制模板文档

```bash
cp -r docs/boilerplate/* docs/
# 更新文档中的项目名称和描述
```

---

**提示**: 根据实际项目需求调整结构，但保持核心目录和命名规范的一致性。

