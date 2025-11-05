# 数据库设计指南

> **重要**: 本文档描述数据库设计、迁移和最佳实践。

## 🗄️ 数据库概览

- **数据库类型**: PostgreSQL
- **ORM**: Prisma
- **Schema位置**: `apps/[project]-server/prisma/schema.prisma`
- **迁移管理**: Prisma Migrate

## 📊 数据库设计原则

### 1. 永远通过 Prisma Schema 变更数据库

**❌ 错误做法**: 直接执行 SQL

```sql
-- 不要这样做
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

**✅ 正确做法**: 修改 Prisma Schema

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?  // 新增字段
  createdAt DateTime @default(now())
}
```

### 2. 使用迁移管理数据库版本

```bash
# 开发环境：快速推送变更
npm run db:push

# 生产环境：创建迁移
npm run db:migrate
```

### 3. 合理的索引策略

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique  // 自动创建唯一索引
  phone     String?  @unique  // 唯一索引
  
  @@index([email])   // 普通索引
  @@index([createdAt]) // 时间索引
  @@index([role, isActive]) // 复合索引
}
```

## 🔄 数据库迁移流程

### 1. 修改 Schema

编辑 `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  // 新增字段
  phone     String?
  isActive  Boolean  @default(true)
}
```

### 2. 推送到数据库

```bash
cd apps/[project]-server

# 开发环境：推送schema变更
npx prisma db push

# 生产环境：创建迁移
npx prisma migrate dev --name add_user_phone_and_active
```

### 3. 更新种子数据

在 `src/scripts/seed.ts` 中处理存量数据：

```typescript
// 为现有用户设置默认值
const users = await prisma.user.findMany({
  where: { isActive: null }
});

for (const user of users) {
  await prisma.user.update({
    where: { id: user.id },
    data: { isActive: true }
  });
}
```

### 4. 生成 Prisma Client

```bash
npm run db:generate
```

## 📋 Schema 设计规范

### 1. 命名规范

- **Model**: PascalCase (如 `User`, `ProductOrder`)
- **字段**: camelCase (如 `userId`, `createdAt`)
- **枚举**: PascalCase (如 `UserRole`, `OrderStatus`)

### 2. 字段类型

```prisma
model User {
  id        String    @id @default(cuid())  // 主键
  name      String                            // 必填字符串
  email     String?   @unique                 // 可选，唯一
  age       Int?                              // 可选整数
  balance   Decimal   @db.Decimal(10,2)      // 金额，保留2位小数
  tags      String[]                          // 字符串数组
  metadata  Json?                             // JSON字段
  createdAt DateTime  @default(now())          // 创建时间
  updatedAt DateTime  @updatedAt              // 更新时间
}
```

### 3. 关系定义

```prisma
// 一对一
model User {
  id      String   @id @default(cuid())
  profile Profile?
}

model Profile {
  id     String @id @default(cuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

// 一对多
model User {
  id      String   @id @default(cuid())
  posts   Post[]
}

model Post {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])
}

// 多对多
model User {
  id    String   @id @default(cuid())
  roles UserRole[]
}

model Role {
  id    String   @id @default(cuid())
  users UserRole[]
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id])
  role   Role   @relation(fields: [roleId], references: [id])
  
  @@unique([userId, roleId])
}
```

### 4. 枚举类型

```prisma
enum UserRole {
  user
  admin
  moderator
}

enum OrderStatus {
  pending
  paid
  shipped
  completed
  cancelled
}

model User {
  id   String   @id @default(cuid())
  role UserRole @default(user)
}
```

## 🔍 索引策略

### 1. 自动索引

- `@id`: 自动创建主键索引
- `@unique`: 自动创建唯一索引

### 2. 手动索引

```prisma
model User {
  id        String   @id @default(cuid())
  email     String
  phone     String?
  role      String
  createdAt DateTime
  
  // 单列索引
  @@index([email])
  @@index([phone])
  
  // 复合索引
  @@index([role, createdAt])
  
  // 命名索引
  @@index([email], name: "idx_user_email")
}
```

### 3. 索引最佳实践

- **查询字段**: 经常用于 WHERE、JOIN 的字段
- **排序字段**: 经常用于 ORDER BY 的字段
- **复合索引**: 多字段查询时使用
- **避免过度索引**: 索引会降低写入性能

## 🔒 数据安全

### 1. 敏感数据

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // 密码哈希，不要存储明文
  phone     String? // 手机号，可能需要加密
}
```

### 2. 数据验证

在 Prisma Schema 中定义约束：

```prisma
model User {
  email String @unique // 唯一约束
  age   Int?   // 可选，但可以通过应用层验证范围
}
```

在应用层使用 class-validator 进行详细验证。

## 📈 性能优化

### 1. 查询优化

```typescript
// ❌ 避免 N+1 查询
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ 使用 include
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

### 2. 分页查询

```typescript
const users = await prisma.user.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' }
});
```

### 3. 选择性查询

```typescript
// 只查询需要的字段
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // 不查询 password
  }
});
```

## 🧪 测试数据

### 种子数据脚本

在 `src/scripts/seed.ts` 中：

```typescript
import prisma from '../lib/prisma';

async function main() {
  // 创建测试用户
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
    },
  });

  console.log('✅ 创建测试用户:', user.email);
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

运行：

```bash
npm run db:seed
```

## ✅ 检查清单

数据库变更时，确保：

- [ ] 修改了 Prisma Schema
- [ ] 添加了必要的索引
- [ ] 定义了字段约束（unique, default）
- [ ] 更新了关系定义
- [ ] 运行了迁移（`db:push` 或 `db:migrate`）
- [ ] 更新了种子数据（如需要）
- [ ] 生成了 Prisma Client
- [ ] 测试了查询性能

---

**提示**: 遵循这些原则可以确保数据库设计的一致性和可维护性。

