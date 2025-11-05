# 📘 Lago - 来购（社区二手租售平台）

> **⚠️ 重要**: 本项目使用 **npm** 作为包管理器，所有依赖安装和构建命令必须使用 `npm`，不要使用 `pnpm` 或 `yarn`。

## 技术架构

### 前端技术栈

- **微信小程序**: 原生开发，支持微信生态
- **Next.js 14**: 全栈 React 框架，支持 SSR/SSG
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 原子化 CSS 框架
- **Framer Motion**: 动画库
- **Zustand**: 轻量级状态管理

### 后端技术栈

- **Next.js API Routes**: 服务端 API
- **Prisma**: 数据库 ORM
- **PostgreSQL**: 主数据库
- **Redis**: 缓存和会话存储
- **JWT**: 身份认证
- **WebSocket**: 实时通信

## 项目结构

```
lago/
├── apps/                    # 应用目录
│   ├── lago-server/        # 后端服务 (Node.js + Express)
│   │   ├── src/             # 源代码
│   │   │   ├── config/      # 配置文件
│   │   │   ├── controllers/ # 控制器
│   │   │   ├── middleware/  # 中间件
│   │   │   ├── routes/      # 路由
│   │   │   ├── services/    # 服务层
│   │   │   ├── models/      # 数据模型
│   │   │   └── utils/       # 工具函数
│   │   ├── prisma/          # 数据库模式
│   │   ├── Dockerfile       # Docker 配置
│   │   └── package.json     # 依赖配置
│   ├── lago/               # 白皮书，静态页面
│   └── lago-web/           # 前端应用 (Next.js)
│       ├── src/             # 源代码
│       │   ├── app/         # App Router
│       │   ├── components/  # React 组件
│       │   ├── lib/         # 工具库
│       │   └── types/       # 类型定义
│       ├── public/          # 静态资源
│       └── package.json     # 依赖配置
├── miniprogram/            # 微信小程序
│   ├── pages/              # 页面
│   ├── components/         # 组件
│   ├── utils/              # 工具函数
│   └── app.js              # 小程序入口
├── nginx/                  # Nginx 配置
│   ├── nginx.conf          # 主配置
│   └── conf.d/             # 站点配置
├── scripts/                # 脚本文件
│   └── init-db.sql         # 数据库初始化
├── docker-compose.yml      # Docker Compose 配置
└── env.example             # 环境变量示例
```

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- 微信开发者工具

### 安装依赖

> **⚠️ 重要**: 本项目使用 **npm** 作为包管理器，所有安装命令必须使用 `npm`。

```bash
# 安装所有依赖（使用 npm）
npm run install:all

# 或者分别安装（使用 npm）
npm install                    # 根目录依赖
npm run install:server        # 后端依赖
npm run install:web          # 前端依赖
```

### 环境配置

```bash
# 后端环境变量
cp apps/lago-server/env.example apps/lago-server/.env

# 前端环境变量
cp apps/lago-web/env.example apps/lago-web/.env
```

配置数据库和 Redis 连接：

```bash
# apps/lago-server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/lago"
REDIS_URL="redis://:lagoredis@localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
WECHAT_APPID="your_wechat_appid"
WECHAT_SECRET="your_wechat_secret"
PORT=3001

# apps/lago-web/.env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

### 数据库初始化

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式
npm run db:push

# 填充种子数据
npm run db:seed
```

### 启动开发服务器

#### 方式一：纯本地开发（推荐）

```bash
# 启动数据库和Redis（Docker）
npm run dev:docker

# 启动前后端服务
npm run dev
```

#### 方式二：完全本地开发

```bash
# 启动后端服务
npm run dev:server

# 启动前端应用（新终端）
npm run dev:web
```

### 生产环境部署

```bash
# 构建并启动生产环境
npm run prod:docker:build

# 查看服务状态
docker-compose -f docker-compose.prod.yml ps
```

### 测试环境部署

测试环境用于单机部署测试，模拟生产环境配置：

#### 手动部署

```bash
# 1. 构建测试环境
npm run build:test

# 2. 启动测试环境
npm run test:docker:build

# 3. 验证环境
npm run test:env
```

#### 测试环境管理

```bash
# 查看服务状态
cd dist && docker-compose -f docker-compose.test.yml ps

# 查看日志
npm run test:docker:logs

# 停止服务
npm run test:docker:down

# 重启服务
npm run test:docker:build
```

#### 访问地址

- 前端应用: http://localhost:3000
- 后端 API: http://localhost:3001
- 数据库: localhost:5432
- Redis: localhost:6379

### 服务访问地址

#### 开发环境

- **后端 API**: http://localhost:3001
- **前端应用**: http://localhost:3000
- **数据库**: localhost:5432
- **Redis**: localhost:6379
- **Nginx**: http://localhost:80

## 开发指南

### 代码规范

- 使用 ESLint 和 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits 规范提交信息
- 所有代码必须经过 Code Review

### 测试

```bash
# 运行单元测试
npm run test

# 运行集成测试
npm run test:integration

# 运行E2E测试
npm run test:e2e
```

### 部署

#### 使用 Docker Compose 部署

```bash
# 构建并启动生产环境
docker-compose -f docker-compose.yml up -d --build

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 单独部署

```bash
# 构建后端服务
cd apps/lago-server
npm run build

# 构建前端应用
cd ../lago-web
npm run build

# 部署微信小程序
# 使用微信开发者工具上传代码
```

## 安全考虑

### 数据安全

- 所有敏感数据使用 AES-256 加密
- HTTPS 全站加密传输
- 严格的输入验证和 SQL 注入防护
- 完整的审计日志记录

### 隐私保护

- 遵循最小化数据收集原则
- 透明的隐私政策
- 用户数据控制权
- 符合相关法律法规

### 金融安全

- 服务端严格验证所有金额操作
- 完整的交易审计日志
- 异常交易行为检测
- 多重安全防护机制

## 贡献指南

### 如何贡献

1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 问题报告

- 使用 GitHub Issues 报告 bug
- 提供详细的复现步骤
- 包含环境信息和错误日志

### 功能请求

- 使用 GitHub Discussions 讨论新功能
- 提供详细的功能描述和使用场景
- 考虑对现有功能的影响

## 设计系统

查看 [DESIGN](DESIGN) 文件了解详情
