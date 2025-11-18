# Claude Code 使用指南 v2

> 基于 MECE 原则（相互独立，完全穷尽）重新组织的实用教程

---

## 目录

### [1. 快速入门](#1-快速入门)
- [1.1 什么是 Claude Code](#11-什么是-claude-code)
- [1.2 核心概念](#12-核心概念)
- [1.3 第一次使用](#13-第一次使用)
- [1.4 基础命令速查](#14-基础命令速查)

### [2. 核心功能](#2-核心功能)
- [2.1 文件操作](#21-文件操作)
- [2.2 会话管理](#22-会话管理)
- [2.3 记忆系统](#23-记忆系统)
- [2.4 命令执行](#24-命令执行)

### [3. 实战指南](#3-实战指南)
- [3.1 开发工作流](#31-开发工作流)
- [3.2 有效沟通技巧](#32-有效沟通技巧)
- [3.3 常见场景解决方案](#33-常见场景解决方案)

### [4. 进阶技能](#4-进阶技能)
- [4.1 自定义 Slash 命令](#41-自定义-slash-命令)
- [4.2 MCP 集成](#42-mcp-集成)
- [4.3 高级用法](#43-高级用法)

### [5. 参考资料](#5-参考资料)
- [5.1 命令完整列表](#51-命令完整列表)
- [5.2 快捷操作速查](#52-快捷操作速查)
- [5.3 常见问题 FAQ](#53-常见问题-faq)
- [5.4 学习路径](#54-学习路径)

---

# 1. 快速入门

## 1.1 什么是 Claude Code

Claude Code 是 Anthropic 官方推出的 AI 编程助手，可以：

✅ **理解代码库** - 自动分析项目结构和上下文
✅ **生成代码** - 根据需求编写高质量代码
✅ **调试问题** - 快速定位和修复 bug
✅ **执行命令** - 运行 git、npm、测试等
✅ **解释概念** - 讲解代码逻辑和最佳实践

**定位：** 你的 AI 结对编程伙伴

---

## 1.2 核心概念

### 工具（Tools）

Claude Code 通过工具与你的项目交互：

| 工具类型 | 功能 | 示例 |
|---------|------|------|
| **Read** | 读取文件 | 查看代码 |
| **Write** | 创建新文件 | 生成组件 |
| **Edit** | 修改现有文件 | 修复 bug |
| **Bash** | 执行命令 | 运行测试 |
| **Grep** | 搜索代码 | 查找函数 |
| **Glob** | 匹配文件 | 列出所有 .js 文件 |

### 上下文（Context）

- **项目上下文**: CLAUDE.md 中的项目规则
- **用户上下文**: ~/.claude/CLAUDE.md 中的个人偏好
- **对话上下文**: 当前会话的历史记录

### Agent（智能代理）

专门的子任务执行者：
- **Explore Agent**: 探索代码库
- **Plan Agent**: 制定实施计划
- **General Agent**: 处理复杂多步骤任务

---

## 1.3 第一次使用

### Step 1: 设置项目记忆

在项目根目录创建 `CLAUDE.md`：

```markdown
# Project: Todo App

## Tech Stack
- Next.js 16 (App Router)
- PostgreSQL + pg library
- Raw SQL (no ORM)

## Key Files
- API: app/api/todos/route.js
- UI: app/page.js
- DB: lib/db.js

## Coding Rules
- Use parameterized SQL queries ($1, $2)
- Client components need "use client"
- Import paths use @/ alias
```

### Step 2: 设置个人偏好

```bash
/memory user
```

添加你的偏好：

```markdown
## Coding Style
- Descriptive variable names
- Prefer clarity over brevity

## Background
- Coming from Python FastAPI + SQLAlchemy
- Learning Next.js + PostgreSQL
```

### Step 3: 第一个任务

```
@app/page.js
解释这个文件的主要功能
```

---

## 1.4 基础命令速查

| 命令 | 功能 | 何时使用 |
|------|------|---------|
| `/help` | 获取帮助 | 忘记命令时 |
| `/clear` | 清空对话 | 切换完全不同的任务 |
| `/compact` | 压缩历史 | 对话太长但想保留上下文 |
| `/rewind` | 回退状态 | 撤销错误操作 |
| `/memory user` | 用户设置 | 修改全局偏好 |
| `/memory project` | 项目设置 | 修改项目规则 |
| `/exit` | 退出 | 结束会话 |

**最常用的三个命令：**
1. `/compact` - 对话太长时
2. `/rewind` - 出错时撤销
3. `/memory project` - 记录项目规则

---

# 2. 核心功能

## 2.1 文件操作

### 2.1.1 引用文件（3 种方式）

**方式 1: @ 符号（推荐）**
```
@app/page.js 查看这个文件
```

**优势：** 自动补全、精确定位、支持多文件

**方式 2: 自然语言**
```
查看 app/api/todos/route.js 的 GET 方法
```

**优势：** 更灵活、可以指定范围

**方式 3: 批量引用**
```
@app/page.js @lib/db.js
这两个文件如何协作？
```

---

### 2.1.2 搜索与查找

**搜索代码内容：**
```
在项目中搜索所有使用 pool.query 的地方
```

**查找文件：**
```
找到所有的 route.js 文件
```

**模糊搜索：**
```
查找包含 "database" 或 "db" 的文件
```

---

### 2.1.3 读取文件

**完整读取：**
```
读取 app/page.js
```

**指定行范围：**
```
查看 app/page.js 的第 10-50 行
```

**读取多个文件：**
```
@app/page.js @app/layout.js
比较这两个文件的结构
```

---

### 2.1.4 编辑文件

**❌ 不好的指令：**
```
修改 app/page.js
```

**✅ 好的指令：**
```
在 app/page.js 的 handleSubmit 函数中，添加输入验证：
- 检查文本不为空
- 检查长度不超过 255 字符
- 显示错误提示
```

**只修改指定部分：**
```
在 route.js 的 GET 方法中添加分页，不要改动其他方法
```

---

### 2.1.5 创建文件

**明确说明创建新文件：**
```
创建一个新的 components/TodoItem.js 组件
```

**提供具体要求：**
```
创建 middleware.js 文件，用于：
- 验证用户身份
- 检查请求头中的 token
- 重定向未授权用户
```

---

## 2.2 会话管理

### 2.2.1 清空 vs 压缩

| 操作 | 命令 | 效果 | 何时使用 |
|------|------|------|---------|
| **清空** | `/clear` | 删除所有历史 | 切换完全不同的任务 |
| **压缩** | `/compact` | 保留摘要 | 对话长但想继续当前话题 |

**示例场景：**

```bash
# 场景 1: 完成了 API 开发，现在要做 UI
/clear  # 清空历史，重新开始

# 场景 2: API 开发对话很长，想继续但节省空间
/compact  # 压缩成摘要，继续开发
```

---

### 2.2.2 回退操作

**使用 /rewind 撤销：**

```bash
/rewind
```

**适用场景：**
- Claude 误删了代码
- 想尝试不同的实现方式
- 修改后发现不符合预期

**工作原理：**
- 回退到上一个关键状态
- 可以从那里重新选择方向
- 类似 git 的 reset

---

### 2.2.3 上下文管理技巧

**何时应该 /compact：**
- 系统提示"上下文即将用完"
- 对话超过 50 轮
- 响应速度明显变慢

**何时应该 /clear：**
- 从 API 开发切换到 UI 开发
- 完成一个功能，开始另一个
- 想让 Claude 忘记之前的假设

---

## 2.3 记忆系统

### 2.3.1 两级记忆结构

```
~/.claude/CLAUDE.md          ← 用户级（全局）
    ↓ 对所有项目生效

项目/CLAUDE.md               ← 项目级（局部）
    ↓ 只对当前项目生效

当前对话                     ← 会话级（临时）
    ↓ 结束后消失
```

---

### 2.3.2 用户级记忆（全局偏好）

**位置：** `~/.claude/CLAUDE.md`

**查看/编辑：**
```bash
/memory user
```

**适合存储的内容：**

```markdown
# Claude Code Memory/Preferences

## 编码风格
- 变量名使用驼峰命名
- 函数优先使用箭头函数
- 错误处理使用 try-catch

## 技术偏好
- React: 优先使用函数组件 + Hooks
- 数据库: 喜欢 PostgreSQL
- 风格: 代码清晰 > 简洁

## 学习背景
- 来自 Python FastAPI + SQLAlchemy
- 正在学习 Next.js + PostgreSQL
- 熟悉 RESTful API 设计

## 个人习惯
- 喜欢详细的代码注释
- 需要解释"为什么"而不只是"怎么做"
```

---

### 2.3.3 项目级记忆（项目规则）

**位置：** `项目根目录/CLAUDE.md`

**查看/编辑：**
```bash
/memory project
```

**适合存储的内容：**

```markdown
# Todo App - Project Rules

## 项目概述
Next.js 16 todo 应用，使用 App Router + PostgreSQL

## 技术栈
- Next.js 16.0.3
- React 19.2.0
- PostgreSQL + pg 8.16.3
- Raw SQL（不使用 ORM）

## 开发命令
\`\`\`bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
psql $DATABASE_URL -f db/schema.sql  # 重置数据库
\`\`\`

## 项目架构
- **Client Components**: app/page.js（需要 "use client"）
- **API Routes**: app/api/todos/route.js
- **Database**: lib/db.js（PostgreSQL 连接池）

## 编码规范
1. **SQL 安全**: 必须使用参数化查询（$1, $2）
2. **导入路径**: 使用 @/ 别名
3. **组件**: Client 组件需标记 "use client"
4. **环境变量**: 数据库使用 DATABASE_URL（不是 POSTGRES_URL）

## 常见问题
- Next.js 16 + Turbopack 可能导致 @/ 导入失败 → 使用相对路径
- DELETE 请求支持 query param 和 body 两种方式
- 所有 API 返回 JSON 格式

## 文件结构
\`\`\`
app/
  ├── page.js              # 主 UI（Client Component）
  ├── layout.js            # 根布局
  └── api/todos/route.js   # CRUD API
lib/
  └── db.js                # PostgreSQL 连接池
db/
  └── schema.sql           # 数据库 schema
\`\`\`
```

---

### 2.3.4 记忆系统最佳实践

**1. 及时记录项目规则**

每当遇到项目特有的规则，立即添加到 CLAUDE.md：

```
把刚才发现的"DATABASE_URL 而非 POSTGRES_URL"的问题
添加到项目的 CLAUDE.md 常见问题中
```

**2. 定期更新**

项目演进时同步更新：

```
我们现在改用 Drizzle ORM 了，更新 CLAUDE.md 的技术栈部分
```

**3. 分层存储**

| 信息类型 | 存储位置 |
|---------|---------|
| 个人编码风格 | 用户级 |
| 项目架构 | 项目级 |
| 当前任务上下文 | 会话级 |

---

## 2.4 命令执行

### 2.4.1 Bash 命令

**直接执行命令：**
```
运行 npm install
```

**查看结果：**
```
运行 git status 并告诉我有哪些改动
```

**复杂命令：**
```
运行测试并分析失败的原因：
npm test
```

---

### 2.4.2 Git 操作

**查看状态：**
```
git status
```

**查看差异：**
```
git diff
```

**创建提交（需明确要求）：**
```
创建一个 git commit，提交刚才的修改
```

**注意：** Claude 不会主动创建 commit，必须明确要求。

---

### 2.4.3 数据库操作

**查询数据：**
```
psql $DATABASE_URL -c "SELECT * FROM todos"
```

**重置数据库：**
```
psql $DATABASE_URL -f db/schema.sql
```

**检查连接：**
```
echo $DATABASE_URL
```

---

# 3. 实战指南

## 3.1 开发工作流

### 3.1.1 从需求到代码

**步骤 1: 描述需求**
```
我想添加一个"标记所有任务为完成"的功能
```

**步骤 2: 让 Claude 制定计划**
```
列出实现这个功能需要修改哪些文件，分几个步骤
```

**步骤 3: 逐步实现**
```
先实现 API 端点 PATCH /api/todos/complete-all
```

**步骤 4: 测试**
```
用 curl 测试新的 API：
curl -X PATCH http://localhost:3000/api/todos/complete-all
```

**步骤 5: 更新 UI**
```
在 app/page.js 中添加"完成全部"按钮
```

---

### 3.1.2 调试问题

**标准调试流程：**

**1. 描述现象**
```
点击删除按钮时，前端报 404 错误
```

**2. 提供错误信息**
```
控制台显示：
Error: Failed to fetch
  at handleDelete (page.js:42)
```

**3. 检查相关代码**
```
@app/page.js @app/api/todos/route.js
检查 DELETE 方法的实现
```

**4. 诊断问题**
```
分析为什么会返回 404
```

**5. 修复并验证**
```
修复问题后，用 curl 测试：
curl -X DELETE "http://localhost:3000/api/todos?id=1"
```

---

### 3.1.3 重构代码

**重构流程：**

**1. 分析现有代码**
```
@app/page.js
分析这个文件，找出可以提取为独立组件的部分
```

**2. 制定重构计划**
```
列出重构步骤，确保不破坏现有功能
```

**3. 逐步重构**
```
先提取 TodoItem 组件，保持功能不变
```

**4. 验证功能**
```
重构后运行 npm run dev，确保功能正常
```

---

## 3.2 有效沟通技巧

### 3.2.1 如何提问

**❌ 不好的问题：**
```
这个代码有问题
```

**✅ 好的问题：**
```
@app/page.js
handleSubmit 函数中，为什么即使输入为空也能提交？
应该如何添加验证？
```

---

**❌ 不好的问题：**
```
帮我改一下
```

**✅ 好的问题：**
```
@app/api/todos/route.js
GET 方法现在返回所有 todos，我想添加分页功能：
- 支持 ?page=1&limit=10 参数
- 默认每页 20 条
- 返回格式包含 data 和 total
```

---

### 3.2.2 如何描述需求

**提供具体的输入输出：**

```
实现搜索功能：

输入：用户在搜索框输入 "milk"
处理：调用 GET /api/todos?search=milk
输出：返回文本包含 "milk" 的 todos（不区分大小写）
```

**说明边界条件：**

```
添加输入验证：
- 任务文本不能为空（去除首尾空格后）
- 长度不超过 255 字符
- 显示友好的错误提示
```

---

### 3.2.3 如何报告错误

**完整的错误报告包含：**

1. **问题现象**
2. **错误信息**
3. **复现步骤**
4. **相关代码**

**示例：**

```
问题：运行 npm run dev 后，所有 API 请求都返回 500 错误

错误信息：
Error: connect ECONNREFUSED 127.0.0.1:5432
  at lib/db.js:5:12

复现步骤：
1. npm run dev
2. 访问 http://localhost:3000
3. 控制台报错

相关代码：
@lib/db.js

环境：
- macOS
- PostgreSQL 未启动

请帮忙诊断问题
```

---

## 3.3 常见场景解决方案

### 场景 1: 添加新功能

```
需求：添加"按完成状态筛选"功能

步骤：
1. API：支持 GET /api/todos?completed=true
2. UI：添加筛选按钮（全部/已完成/未完成）
3. 测试：curl 测试 API
4. 验证：在浏览器中测试 UI

请先实现 API 部分
```

---

### 场景 2: 修复 Bug

```
Bug：删除任务后，UI 没有更新

诊断步骤：
1. 检查 @app/page.js 的 handleDelete 函数
2. 确认 API 返回成功
3. 检查 setTasks 是否正确调用
4. 修复问题

请帮我诊断
```

---

### 场景 3: 性能优化

```
问题：任务列表有 1000 条时，页面很卡

优化方向：
1. 添加分页
2. 虚拟滚动
3. 懒加载

请先分析哪种方案最合适
```

---

### 场景 4: 代码审查

```
@app/api/todos/route.js
审查这个文件，检查：
- 安全漏洞（SQL 注入、XSS）
- 性能问题
- 代码风格
- 缺失的错误处理

提供具体的行号和建议
```

---

### 场景 5: 学习代码

```
@app/page.js
我是 Next.js 新手，请解释：
1. "use client" 的作用
2. useState 和 useEffect 的用途
3. fetch API 的工作原理
4. 为什么需要 try-catch

用简单的语言，最好有类比
```

---

# 4. 进阶技能

## 4.1 自定义 Slash 命令

### 4.1.1 命令基础

**位置：** `.claude/commands/命令名.md`

**执行：** `/命令名`

**工作原理：**
- 命令文件包含提示词
- 执行时，Claude 读取提示词并执行
- 类似宏或快捷方式

---

### 4.1.2 实用命令示例

**命令 1: 代码审查**

创建 `.claude/commands/review.md`：

```markdown
审查当前修改的代码，检查：

## 安全性
- SQL 注入漏洞
- XSS 攻击风险
- 敏感信息泄露

## 质量
- 代码重复
- 命名规范
- 错误处理完整性

## 性能
- N+1 查询
- 不必要的重渲染
- 内存泄漏风险

提供具体的文件名、行号和修改建议。
```

**使用：**
```bash
/review
```

---

**命令 2: 运行完整测试**

创建 `.claude/commands/test.md`：

```markdown
执行完整的测试流程：

1. 运行所有测试：npm test
2. 如果有失败：
   - 显示失败的测试用例
   - 分析失败原因
   - 提供修复建议
3. 修复后重新运行
4. 确保所有测试通过

显示每一步的执行结果。
```

**使用：**
```bash
/test
```

---

**命令 3: 重置开发环境**

创建 `.claude/commands/reset-dev.md`：

```markdown
重置开发环境到干净状态：

1. 停止开发服务器
2. 重置数据库：
   \`\`\`bash
   psql $DATABASE_URL -f db/schema.sql
   \`\`\`
3. 插入测试数据：
   \`\`\`sql
   INSERT INTO todos (text, completed) VALUES
     ('Sample task 1', false),
     ('Sample task 2', true);
   \`\`\`
4. 清除 node_modules 和重新安装：
   \`\`\`bash
   rm -rf node_modules
   npm install
   \`\`\`
5. 启动服务器：npm run dev

确认每一步都成功执行。
```

**使用：**
```bash
/reset-dev
```

---

**命令 4: 生成 API 文档**

创建 `.claude/commands/api-docs.md`：

```markdown
基于 app/api/todos/route.js，生成 API 文档：

对每个端点，包含：
- HTTP 方法和 URL
- 请求参数（query/body）
- 请求示例（curl）
- 响应格式（成功/失败）
- 状态码说明

格式使用 Markdown，可直接复制到 README.md。
```

**使用：**
```bash
/api-docs
```

---

### 4.1.3 命令设计最佳实践

**1. 明确单一职责**

❌ 不好：
```markdown
检查代码、运行测试、生成文档
```

✅ 好：分成三个命令
- `/review` - 代码审查
- `/test` - 运行测试
- `/docs` - 生成文档

---

**2. 提供清晰的步骤**

❌ 不好：
```markdown
修复所有问题
```

✅ 好：
```markdown
1. 识别问题
2. 逐个修复
3. 运行测试验证
4. 报告结果
```

---

**3. 包含验证步骤**

```markdown
1. 执行操作
2. 检查结果是否符合预期
3. 如果失败，提供诊断信息
```

---

## 4.2 MCP 集成

### 4.2.1 什么是 MCP

**MCP** = Model Context Protocol（模型上下文协议）

**作用：** 让 Claude 访问外部工具和数据源

**类比：** 类似浏览器扩展，给 Claude 增加新能力

---

### 4.2.2 可用的 MCP 工具

本项目已启用的 MCP 服务器：

| MCP 工具 | 功能 | 使用示例 |
|---------|------|---------|
| `mcp__mastra__mastraDocs` | Mastra.ai 文档 | 查询框架用法 |
| `mcp__mastra__mastraExamples` | Mastra.ai 示例 | 参考代码示例 |
| `mcp__mastra__mastraBlog` | Mastra.ai 博客 | 了解最新特性 |
| `mcp__mastra__mastraChanges` | 变更日志 | 追踪版本更新 |

---

### 4.2.3 MCP 使用示例

**查询文档：**
```
使用 mcp__mastra__mastraDocs 查找关于 agents 的文档
```

**查看示例代码：**
```
使用 mcp__mastra__mastraExamples 找一个 todo app 的例子
```

**追踪变更：**
```
使用 mcp__mastra__mastraChanges 查看最新版本的更新内容
```

---

## 4.3 高级用法

### 4.3.1 并行任务执行

当任务互不依赖时，要求并行执行以提高效率：

```
同时执行以下操作：
1. 读取 app/page.js
2. 读取 app/api/todos/route.js
3. 搜索所有使用 useState 的地方

这三个任务互不依赖，请并行执行
```

**效果：** 节省时间，一次返回所有结果

---

### 4.3.2 使用专用 Agent

**Explore Agent** - 探索代码库：

```
使用 Explore agent 分析整个项目：
- 找出所有的 API 端点
- 列出所有的 React 组件
- 识别数据流向

thoroughness: medium
```

**Plan Agent** - 制定计划：

```
使用 Plan agent 规划实现用户认证功能：
- 数据库设计
- API 端点
- 前端集成
- 安全考虑
```

---

### 4.3.3 Web 搜索集成

Claude Code 可以搜索网络获取最新信息：

```
搜索 Next.js 16 App Router 的最新最佳实践（2025年）
```

```
对比 Drizzle ORM 和 Prisma 的性能（最新数据）
```

**何时使用：**
- 需要最新的技术信息
- 对比多个方案
- 查找官方文档链接

---

### 4.3.4 批量文件操作

**批量读取：**
```
@app/**/*.js
读取 app 目录下所有 .js 文件，找出使用 fetch 的地方
```

**批量搜索：**
```
在所有 .js 文件中搜索 TODO 注释
```

**批量修改：**
```
在所有组件文件中，将 var 替换为 const
```

---

# 5. 参考资料

## 5.1 命令完整列表

### 会话控制

| 命令 | 功能 | 示例场景 |
|------|------|---------|
| `/help` | 显示帮助信息 | 忘记命令时 |
| `/clear` | 清空对话历史 | 切换任务 |
| `/compact` | 压缩对话历史 | 对话太长 |
| `/rewind` | 回退到之前状态 | 撤销错误 |
| `/exit` | 退出会话 | 结束工作 |

### 记忆管理

| 命令 | 功能 | 示例场景 |
|------|------|---------|
| `/memory user` | 查看/编辑用户设置 | 设置全局偏好 |
| `/memory project` | 查看/编辑项目设置 | 记录项目规则 |

### 项目管理

| 命令 | 功能 | 示例场景 |
|------|------|---------|
| `/init` | 初始化项目配置 | 新项目开始 |

---

## 5.2 快捷操作速查

### 文件引用

```bash
# 单个文件
@app/page.js

# 多个文件
@app/page.js @lib/db.js

# 通配符
@app/**/*.js

# 指定行范围
查看 app/page.js 的第 10-20 行
```

---

### 搜索模式

```bash
# 搜索代码
在项目中搜索 "pool.query"

# 查找文件
找到所有 route.js 文件

# 正则搜索
搜索匹配 /function\s+\w+/ 的代码
```

---

### 命令执行

```bash
# Git 操作
git status
git diff
git log --oneline -5

# 数据库操作
psql $DATABASE_URL -c "SELECT * FROM todos"
psql $DATABASE_URL -f db/schema.sql

# Node.js 操作
npm install
npm run dev
npm test

# 文件操作
ls -la
cat .env.local
```

---

### 常用指令模板

**查看文件：**
```
@文件路径 查看这个文件
```

**修改代码：**
```
在 [文件路径] 的 [函数名] 中，[具体修改内容]
```

**调试问题：**
```
[问题描述]
错误信息：[完整错误]
相关代码：@文件路径
请诊断问题
```

**运行测试：**
```
运行 [命令] 并分析结果
```

---

## 5.3 常见问题 FAQ

### Q1: Claude 没有读取文件怎么办？

**原因：** 文件路径不正确

**解决：**
```
# 使用 @ 符号
@app/page.js

# 或使用绝对路径
/Users/username/project/app/page.js
```

---

### Q2: 对话太长怎么办？

**选择 1: 压缩（保留上下文）**
```bash
/compact
```

**选择 2: 清空（重新开始）**
```bash
/clear
```

---

### Q3: Claude 修改错了代码如何撤销？

**方法 1: 使用 /rewind**
```bash
/rewind
```

**方法 2: 使用 git**
```bash
git diff          # 查看修改
git checkout .    # 撤销所有修改
```

---

### Q4: 如何让 Claude 记住项目规则？

**添加到项目 CLAUDE.md：**
```bash
/memory project

# 然后在文件中添加规则
```

---

### Q5: 如何提高 Claude 的准确度？

✅ **明确引用文件**
```
@app/page.js 的第 42 行
```

✅ **提供完整错误信息**
```
Error: Cannot find module '@/lib/db'
  at route.js:3:1
```

✅ **分步骤执行**
```
先实现 API，测试通过后再做 UI
```

✅ **记录项目规则**
```
在 CLAUDE.md 中记录特殊规则
```

---

### Q6: Claude 能自动创建 git commit 吗？

**不会自动创建，必须明确要求：**

```
创建一个 git commit，提交刚才的修改
```

Claude 会：
1. 运行 `git status` 查看改动
2. 运行 `git diff` 查看具体修改
3. 生成合适的 commit message
4. 执行 `git commit`

---

### Q7: 如何查看 Claude 做了哪些修改？

**方法 1: 要求总结**
```
总结你刚才做的所有文件修改
```

**方法 2: 使用 git**
```
git diff
git status
```

---

### Q8: 可以让 Claude 自动运行命令吗？

**是的，直接要求即可：**

```
运行 npm install 并告诉我结果
```

```
运行测试，如果失败则分析原因
```

---

## 5.4 学习路径

### 第 1 周：新手入门

**目标：** 掌握基础操作

- [ ] 设置 `CLAUDE.md`（用户级 + 项目级）
- [ ] 学会使用 `@` 引用文件
- [ ] 掌握基础命令（`/clear`, `/compact`, `/help`）
- [ ] 练习清晰描述需求

**练习任务：**
1. 让 Claude 解释现有代码
2. 修复一个简单的 bug
3. 添加一个小功能

---

### 第 2-3 周：进阶使用

**目标：** 提高效率

- [ ] 使用 `/memory` 管理偏好
- [ ] 创建第一个自定义 slash 命令
- [ ] 学会分步骤执行复杂任务
- [ ] 掌握调试工作流

**练习任务：**
1. 创建 `/review` 命令
2. 重构一个复杂组件
3. 优化一个性能问题

---

### 第 4+ 周：高级技能

**目标：** 深度定制

- [ ] 使用 MCP 集成外部工具
- [ ] 编写复杂的自动化命令
- [ ] 优化上下文使用策略
- [ ] 建立个人工作流模板

**练习任务：**
1. 集成项目特定的 MCP 工具
2. 建立完整的开发-测试-部署流程
3. 创建项目文档生成自动化

---

### 技能检查清单

**基础级（1 周）**
- [ ] 能用 `@` 引用文件
- [ ] 能清晰描述需求
- [ ] 能使用基础命令
- [ ] 能让 Claude 解释代码

**进阶级（3 周）**
- [ ] 能分步骤执行复杂任务
- [ ] 能调试和修复 bug
- [ ] 能重构代码
- [ ] 能创建自定义命令

**高级级（6 周+）**
- [ ] 能优化上下文使用
- [ ] 能设计工作流自动化
- [ ] 能集成外部工具
- [ ] 能指导其他人使用

---

## 5.5 资源链接

### 官方资源

- **官方文档**: https://code.claude.com/docs
- **问题反馈**: https://github.com/anthropics/claude-code/issues
- **更新日志**: https://code.claude.com/changelog

### 学习资源

- **Next.js 文档**: https://nextjs.org/docs
- **PostgreSQL 文档**: https://www.postgresql.org/docs
- **MDN Web Docs**: https://developer.mozilla.org

### 社区

- **Claude Code Discussions**: GitHub Discussions
- **Discord**: 官方 Discord 服务器

---

## 总结

### Claude Code 的核心价值

1. **上下文感知** - 理解整个项目，不是孤立的代码片段
2. **智能辅助** - 从需求到实现的全流程支持
3. **学习伴侣** - 不仅写代码，还解释原理
4. **效率工具** - 自动化重复性任务

---

### 三个最重要的技巧

**1. 清晰沟通**
```
❌ "帮我改一下"
✅ "在 app/page.js 的 handleSubmit 中添加输入验证"
```

**2. 善用记忆**
```
# 项目规则记录在 CLAUDE.md
# 避免重复解释相同的规则
```

**3. 分步执行**
```
# 复杂任务拆分成小步骤
# 每步验证后再继续
```

---

### 记住这个原则

> **越清晰的沟通 = 越好的结果**

Claude Code 是你的 AI 结对编程伙伴，不是读心术大师。提供清晰的上下文、具体的需求、完整的错误信息，你会得到最好的帮助。

---

**Happy Coding with Claude Code! 🚀**
