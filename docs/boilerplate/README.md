# 项目模板文档集

> **用途**: 这是项目模板文档集，用于新项目初始化时作为 Cursor 的全局上下文。  
> **使用方式**: 创建新项目时，将 `docs/boilerplate/` 目录下的所有文档复制到新项目的 `docs/` 目录，并更新项目名称和相关信息。

## 📚 文档结构

```
docs/
├── README.md                    # 文档导航（本文档）
├── PROJECT_STRUCTURE.md         # 项目结构说明
├── DEVELOPMENT_GUIDE.md         # 开发流程和规范
├── ARCHITECTURE.md              # 技术架构设计
├── API_DEVELOPMENT.md           # API开发规范
├── DATABASE_GUIDE.md           # 数据库设计指南
├── DESIGN_SYSTEM.md             # 设计系统分析 and 配置指南
└── .cursorrules                 # Cursor AI 规则
```

## 🚀 快速开始

### 1. 复制文档到新项目

```bash
# 在新项目根目录执行
cp -r path/to/boilerplate/docs/* docs/
```

### 2. 更新项目信息

在所有文档中替换以下占位符：
- `[PROJECT_NAME]` → 你的项目名称
- `[PROJECT_DESCRIPTION]` → 项目描述
- `[API_PREFIX]` → API路径前缀（如 `/api`）

### 3. 配置 Cursor

将 `.cursorrules` 文件放在项目根目录，Cursor 会自动读取作为上下文。

## 📋 文档说明

### 核心文档（必读）

1. **README.md** - 文档导航和快速参考
2. **PROJECT_STRUCTURE.md** - 项目目录结构和文件组织
3. **DEVELOPMENT_GUIDE.md** - 开发流程、规范和最佳实践
4. **ARCHITECTURE.md** - 技术栈选型和架构设计

### 专项文档（按需参考）

5. **API_DEVELOPMENT.md** - API开发详细规范（Swagger、验证、错误处理）
6. **DATABASE_GUIDE.md** - 数据库设计、迁移、索引策略
7. **DESIGN_SYSTEM.md** - 设计系统分析和配置指南（如何从项目文档提取设计系统）
8. **.cursorrules** - Cursor AI 行为规则和上下文优先级

## 🎯 核心原则

1. **使用 npm** - 所有项目必须使用 npm，不使用 pnpm 或 yarn
2. **TypeScript** - 所有代码必须使用 TypeScript
3. **文档驱动** - 先写文档，再写代码
4. **一致性** - 遵循统一的代码风格和项目结构
5. **可维护性** - 代码要清晰、可测试、可扩展

## 📝 使用建议

1. **项目初始化时**：完整阅读所有文档，了解项目结构
2. **开发新功能时**：参考 DEVELOPMENT_GUIDE.md 和 API_DEVELOPMENT.md
3. **遇到问题**：查看相关专项文档
4. **更新规范**：及时更新文档，保持文档与代码同步

---

**提示**: 这些文档是模板，需要根据实际项目进行调整和定制。

