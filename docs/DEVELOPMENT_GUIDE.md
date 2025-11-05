# Lago 开发指南

> **重要提示**: 这是项目的核心开发文档，提供给AI作为context使用。包含所有关键的开发流程、规范和最佳实践。

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

```typescript
// apps/lago-server/src/routes/products.ts
import { Router } from 'express';
import * as productController from '../controllers/productController';
import { validateRequest } from '../middleware/validateRequest';
import { productSchemas } from '../schemas/productSchema';

const router = Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: 创建新任务
 *     tags: [Tasks]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskDTO'
 *     responses:
 *       200:
 *         description: 任务创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 */
router.post('/tasks', validateRequest(taskSchemas.CreateTaskSchema), taskController.createTask);

export default router;
```

#### 1.2 定义验证Schema

**后端** - 在 `apps/lago-server/src/schemas/` 目录下定义验证规则:

```typescript
// apps/lago-server/src/schemas/productSchema.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { ProductCategory, TransactionType } from '@prisma/client';

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
import { useCreateProduct, useProduct } from '@/lib/apis';

function ProductForm() {
  const createProduct = useCreateProduct({});
  
  const handleSubmit = async (data: CreateProductDTO) => {
    try {
      const result = await createProduct.mutateAsync(data);
      console.log('商品发布成功:', result);
    } catch (error) {
      console.error('发布失败:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
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
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据迁移...');
  
  // 示例：为现有商品设置默认优先级
  const products = await prisma.product.findMany({
    where: { priority: null }
  });
  
  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: { 
        priority: product.price ? 2 : 1 
      }
    });
  }
  
  console.log(`更新了 ${products.length} 个商品的优先级`);
  
  // 初始化新的种子数据
  await seedProductCategories();
}

async function seedProductCategories() {
  const categories = [
    {
      name: '玩具',
      slug: 'toys',
      icon: '🧸'
    },
    {
      name: '游戏机',
      slug: 'gaming',
      icon: '🎮'
    },
    // ... 更多分类
  ];
  
  for (const category of categories) {
    await prisma.productCategory.create({ data: category });
  }
  
  console.log('商品分类创建完成');
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

### 前端
- **框架**: Next.js 14 (App Router)
- **UI**: React 18 + TypeScript
- **样式**: Tailwind CSS
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

### 本地开发

```bash
# 1. 安装依赖
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

