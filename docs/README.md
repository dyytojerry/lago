# Lago 文档中心

> **给AI的重要提示**: 当你收到关于Lago项目的任何开发问题时，请首先阅读本文档指引，然后根据具体需求查阅相应的核心文档。

## 📚 文档结构

本项目采用**精简文档策略**，只保留最核心和最新的文档。所有文档已按功能分类整理。

### 🎯 核心文档（必读）

这些文档包含项目的核心信息，是AI作为context的最佳选择：

1. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** ⭐⭐⭐⭐⭐
   - **用途**: 开发流程和规范
   - **包含**: API开发、数据库迁移、文档规范、环境配置
   - **何时使用**: 开发新功能、修改现有功能、添加API接口

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** ⭐⭐⭐⭐⭐
   - **用途**: 系统架构设计
   - **包含**: 前后端技术栈、模块划分、通信机制、核心功能模块
   - **何时使用**: 理解系统整体架构、添加新模块、重构代码

3. **[DATABASE_DESIGN.md](./DATABASE_DESIGN.md)** ⭐⭐⭐⭐⭐
   - **用途**: 数据库设计文档
   - **包含**: 所有表结构、字段说明、关系图、迁移流程
   - **何时使用**: 数据库变更、添加新表、理解数据关系

4. **[FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md)** ⭐⭐⭐⭐⭐
   - **用途**: 按页面组织的功能说明
   - **包含**: 每个页面的功能模块、API调用、组件使用
   - **何时使用**: 开发或修改具体页面、理解页面功能

5. **[PRD.md](./PRD.md)** ⭐⭐⭐⭐
   - **用途**: 产品需求文档
   - **包含**: 产品定位、用户路径、页面架构、功能规划
   - **何时使用**: 理解业务需求、规划新功能、产品设计

### 📖 参考文档

6. **设计系统文档** ⭐⭐⭐
   - **[DESIGN_SYSTEM_WEBSITE.md](./DESIGN_SYSTEM_WEBSITE.md)** - 官网设计系统（PC + Mobile）
     - **用途**: 产品官网的设计规范
     - **包含**: 官网配色、组件、响应式设计
     - **何时使用**: 开发官网、设计官网页面
   
   - **[DESIGN_SYSTEM_ADMIN.md](./DESIGN_SYSTEM_ADMIN.md)** - 运营系统设计系统（PC Web）
     - **用途**: 平台管理后台的设计规范
     - **包含**: 后台配色、表格、表单、数据可视化
     - **何时使用**: 开发管理后台、设计后台页面
   
   - **[DESIGN_SYSTEM_MINIPROGRAM.md](./DESIGN_SYSTEM_MINIPROGRAM.md)** - 小程序设计系统（微信小程序）
     - **用途**: 微信小程序的设计规范
     - **包含**: 小程序配色、组件、移动端交互
     - **何时使用**: 开发小程序、设计小程序页面

7. **[WHITEPAPER.md](./WHITEPAPER.md)** ⭐⭐⭐
   - **用途**: 产品白皮书
   - **包含**: 产品愿景、市场分析、商业模式
   - **何时使用**: 理解产品定位、商业逻辑

8. **[ADMIN_PANEL_DESIGN.md](./ADMIN_PANEL_DESIGN.md)** ⭐⭐⭐⭐
   - **用途**: 平台管理后台设计文档
   - **包含**: 后台功能模块、权限管理、数据看板、业务流程
   - **何时使用**: 开发管理后台、理解后台功能

---

## 🚀 快速开始

### 场景1: 我要开发一个新功能

1. 首先阅读 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
   - 了解API开发流程
   - 了解数据库变更流程
   - 了解代码规范

2. 然后查看 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
   - 确认是否需要新表或修改现有表
   - 理解相关数据模型

3. 参考 [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md)
   - 找到相关页面的实现方式
   - 复用现有组件

4. 查阅 [ARCHITECTURE.md](./ARCHITECTURE.md)
   - 确认模块划分
   - 理解系统架构

### 场景2: 我要修改现有功能

1. 在 [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md) 中找到对应页面
   - 理解当前实现
   - 确认涉及的API和组件

2. 查看 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
   - 确认数据模型
   - 检查是否需要数据库变更

3. 参考 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
   - 遵循开发规范
   - 执行数据库迁移

### 场景3: 我要理解项目架构

1. 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md)
   - 理解整体架构
   - 了解技术栈选型

2. 浏览 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
   - 理解数据模型
   - 掌握表关系

3. 查看 [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md)
   - 了解功能分布
   - 理解页面结构

### 场景4: 我要进行UI调整

