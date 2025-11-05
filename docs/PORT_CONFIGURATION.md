# 端口配置说明

本文档说明所有项目的端口分配和配置方法。

## 端口分配

| 项目 | 端口 | 说明 | 环境变量 |
|------|------|------|----------|
| lago | 3000 | 官网静态页面 | 无需 .env |
| lago-server | 3001 | 后端服务 | 需要 .env |
| lago-app | 3002 | 用户端应用 | 需要 .env |
| lago-operation | 3003 | 运营系统 | 需要 .env |
| ui | 3004 | 设计系统管理器 | 无需 .env |

## 环境变量配置

### lago-app (用户端应用)

创建 `apps/lago-app/.env` 文件：

```bash
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:3001

# 端口号（可选，package.json 中已配置为 3002）
PORT=3002
```

### lago-operation (运营系统)

创建 `apps/lago-operation/.env` 文件：

```bash
# 后端 API 地址
NEXT_PUBLIC_API_URL=http://localhost:3001

# 端口号（可选，package.json 中已配置为 3003）
PORT=3003
```

### lago-server (后端服务)

创建 `apps/lago-server/.env` 文件：

```bash
# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/lago

# Redis 连接
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 服务端口
PORT=3001

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
```

## 启动命令

### 开发环境

```bash
# 启动后端服务（端口 3001）
npm run dev:server

# 启动用户端应用（端口 3002）
npm run dev:app

# 启动运营系统（端口 3003）
npm run dev:operation

# 启动官网（端口 3000）
npm run dev:lago

# 启动设计系统管理器（端口 3004）
npm run dev:ui
```

### 生产环境

```bash
# 启动后端服务
npm run start:server

# 启动用户端应用
npm run start:app

# 启动运营系统
npm run start:operation

# 启动官网
npm run start:lago

# 启动设计系统管理器
npm run start:ui
```

## 访问地址

### 开发环境

- **官网**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **用户端应用**: http://localhost:3002
- **运营系统**: http://localhost:3003
- **设计系统管理器**: http://localhost:3004

### API 文档

- **Swagger 文档**: http://localhost:3001/api-docs

## 注意事项

1. **lago (官网)**: 静态页面，不需要 `.env` 文件，端口固定为 3000
2. **ui (设计系统管理器)**: 开发工具，不需要 `.env` 文件，端口固定为 3004
3. **lago-app**: 需要配置 `NEXT_PUBLIC_API_URL` 指向后端服务 (3001)
4. **lago-operation**: 需要配置 `NEXT_PUBLIC_API_URL` 指向后端服务 (3001)
5. **lago-server**: 需要配置数据库、Redis 等环境变量

## 端口冲突处理

如果某个端口被占用，可以：

1. **修改 package.json**: 更新 `dev` 和 `start` 脚本中的端口号
2. **使用环境变量**: 在 `.env` 文件中设置 `PORT` 变量（需要修改脚本支持）
3. **检查占用**: 使用 `lsof -i :端口号` (macOS/Linux) 或 `netstat -ano | findstr :端口号` (Windows) 查看端口占用

## 小程序 WebView 配置

小程序 WebView 默认加载用户端应用 (lago-app)，开发环境使用 `http://localhost:3002`。

如需修改，请编辑 `miniprogram/pages/webview/webview.js` 中的 `getDefaultUrl()` 方法。

