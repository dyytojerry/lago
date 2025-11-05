# 开发指南

> **重要提示**: 这是项目的核心开发文档，提供给 AI 作为 context 使用。包含所有关键的开发流程、规范和最佳实践。

> **⚠️ 包管理器说明**: 本项目**使用 npm 进行依赖管理和构建**，不使用 pnpm 或 yarn。所有安装和构建命令必须使用 `npm`。

## 🎯 核心开发流程

### 1. API开发流程

#### 1.1 定义 Swagger Schema（在 `src/config/swagger.ts`）

首先在 `swagger.ts` 中定义 Schema，用于后续通过 `$ref` 引用：

```typescript
// src/config/swagger.ts
export const swaggerSchemas = {
  User: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      // ...
    },
  },
  CreateUserRequest: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
    },
    required: ['name', 'email'],
  },
};
```

#### 1.2 定义路由和 Swagger 文档

在 `src/routes/` 目录下定义路由，使用 `$ref` 引用 Schema：

```typescript
// src/routes/users.routes.ts
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 创建用户
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/users', validateDto(CreateUserDto), createUser);
```

#### 1.3 定义验证 Schema

使用 class-validator 定义验证规则：

```typescript
// src/schemas/user.schema.ts
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
```

#### 1.4 实现控制器

```typescript
// src/controllers/user.controller.ts
export async function createUser(req: Request<{}, {}, CreateUserDto>, res: Response) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ error: '创建失败' });
  }
}
```

### 2. 数据库变更流程

#### 2.1 修改 Prisma Schema

**永远通过 Prisma Schema 来实现数据库变更**，不要直接执行 SQL：

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
}
```

#### 2.2 推送变更到数据库

```bash
cd apps/[project]-server

# 开发环境：推送schema变更
npm run db:push

# 生产环境：创建迁移
npm run db:migrate
```

#### 2.3 更新种子数据（如需要）

在 `src/scripts/seed.ts` 中处理数据迁移：

```typescript
// 为现有数据设置默认值
const users = await prisma.user.findMany({
  where: { someField: null }
});

for (const user of users) {
  await prisma.user.update({
    where: { id: user.id },
    data: { someField: defaultValue }
  });
}
```

### 3. 前端开发流程

#### 3.1 创建页面

```typescript
// app/users/page.tsx
'use client';

export default function UsersPage() {
  // 页面逻辑
  return <div>用户列表</div>;
}
```

#### 3.2 创建组件

```typescript
// components/UserCard.tsx
interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
```

#### 3.3 调用 API

```typescript
// lib/api.ts
import apiClient from './api';

export async function getUsers() {
  const response = await apiClient.get('/users');
  return response.data;
}
```

## 🎨 Tailwind CSS 配置与应用

### 1. 安装依赖

**重要**: 
- 新项目必须使用 Tailwind CSS v3，不要使用 v4（实验性版本）。
- **必须使用 npm 安装依赖**，不要使用 pnpm。

```bash
cd apps/[project]-app

# 安装 Tailwind CSS v3 及相关依赖（使用 npm）
npm install -D 'tailwindcss@^3' postcss autoprefixer eslint-plugin-tailwindcss
```

### 2. 初始化配置文件

创建 `tailwind.config.js` 和 `postcss.config.mjs`:

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
      // TODO: 从项目设计文档中提取并配置以下内容
      // 详细流程请参考 docs/DESIGN_SYSTEM.md
      colors: {
        // 从设计文档提取颜色定义
        primary: {
          DEFAULT: '#YOUR_PRIMARY_COLOR', // 从设计文档提取
          500: '#YOUR_PRIMARY_COLOR',
          600: '#YOUR_HOVER_COLOR',      // hover状态
        },
        // 其他颜色从设计文档提取...
      },
      // 字体、圆角、阴影等也从设计文档提取...
    },
  },
  plugins: [],
};
```

**重要**: 不要使用模板中的示例值，必须从项目设计文档中提取实际的设计系统信息。详细流程请参考 **`docs/DESIGN_SYSTEM.md`**。

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

### 4. 提取并配置设计系统

**重要**: 必须从项目设计文档中提取设计系统信息。

详细流程请参考 **`docs/DESIGN_SYSTEM.md`**，按照以下步骤：

1. 查找项目设计文档（通常在 `docs/` 目录）
2. 分析并提取颜色、字体、圆角、阴影、间距等信息
3. 将提取的信息配置到 `tailwind.config.js` 的 `theme.extend` 中

### 5. 使用设计系统类名

配置完成后，可以在组件中使用设计系统类名：

```tsx
// 使用从设计文档提取的颜色
<div className="bg-primary text-white">
  <button className="bg-accent hover:bg-accent-600">
    按钮
  </button>
</div>
```

## 📝 代码规范

### TypeScript

- 使用严格模式
- 所有函数参数和返回值必须有类型
- 使用 `interface` 定义对象类型
- 使用 `type` 定义联合类型和工具类型

### 命名规范

- **文件**: kebab-case (如 `user-service.ts`)
- **类/组件**: PascalCase (如 `UserService`, `UserCard`)
- **函数/变量**: camelCase (如 `getUser`, `userName`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)

### 代码组织

- 一个文件一个主要导出
- 相关功能放在同一目录
- 使用 index.ts 统一导出

## 🚀 快速开始

> **⚠️ 重要**: 本项目使用 **npm** 作为包管理器，所有安装和构建命令必须使用 `npm`，不要使用 `pnpm` 或 `yarn`。

### 本地开发

```bash
# 1. 安装依赖（使用 npm）
npm install

# 2. 启动数据库和Redis (使用Docker)
docker-compose up -d

# 3. 初始化数据库
cd apps/[project]-server
npm run db:push
npm run db:seed

# 4. 启动后端
npm run dev

# 5. 启动前端 (新终端)
cd ../[project]-app
npm run dev
```

访问:
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- API文档: http://localhost:3001/api-docs

## ✅ 最佳实践

1. **API接口必须有完整的Swagger文档**
2. **所有代码必须有TypeScript类型定义**
3. **数据库变更必须通过Prisma Schema**
4. **新功能必须更新对应的核心文档**
5. **使用 npm 安装依赖，不要使用 pnpm 或 yarn**
6. **设计系统必须从项目设计文档中提取，配置到 tailwind.config.js 中**
7. **Swagger Schema 定义在 src/config/swagger.ts 中，通过 $ref 引用**

---

**提示**: 根据实际项目调整流程和规范，但保持核心原则的一致性。

