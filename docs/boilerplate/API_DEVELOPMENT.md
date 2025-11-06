# API 开发规范

> **重要**: 本文档详细说明 API 开发的完整流程，包括 Swagger Schema 定义、路由定义、验证和错误处理。

## 📋 开发流程

### 1. 定义 Swagger Schema

**位置**: `src/config/swagger.ts`

首先在 `swagger.ts` 中定义所有 Schema，用于后续通过 `$ref` 引用：

```typescript
// src/config/swagger.ts
export const swaggerSchemas = {
  // 请求 Schema
  CreateUserRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: '用户名',
      },
      email: {
        type: 'string',
        format: 'email',
        description: '邮箱',
      },
    },
    required: ['name', 'email'],
  },

  // 响应 Schema
  User: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: '用户ID',
      },
      name: {
        type: 'string',
        description: '用户名',
      },
      email: {
        type: 'string',
        description: '邮箱',
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        description: '创建时间',
      },
    },
    required: ['id', 'name', 'email', 'createdAt'],
  },

  UserResponse: {
    type: 'object',
    properties: {
      user: {
        $ref: '#/components/schemas/User',
      },
    },
    required: ['user'],
  },

  // 错误响应
  ErrorResponse: {
    type: 'object',
    properties: {
      error: {
        type: 'string',
        description: '错误信息',
      },
    },
    required: ['error'],
  },
};
```

### 2. 定义路由和 Swagger 文档

**位置**: `src/routes/*.routes.ts`

#### 2.1 路由文件结构

每个路由文件必须遵循以下结构：

1. **文件头部 Tags 定义**：在 `router` 定义后、第一个接口定义前，定义该 route 的 tag
2. **接口定义**：每个接口都需要完整的 Swagger 注释

#### 2.2 Tags 命名规范

**重要规则**：
- **Tag 名称使用大驼峰形式**：多个单词连接起来，不要使用空格
  - ✅ `AdminDashboard`、`AdminUsers`、`AdminProducts`
  - ❌ `Admin Dashboard`、`Admin Users`、`Admin Products`
  
- **每个接口的 tags 包含两个值**：
  - 第一个 tag：当前 route 的 tag（如 `Auth`、`AdminDashboard`、`Share`）
  - 第二个 tag：项目类型（`App` 或 `Operation`）
  
- **文件头部的 tags.name 只包含第一个 tag**（route 的 tag）

#### 2.3 路由文件示例

```typescript
// src/routes/auth.routes.ts
import { Router } from 'express';
import { wechatLogin, phoneLogin, operationLogin } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authUser, authOperation } from '../middleware/auth';

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

export default router;
```

#### 2.4 运营系统路由示例

```typescript
// src/routes/products.routes.ts
import { Router } from 'express';
import { getProducts, approveProduct } from '../controllers/products.controller';
import { authOperation } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import * as Joi from 'joi';

const router = Router();

// 所有路由需要运营端认证
router.use(authOperation);

/**
 * @swagger
 * tags:
 *   name: AdminProducts
 *   description: 运营系统商品管理相关接口
 */

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: 获取商品列表
 *     tags: [AdminProducts, Operation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *           default: "1"
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *           default: "20"
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功获取商品列表
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductListResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  '/',
  validateRequest(
    Joi.object({
      query: Joi.object({
        page: Joi.string().optional(),
        limit: Joi.string().optional(),
      }),
    })
  ),
  getProducts
);

export default router;
```

#### 2.5 小程序端路由示例

```typescript
// src/routes/share.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Share
 *   description: 分享相关接口
 */

/**
 * @swagger
 * /api/share:
 *   post:
 *     summary: 获取分享数据
 *     tags: [Share, App]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [appMessage, timeline]
 *                 description: 分享类型
 *               path:
 *                 type: string
 *                 description: 当前页面路径
 *     responses:
 *       200:
 *         description: 分享数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                 desc:
 *                   type: string
 *                 path:
 *                   type: string
 *                 imageUrl:
 *                   type: string
 */
router.post('/', async (req: Request, res: Response) => {
  // 实现逻辑...
});

export default router;
```

#### 2.6 Tags 使用规则总结

| 场景 | 第一个 Tag | 第二个 Tag | 文件头部 tags.name |
|------|-----------|-----------|------------------|
| 小程序端认证接口 | `Auth` | `App` | `Auth` |
| 运营系统认证接口 | `Auth` | `Operation` | `Auth` |
| 运营系统仪表盘 | `AdminDashboard` | `Operation` | `AdminDashboard` |
| 运营系统用户管理 | `AdminUsers` | `Operation` | `AdminUsers` |
| 运营系统商品管理 | `AdminProducts` | `Operation` | `AdminProducts` |
| 运营系统订单管理 | `AdminOrders` | `Operation` | `AdminOrders` |
| 小程序端分享功能 | `Share` | `App` | `Share` |