1. 根据项目类型选择对应的设计系统文档：
   - **官网项目**: [DESIGN_SYSTEM_WEBSITE.md](./DESIGN_SYSTEM_WEBSITE.md)
   - **后台管理**: [DESIGN_SYSTEM_ADMIN.md](./DESIGN_SYSTEM_ADMIN.md)
   - **小程序**: [DESIGN_SYSTEM_MINIPROGRAM.md](./DESIGN_SYSTEM_MINIPROGRAM.md)

2. 参考 [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md)
   - 找到相关组件
   - 了解组件使用方式

---

## 📂 文档目录说明

```
docs/
├── README.md                    # 本文档 - 文档导航
├── DEVELOPMENT_GUIDE.md         # 核心 - 开发指南
├── ARCHITECTURE.md              # 核心 - 架构设计
├── DATABASE_DESIGN.md           # 核心 - 数据库设计
├── FEATURES_BY_PAGE.md          # 核心 - 功能说明（按页面）
├── PRD.md                       # 核心 - 产品需求文档
├── ADMIN_PANEL_DESIGN.md        # 核心 - 平台管理后台设计
│
├── 设计系统文档/
│   ├── DESIGN_SYSTEM_WEBSITE.md         # 官网设计系统（PC + Mobile）
│   ├── DESIGN_SYSTEM_ADMIN.md           # 运营系统设计系统（PC Web）
│   └── DESIGN_SYSTEM_MINIPROGRAM.md     # 小程序设计系统（微信小程序）
│
├── 参考文档/
│   └── WHITEPAPER.md            # 产品白皮书
│
├── WIP/                         # 进行中的总结文档
│   └── ...
│
└── archived/                    # 已归档的文档（不再使用）
    ├── DESIGN_SYSTEM.md        # 旧版设计系统（已拆分）
    ├── DESIGN.md                # 旧版设计文档（已拆分）
    └── DESIGN_SUMMARY.md        # 旧版设计总结（已拆分）
```

---

## 🎯 文档使用原则

### 给AI的提示

当你作为AI助手处理Lago项目的问题时，请遵循以下原则：

#### 1. 优先级原则
- **优先阅读**: DEVELOPMENT_GUIDE.md
- **架构问题**: ARCHITECTURE.md
- **数据库问题**: DATABASE_DESIGN.md
- **功能问题**: FEATURES_BY_PAGE.md
- **产品问题**: PRD.md
- **设计问题**: 
  - 官网 → DESIGN_SYSTEM_WEBSITE.md
  - 后台 → DESIGN_SYSTEM_ADMIN.md
  - 小程序 → DESIGN_SYSTEM_MINIPROGRAM.md

#### 2. 组合原则
根据问题类型，组合阅读多个文档：

| 问题类型 | 推荐文档组合 |
|---------|-------------|
| 开发新API | DEVELOPMENT_GUIDE + DATABASE_DESIGN + ARCHITECTURE |
| 开发新页面（官网） | FEATURES_BY_PAGE + DEVELOPMENT_GUIDE + DESIGN_SYSTEM_WEBSITE |
| 开发新页面（后台） | FEATURES_BY_PAGE + DEVELOPMENT_GUIDE + DESIGN_SYSTEM_ADMIN |
| 开发新页面（小程序） | FEATURES_BY_PAGE + DEVELOPMENT_GUIDE + DESIGN_SYSTEM_MINIPROGRAM |
| 数据库迁移 | DATABASE_DESIGN + DEVELOPMENT_GUIDE |
| 架构重构 | ARCHITECTURE + DATABASE_DESIGN + FEATURES_BY_PAGE |
| UI修改（官网） | DESIGN_SYSTEM_WEBSITE + FEATURES_BY_PAGE |
| UI修改（后台） | DESIGN_SYSTEM_ADMIN + FEATURES_BY_PAGE |
| UI修改（小程序） | DESIGN_SYSTEM_MINIPROGRAM + FEATURES_BY_PAGE |
| bug修复 | FEATURES_BY_PAGE + DATABASE_DESIGN |
| 产品规划 | PRD + FEATURES_BY_PAGE + ARCHITECTURE |

#### 3. 上下文原则
- 将核心文档作为长期context
- 对于复杂任务，同时引用多个相关文档
- 优先使用最新的文档信息

---

## 🔄 文档更新规则

### 何时更新文档

1. **添加新功能**: 
   - 更新 FEATURES_BY_PAGE.md
   - 如果有数据库变更，更新 DATABASE_DESIGN.md
   - 如果有架构变化，更新 ARCHITECTURE.md

2. **修改现有功能**:
   - 更新对应的核心文档
   - 标注更新时间

3. **重构代码**:
   - 更新 ARCHITECTURE.md
   - 必要时更新其他相关文档

### 文档维护策略

#### 保留原则
- 只保留核心文档（7-10个）
- 按功能分类，不按时间分类
- 重复功能以最新版本为准

#### 归档原则
- 过时的实现总结 → 移至 `archived/`
- 临时的开发笔记 → 移至 `WIP/`
- 测试相关文件 → 移至 `test/`

