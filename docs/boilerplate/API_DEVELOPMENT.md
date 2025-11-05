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

在路由文件中定义 API 端点，使用 `$ref` 引用 Schema：

```typescript
// src/routes/users.routes.ts
import { Router } from 'express';
import { createUser, getUser } from '../controllers/user.controller';
import { validateDto } from '../middleware/validate';
import { CreateUserDto } from '../schemas/user.schema';

const router = Router();

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
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/users', validateDto(CreateUserDto), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: 获取用户信息
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 用户不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/users/:id', authUser, getUser);

export default router;
```

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

### 2. 错误处理

- **统一错误格式**: 使用 `ErrorResponse` Schema
- **HTTP 状态码**: 正确使用状态码（200, 201, 400, 401, 404, 500）
- **错误信息**: 提供清晰的错误信息

### 3. 验证

- **使用 class-validator**: 所有请求参数都要验证
- **验证中间件**: 使用 `validateDto` 中间件自动验证

### 4. 认证

- **JWT Token**: 使用 Bearer Token 认证
- **认证中间件**: 使用 `authUser` 或 `authOperation` 中间件
- **权限检查**: 使用 `requireRole` 中间件检查权限

## ✅ 检查清单

开发新 API 时，确保：

- [ ] 在 `swagger.ts` 中定义了所有 Schema
- [ ] 路由注释中使用 `$ref` 引用 Schema
- [ ] 定义了验证 Schema（class-validator）
- [ ] 实现了控制器逻辑
- [ ] 实现了服务层逻辑
- [ ] 添加了错误处理
- [ ] 添加了认证（如需要）
- [ ] 测试了 API 端点
- [ ] 更新了 API 文档

---

**提示**: 遵循这个流程可以确保 API 的一致性和可维护性。