### 3. 定义验证 Schema

**位置**: `src/schemas/*.schema.ts`

使用 class-validator 定义验证规则：

```typescript
// src/schemas/user.schema.ts
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
```

### 4. 实现控制器

**位置**: `src/controllers/*.controller.ts`

```typescript
// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { CreateUserDto } from '../schemas/user.schema';
import { userService } from '../services/user.service';

export async function createUser(
  req: Request<{}, {}, CreateUserDto>,
  res: Response
) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ user });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: '邮箱已存在' });
    }
    console.error('创建用户失败:', error);
    res.status(500).json({ error: '创建用户失败' });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('获取用户失败:', error);
    res.status(500).json({ error: '获取用户失败' });
  }
}
```

### 5. 实现服务层

**位置**: `src/services/*.service.ts`

```typescript
// src/services/user.service.ts
import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';
import { CreateUserDto } from '../schemas/user.schema';

export const userService = {
  async createUser(data: CreateUserDto) {
    const hashedPassword = await hashPassword(data.password);
    
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });
  },

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  },
};
```

## 🔧 Swagger 配置

### 1. Swagger Schema 导出

确保 `src/config/swagger.ts` 导出 `getSwaggerComponents()` 函数：

```typescript
export function getSwaggerComponents() {
  return {
    schemas: swaggerSchemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Token 认证，格式：Bearer {token}',
      },
    },
  };
}
```

### 2. Swagger 配置

在 `src/config/swagger.config.ts` 中配置：

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import { getSwaggerComponents } from './swagger';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '[PROJECT_NAME] API',
      version: '1.0.0',
      description: '[PROJECT_DESCRIPTION]',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: '开发环境',
      },
    ],
    components: getSwaggerComponents(),
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
```

### 3. 集成 Swagger UI

在 `src/index.ts` 中：

```typescript
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## 📝 最佳实践

### 1. Schema 复用

- **定义一次，多处引用**: 在 `swagger.ts` 中定义 Schema，通过 `$ref` 引用
- **避免重复**: 不要在路由注释中重复定义 Schema

### 2. Tags 规范

- **大驼峰命名**: Tag 名称使用大驼峰形式，多个单词连接（如 `AdminDashboard`）
- **双标签结构**: 每个接口的 tags 包含两个值 `[RouteTag, ProjectTag]`
  - 第一个 tag：route 的功能分类（如 `Auth`、`AdminProducts`）
  - 第二个 tag：项目类型（`App` 或 `Operation`）
- **文件头部定义**: 在路由文件开头定义 tags.name，只包含第一个 tag

### 3. 路由文件结构

- **统一的文件结构**：
  1. 导入依赖
  2. 创建 router 实例
  3. 应用中间件（如需要）
  4. **文件头部 tags 定义**（必须）
  5. 接口定义（每个接口都有完整的 Swagger 注释）

### 4. 错误处理

- **统一错误格式**: 使用 `ErrorResponse` Schema
- **HTTP 状态码**: 正确使用状态码（200, 201, 400, 401, 404, 500）
- **错误信息**: 提供清晰的错误信息

### 5. 验证

- **使用 Joi 或 class-validator**: 所有请求参数都要验证
- **验证中间件**: 使用 `validateRequest` 或 `validateDto` 中间件自动验证

### 6. 认证

- **JWT Token**: 使用 Bearer Token 认证
- **认证中间件**: 使用 `authUser` 或 `authOperation` 中间件
- **权限检查**: 使用 `requireRole` 中间件检查权限
- **安全声明**: 需要认证的接口必须在 Swagger 注释中添加 `security: - bearerAuth: []`

## ✅ 检查清单

开发新 API 时，确保：

- [ ] 在 `swagger.ts` 中定义了所有 Schema
- [ ] 路由文件开头定义了 tags.name（只包含第一个 tag）
- [ ] 每个接口的 tags 包含两个值：`[RouteTag, ProjectTag]`
- [ ] Tag 名称使用大驼峰形式（如 `AdminDashboard`，不是 `Admin Dashboard`）
- [ ] 路由注释中使用 `$ref` 引用 Schema
- [ ] 定义了验证 Schema（Joi 或 class-validator）
- [ ] 实现了控制器逻辑
- [ ] 实现了服务层逻辑
- [ ] 添加了错误处理
- [ ] 添加了认证（如需要）
- [ ] 需要认证的接口添加了 `security: - bearerAuth: []`
- [ ] 测试了 API 端点
- [ ] 更新了 API 文档

---

**提示**: 遵循这个流程可以确保 API 的一致性和可维护性。