#### 删除原则
- 完全过时的技术文档
- 已被新文档完全替代的内容
- 临时的调试记录

---

## 📝 文档写作规范

### 标题层级
- `#` - 文档标题
- `##` - 主要章节
- `###` - 子章节
- `####` - 详细说明

### 代码块
````markdown
```typescript
// 带语言标识的代码块
const example = 'code';
```

```bash
# 命令行示例
npm run dev
```
````

### 链接引用
- 文档内链接: `[链接文字](./FILENAME.md)`
- 章节链接: `[链接文字](#章节标题)`
- 外部链接: `[链接文字](https://...)`

### 强调标记
- **重要内容**: 使用 `**加粗**`
- *次要强调*: 使用 `*斜体*`
- `代码片段`: 使用 `` `反引号` ``
- > 引用说明: 使用 `>` 引用块

---

## 🛠️ 开发者快速参考

### 常用命令

> **⚠️ 重要**: 本项目使用 **npm** 作为包管理器，所有命令必须使用 `npm`。

```bash
# 安装依赖（使用 npm）
npm install

# 启动开发环境
npm run dev

# 数据库迁移
cd apps/lago-server
npx prisma db push
npx tsx src/scripts/seed.ts

# 生成API代码
cd apps/lago-web
node scripts/generate-api.js

# 运行测试
npm test
```

### 关键路径
```
# 后端
apps/lago-server/
├── src/routes/        # API路由定义
├── src/schemas/       # 验证Schema (class-validator)
├── src/controllers/   # 控制器
├── src/services/      # 业务服务
└── prisma/schema.prisma # 数据库Schema

# 前端
apps/lago-web/
├── src/app/          # Next.js页面 (App Router)
├── src/components/   # 可复用组件
├── src/lib/apis/     # API调用（自动生成）
└── scripts/generate-api.js # API生成脚本
```

### 环境变量
```bash
# 必需
DATABASE_URL=          # PostgreSQL连接
JWT_SECRET=            # JWT密钥
AI_API_KEY=            # 通义千问API密钥

# 可选
REDIS_HOST=            # Redis主机
OSS_ACCESS_KEY_ID=     # 阿里云OSS / 腾讯云COS
VIRTUAL_NUMBER_API_KEY= # 虚拟号服务API密钥
```

---

## 📞 获取帮助

### 文档问题
- 如果文档不清楚或有错误，请在项目中提issue
- 如果需要补充文档，请参考现有文档格式

### 技术问题
1. 首先查阅对应的核心文档
2. 检查代码注释和类型定义
3. 查看相关的测试文件
4. 参考 `docs/WIP/` 中的最新总结

---

## 🎓 学习路径

### 新手入门
1. 阅读 [PRD.md](./PRD.md) - 了解产品定位
2. 阅读 [ARCHITECTURE.md](./ARCHITECTURE.md) - 了解项目结构
3. 阅读 [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 学习开发流程
4. 阅读 [FEATURES_BY_PAGE.md](./FEATURES_BY_PAGE.md) - 理解功能实现
5. 实践：开发一个简单功能

### 进阶开发
1. 深入理解 [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
2. 学习复杂功能的实现（商品系统、订单系统、AI系统）
3. 参与代码重构和性能优化

### 架构设计
1. 精通所有核心文档
2. 理解设计模式和最佳实践
3. 能够进行架构决策和技术选型

---

## 📊 文档统计

- **核心文档**: 6个
- **设计系统文档**: 3个（官网、后台、小程序）
- **参考文档**: 1个
- **总页数**: ~2000行
- **最后更新**: 2025-01-10

---

## 🔖 版本历史

### v3.1 (2025-01-10)
- **设计系统文档重组**: 将单一设计系统文档拆分为三个独立文档
  - `DESIGN_SYSTEM_WEBSITE.md` - 官网设计系统（PC + Mobile）
  - `DESIGN_SYSTEM_ADMIN.md` - 运营系统设计系统（PC Web）
  - `DESIGN_SYSTEM_MINIPROGRAM.md` - 小程序设计系统（微信小程序）
- 旧版设计系统文档移至 `archived/` 目录
- 更新文档导航和使用指南

### v3.0 (2025-01-10)
- 从 PiggyBank 迁移到 Lago 项目
- 更新所有文档为社区二手租售平台业务
- 统一技术栈和开发规范
- 重新整理文档结构

### v2.0 (2025-10-10)
- 重构文档结构
- 整理为5个核心文档
- 删除80%的重复和过时文档
- 创建统一的文档导航

### v1.0 (2025-09-15)
- 初始文档集
- 包含80+个文档
- 按功能和时间分散

---

**记住**: 这些核心文档是项目的知识库，请保持更新并遵循文档规范。

**最后更新**: 2025-01-10
