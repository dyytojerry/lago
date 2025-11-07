# Lago 后端服务

## 项目结构

```
lago-server/
├── src/
│   ├── config/          # 配置文件
│   ├── controllers/     # 控制器
│   ├── routes/         # 路由定义
│   ├── schemas/        # 验证Schema
│   ├── services/       # 业务服务
│   ├── lib/            # 工具库
│   │   ├── prisma.ts   # Prisma客户端
│   │   └── auth.ts     # 认证工具
│   ├── middleware/     # 中间件
│   │   ├── auth.ts     # 认证中间件
│   │   └── validate.ts # 验证中间件
│   ├── scripts/        # 脚本
│   │   └── seed.ts     # 种子数据
│   └── index.ts        # 入口文件
├── prisma/
│   └── schema.prisma   # 数据库Schema
└── package.json
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/lago"
JWT_SECRET="your-secret-key"
PORT=3001
```

### 3. 初始化数据库

```bash
# 生成Prisma客户端
npm run db:generate

# 推送Schema到数据库
npm run db:push

# 初始化种子数据（创建默认运营系统账号）
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将运行在 `http://localhost:3001`

## API端点

### 小程序端认证

- `POST /api/auth/wechat/login` - 微信登录
- `POST /api/auth/phone/login` - 手机号登录
- `POST /api/auth/phone/register` - 手机号注册
- `GET /api/auth/me` - 获取当前用户信息（需要认证）

### 运营系统认证

- `POST /api/auth/operation/login` - 运营系统登录
- `GET /api/auth/operation/me` - 获取当前运营人员信息（需要认证）

## 默认账号

运行 `npm run db:seed` 后会创建以下默认账号：

- **运营系统管理员**: admin / admin123
- **审核专员**: audit / staff123
- **客服专员**: service / staff123

## 账号体系

### 小程序端账号（User表）

- **user**: 住户/个人卖家
- **merchant**: 商家
- **property**: 物业
- **admin**: 平台管理员（小程序端）

### 运营系统账号（OperationStaff表）

- **super_admin**: 超级管理员
- **audit_staff**: 审核专员
- **service_staff**: 客服专员
- **operation_staff**: 运营专员
- **finance_staff**: 财务专员

两个账号体系完全独立，不能互相登录。


## 填充数据

1. 填充省市区数据 `npm run seed-regions --workspace=apps/lago-server`
2. 填充杭州市小区数据 `npm run fetch-communities --city=杭州 --workspace=apps/lago-server`

# Default: fills missing info for up to 200 communities (existing filter)
npm run enrich-communities --workspace=apps/lago-server

# Limit the number processed
npm run enrich-communities --workspace=apps/lago-server -- --limit=50

# Target a city
npm run enrich-communities --workspace=apps/lago-server -- --city=杭州

# Force refresh even if data already exists
npm run enrich-communities --workspace=apps/lago-server -- --force