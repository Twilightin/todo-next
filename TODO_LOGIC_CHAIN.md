# Todo App: 从 React 到全栈（完全新手指南）

> 假设你只懂 React，这篇文档手把手教你搭建后端

---

## 目录

**准备阶段：**
0. [环境准备与数据库设置](#0-环境准备与数据库设置)

**核心知识：**
1. [React 开发者的后端入门](#1-react-开发者的后端入门)
2. [数据库设计思维](#2-数据库设计思维)
3. [从零创建 API 路由](#3-从零创建-api-路由)

**实战开发：**
4. [实战准备：项目结构和数据库连接](#4-实战准备项目结构和数据库连接)
5. [CRUD 操作：后端 API + 前端 React 对照](#5-crud-操作后端-api--前端-react-对照)
6. [完整测试和调试](#6-完整测试和调试)

**进阶内容：**
7. [连接前端：React 完整代码参考](#7-连接前端react-完整代码参考)
8. [常见错误排查指南](#8-常见错误排查指南)
9. [数据库访问方式对比](#9-数据库访问方式对比)

---

## 0. 环境准备与数据库设置

> ⚠️ 这是最重要的基础步骤！跳过这步后面全部无法运行。

### Step 0.1: 安装 PostgreSQL

**检查是否已安装：**

打开终端，输入：
```bash
psql --version
```

**如果看到版本号（如 `psql (PostgreSQL) 14.x`），说明已安装，跳到 Step 0.2**

**如果提示 command not found，需要安装：**

```bash
# macOS
brew install postgresql@14

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Windows
# 下载安装包：https://www.postgresql.org/download/windows/
```

---

### Step 0.2: 启动 PostgreSQL

**macOS (Homebrew):**
```bash
# 启动 PostgreSQL 服务
brew services start postgresql@14

# 验证是否启动
brew services list | grep postgresql
# 应该显示 "started"
```

**Ubuntu/Debian:**
```bash
sudo service postgresql start

# 验证
sudo service postgresql status
```

**验证成功后，你会看到类似这样的输出：**
```
postgresql is running
```

---

### Step 0.3: 创建数据库

**Step 1: 连接到 PostgreSQL**

在终端输入：
```bash
psql postgres
```

你会看到提示符变成：
```
postgres=#
```

这说明你已经进入 PostgreSQL 命令行界面。

---

**Step 2: 创建数据库**

在 `postgres=#` 提示符下输入：
```sql
CREATE DATABASE todo_next;
```

你会看到：
```
CREATE DATABASE
```

---

**Step 3: 验证数据库已创建**

```sql
\l
```

你会看到数据库列表，包含 `todo_next`：
```
                              List of databases
   Name    |  Owner   | Encoding | Collate | Ctype |   Access privileges
-----------+----------+----------+---------+-------+-----------------------
 postgres  | postgres | UTF8     | C       | C     |
 todo_next | postgres | UTF8     | C       | C     |    ← 你的数据库
```

---

**Step 4: 退出 psql**

```sql
\q
```

回到普通终端提示符。

---

### Step 0.4: 创建数据库表（Schema）

**Step 1: 创建 schema 文件**

在你的项目根目录创建文件夹和文件：

```bash
# 在项目根目录
mkdir -p db
touch db/schema.sql
```

**Step 2: 编辑 schema.sql**

用编辑器打开 `db/schema.sql`，写入：

```sql
-- 删除旧表（如果存在）
DROP TABLE IF EXISTS todos;

-- 创建 todos 表
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 插入测试数据
INSERT INTO todos (text, completed) VALUES
  ('Buy milk', false),
  ('Walk dog', true),
  ('Learn Next.js', false);
```

**代码解释：**
- `DROP TABLE IF EXISTS` - 删除旧表（避免重复创建错误）
- `SERIAL` - 自动递增的 ID（1, 2, 3...）
- `VARCHAR(255)` - 最多 255 字符的文本
- `BOOLEAN` - true/false 值
- `DEFAULT` - 默认值
- `NOT NULL` - 不能为空
- `INSERT INTO` - 插入测试数据

---

**Step 3: 设置环境变量**

在项目根目录创建 `.env.local` 文件：

```bash
touch .env.local
```

写入数据库连接字符串：

```bash
DATABASE_URL=postgresql://localhost/todo_next
```

**格式解释：**
```
postgresql://用户名@主机/数据库名
```

对于本地开发，通常是：
```
postgresql://localhost/todo_next
```

---

**Step 4: 运行 schema，创建表**

在终端执行：

```bash
psql postgresql://localhost/todo_next -f db/schema.sql
```

**你会看到：**
```
DROP TABLE
CREATE TABLE
INSERT 0 3
```

这表示：
- 删除了旧表（如果存在）
- 创建了新表
- 插入了 3 条测试数据

---

**Step 5: 验证表已创建**

```bash
psql postgresql://localhost/todo_next
```

进入数据库后，输入：

```sql
\dt
```

你会看到：
```
         List of relations
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | todos | table | postgres
```

查看表结构：
```sql
\d todos
```

输出：
```
                                     Table "public.todos"
   Column   |            Type             | Collation | Nullable |              Default
------------+-----------------------------+-----------+----------+-----------------------------------
 id         | integer                     |           | not null | nextval('todos_id_seq'::regclass)
 text       | character varying(255)      |           | not null |
 completed  | boolean                     |           | not null | false
 created_at | timestamp without time zone |           | not null | CURRENT_TIMESTAMP
```

查看数据：
```sql
SELECT * FROM todos;
```

输出：
```
 id |      text      | completed |         created_at
----+----------------+-----------+----------------------------
  1 | Buy milk       | f         | 2025-01-17 10:00:00.123456
  2 | Walk dog       | t         | 2025-01-17 10:00:00.123456
  3 | Learn Next.js  | f         | 2025-01-17 10:00:00.123456
```

**看到这个，说明数据库设置成功！✅**

退出：
```sql
\q
```

---

### Step 0.5: 常用数据库操作命令

> 📌 以下命令在连接到数据库后使用

**连接到指定数据库：**

```bash
# 方式 1：直接连接
psql postgresql://localhost/todo_next

# 方式 2：先连接 postgres，再切换
psql postgres
\c todo_next
```

**成功连接后，你会看到：**
```
You are now connected to database "todo_next" as user "postgres".
todo_next=#
```

---

**查看数据库列表：**

```sql
\l
```

输出示例：
```
   Name    |  Owner   | Encoding
-----------+----------+----------
 postgres  | postgres | UTF8
 todo_next | postgres | UTF8      ← 你的数据库
```

---

**查看表列表：**

```sql
\dt
```

输出：
```
 Schema | Name  | Type  |  Owner
--------+-------+-------+----------
 public | todos | table | postgres
```

---

**查看表结构（包含列和数据类型）：**

```sql
\d todos
```

输出：
```
                                     Table "public.todos"
   Column   |            Type             | Nullable |              Default
------------+-----------------------------+----------+-----------------------------------
 id         | integer                     | not null | nextval('todos_id_seq'::regclass)
 text       | character varying(255)      | not null |
 completed  | boolean                     | not null | false
 created_at | timestamp without time zone | not null | CURRENT_TIMESTAMP
```

---

**查询数据（SELECT）：**

```sql
-- 查询所有数据
SELECT * FROM todos;

-- 查询特定字段
SELECT id, text FROM todos;

-- 条件查询
SELECT * FROM todos WHERE completed = true;

-- 按 id 排序
SELECT * FROM todos ORDER BY id DESC;

-- 限制返回数量
SELECT * FROM todos LIMIT 5;
```

输出示例：
```
 id |      text      | completed |         created_at
----+----------------+-----------+----------------------------
  1 | Buy milk       | f         | 2025-01-17 10:00:00.123456
  2 | Walk dog       | t         | 2025-01-17 10:00:00.123456
  3 | Learn Next.js  | f         | 2025-01-17 10:00:00.123456
```

---

**插入数据（INSERT）：**

```sql
-- 插入单条数据
INSERT INTO todos (text, completed)
VALUES ('New task', false);

-- 插入并返回结果
INSERT INTO todos (text, completed)
VALUES ('Another task', false)
RETURNING *;
```

输出：
```
 id |     text      | completed |         created_at
----+---------------+-----------+----------------------------
  4 | Another task  | f         | 2025-01-17 15:30:00.123456
```

---

**更新数据（UPDATE）：**

```sql
-- 更新单个字段
UPDATE todos SET completed = true WHERE id = 1;

-- 更新多个字段
UPDATE todos SET text = 'Updated task', completed = true WHERE id = 2;

-- 更新并返回结果
UPDATE todos SET completed = true WHERE id = 3 RETURNING *;
```

输出：
```
UPDATE 1
```

或者（使用 RETURNING）：
```
 id |      text      | completed |         created_at
----+----------------+-----------+----------------------------
  3 | Learn Next.js  | t         | 2025-01-17 10:00:00.123456
```

---

**删除数据（DELETE）：**

```sql
-- 删除特定行
DELETE FROM todos WHERE id = 4;

-- 删除所有已完成的 todos
DELETE FROM todos WHERE completed = true;

-- 删除所有数据（谨慎！）
DELETE FROM todos;

-- 删除并返回被删除的数据
DELETE FROM todos WHERE id = 5 RETURNING *;
```

---

**统计和聚合：**

```sql
-- 统计总数
SELECT COUNT(*) FROM todos;

-- 统计已完成的数量
SELECT COUNT(*) FROM todos WHERE completed = true;

-- 按完成状态分组统计
SELECT completed, COUNT(*) FROM todos GROUP BY completed;
```

输出：
```
 completed | count
-----------+-------
 f         |     2
 t         |     1
```

---

**其他有用命令：**

```sql
-- 查看当前数据库
SELECT current_database();

-- 查看当前用户
SELECT current_user;

-- 查看 PostgreSQL 版本
SELECT version();

-- 清屏（在 psql 中）
\! clear

-- 退出 psql
\q
```

---

**实用技巧：**

**1. 美化输出（切换显示格式）：**

```sql
-- 切换到扩展显示（每列一行）
\x

-- 再次运行查询
SELECT * FROM todos;

-- 关闭扩展显示
\x
```

**2. 执行 SQL 文件：**

```bash
# 在终端执行（不进入 psql）
psql postgresql://localhost/todo_next -f db/schema.sql

# 在 psql 内执行
\i db/schema.sql
```

**3. 导出查询结果到文件：**

```sql
-- 导出为 CSV
\copy (SELECT * FROM todos) TO 'todos.csv' CSV HEADER;
```

**4. 查看命令历史：**

在 psql 中，按 ↑ 键可以查看之前执行的命令。

---

**完整示例：查看和修改数据**

```bash
# 📺 终端：连接数据库
psql postgresql://localhost/todo_next
```

```sql
-- 查看所有数据
SELECT * FROM todos;

-- 添加新任务
INSERT INTO todos (text, completed) VALUES ('Test task', false) RETURNING *;

-- 查看刚添加的任务
SELECT * FROM todos WHERE text = 'Test task';

-- 标记为已完成
UPDATE todos SET completed = true WHERE text = 'Test task' RETURNING *;

-- 删除测试任务
DELETE FROM todos WHERE text = 'Test task';

-- 验证删除
SELECT * FROM todos;

-- 退出
\q
```

---

## 1. React 开发者的后端入门

### 后端 = 持久化的 useState

**React 中你熟悉的代码：**
```javascript
const [todos, setTodos] = useState([
  { id: 1, text: "Buy milk", completed: false }
]);

// 添加
setTodos([...todos, newTodo]);

// 更新
setTodos(todos.map(t => t.id === id ? {...t, completed: true} : t));

// 删除
setTodos(todos.filter(t => t.id !== id));
```

**问题：刷新页面，数据消失！**

---

### 后端的作用

| React | 后端 | 说明 |
|-------|------|------|
| `useState` | PostgreSQL 数据库 | 永久存储 |
| `setTodos([...])` | `POST /api/todos` | 添加数据 |
| `todos.map(...)` | `PATCH /api/todos` | 更新数据 |
| `todos.filter(...)` | `DELETE /api/todos` | 删除数据 |
| `useEffect + fetch` | `GET /api/todos` | 获取数据 |

**核心：** 后端让数据永久保存，不会因为刷新页面而丢失。

---

## 2. 数据库设计思维

### 从 React State 到数据库表

**React State（内存中，临时）：**
```javascript
[
  { id: 1, text: "Buy milk", completed: false },
  { id: 2, text: "Walk dog", completed: true }
]
```

**数据库表（硬盘中，永久）：**
```
todos 表
┌────┬─────────────┬───────────┬─────────────────────┐
│ id │ text        │ completed │ created_at          │
├────┼─────────────┼───────────┼─────────────────────┤
│ 1  │ Buy milk    │ false     │ 2025-01-17 10:00:00 │
│ 2  │ Walk dog    │ true      │ 2025-01-17 10:05:00 │
└────┴─────────────┴───────────┴─────────────────────┘
```

**字段设计：**
- `id` - 唯一标识（就像 React 的 key）
- `text` - 任务内容
- `completed` - 是否完成
- `created_at` - 创建时间（额外信息）

---

## 3. 从零创建 API 路由

### 什么是 API 路由？

**在 React 中调用函数：**
```javascript
const result = addTodo("Buy milk");
```

**在全栈应用中调用 API：**
```javascript
const result = await fetch("/api/todos", {
  method: "POST",
  body: JSON.stringify({ text: "Buy milk" })
});
```

**API 路由 = 可以通过 HTTP 调用的后端函数**

---

### Next.js API 路由结构

在 Next.js 中，API 路由文件位置决定了 URL：

```
项目结构                      对应的 URL
app/
  └── api/
      └── todos/
          └── route.js        →  /api/todos
```

**route.js 的作用：**
- 导出 GET 函数 → 处理 GET 请求
- 导出 POST 函数 → 处理 POST 请求
- 导出 PATCH 函数 → 处理 PATCH 请求
- 导出 DELETE 函数 → 处理 DELETE 请求

---

## 4. 实战准备：项目结构和数据库连接

### Step 4.1: 创建项目文件夹

在项目根目录，创建必要的文件夹：

```bash
mkdir -p app/api/todos
mkdir -p lib
```

**你的项目结构应该是：**
```
todo-next/
├── app/
│   ├── page.js          ← React 前端组件
│   └── api/
│       └── todos/
│           └── route.js  ← API 后端路由
├── lib/
│   └── db.js            ← 数据库连接
├── db/
│   └── schema.sql       ← 已创建
└── .env.local           ← 已创建
```

---

### Step 4.2: 创建数据库连接文件

**创建 `lib/db.js`：**

```bash
touch lib/db.js
```

**编辑 `lib/db.js`，写入以下代码：**

```javascript
// lib/db.js
import pg from 'pg';

const { Pool } = pg;

// 创建数据库连接池
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 测试连接
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

export default pool;
```

**代码解释：**
- `pg` - PostgreSQL 客户端库
- `Pool` - 连接池，管理多个数据库连接
- `process.env.DATABASE_URL` - 从 `.env.local` 读取数据库地址
- `export default pool` - 导出给其他文件使用

---

### Step 4.3: 安装 pg 库

在终端执行：

```bash
npm install pg
```

你会看到：
```
added 1 package
```

---

### Step 4.4: 启动开发服务器

**📺 终端 1（服务器窗口）：**

启动 Next.js 开发服务器：
```bash
npm run dev
```

你会看到：
```
✓ Ready in 2.3s
✓ Local: http://localhost:3000
✅ Connected to PostgreSQL database  ← 数据库连接成功
```

**保持这个终端窗口运行，不要关闭！**

接下来我们会创建 API 和 React 代码。

---

## 5. CRUD 操作：后端 API + 前端 React 对照

> 📌 以下每个操作都会展示后端 API 代码和前端 React 代码，方便你对照学习

### 5.1: GET（读取）- 获取所有 todos

#### 🔧 后端 API 代码

**创建 `app/api/todos/route.js`（如果还没创建）：**

```bash
touch app/api/todos/route.js
```

**在 `app/api/todos/route.js` 中写入 GET 函数：**

```javascript
// app/api/todos/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db.js";

// ========================================
// GET /api/todos - 获取所有 todos
// ========================================
export async function GET(req) {
  try {
    // 1. 查询数据库
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"
    );

    // 2. 返回 JSON
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**代码解释：**
```javascript
pool.query("SELECT * FROM todos ORDER BY id ASC")
// 从数据库查询所有 todos，按 id 升序排列

return NextResponse.json(result.rows);
// 返回查询结果（数组格式）
```

---

#### 🎨 前端 React 代码

**在 `app/page.js` 中对应的代码：**

```javascript
// app/page.js
"use client";

import { useState, useEffect } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);

  // ========================================
  // 加载所有 todos（对应后端 GET）
  // ========================================
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      // 1. 调用后端 GET API
      const response = await fetch("/api/todos");

      // 2. 解析 JSON
      const data = await response.json();

      // 3. 更新状态
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  }

  return (
    <div>
      <h1>Todo List</h1>
      {/* UI 代码在下面的小节展示 */}
    </div>
  );
}
```

**代码解释：**
```javascript
useEffect(() => { fetchTodos(); }, []);
// 组件加载时自动调用 fetchTodos()

const response = await fetch("/api/todos");
// 调用后端 GET /api/todos API

setTodos(data);
// 将后端返回的数据保存到 React state
```

---

#### 📺 测试 GET 操作

**终端 2（测试窗口）：**

```bash
curl http://localhost:3000/api/todos | jq
```

**期望输出：**
```json
[
  {
    "id": 1,
    "text": "Buy milk",
    "completed": false,
    "created_at": "2025-01-17T10:00:00.000Z"
  },
  {
    "id": 2,
    "text": "Walk dog",
    "completed": true,
    "created_at": "2025-01-17T10:05:00.000Z"
  }
]
```

---

### 5.2: POST（创建）- 添加新 todo

#### 🔧 后端 API 代码

**在 `app/api/todos/route.js` 中添加 POST 函数：**

```javascript
// ========================================
// POST /api/todos - 创建新 todo
// ========================================
export async function POST(req) {
  try {
    // 1. 获取请求体
    const body = await req.json();
    const text = (body?.text || "").toString().trim();

    // 2. 验证输入
    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    // 3. 插入数据库
    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text, false]
    );

    // 4. 返回新创建的 todo
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**代码解释：**
```javascript
const body = await req.json();
// 解析 JSON 请求体

const result = await pool.query(
  "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
  [text, false]
);
// 插入新 todo 到数据库，并返回新插入的数据
// RETURNING * 让 PostgreSQL 返回新创建的行
```

---

#### 🎨 前端 React 代码

**在 `app/page.js` 中添加对应的函数和 UI：**

```javascript
export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  // ... fetchTodos() 函数（上面已定义）

  // ========================================
  // 创建新 todo（对应后端 POST）
  // ========================================
  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      // 1. 调用后端 POST API
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      // 2. 获取新创建的 todo
      const newTodo = await response.json();

      // 3. 更新本地状态
      setTodos([...todos, newTodo]);

      // 4. 清空输入框
      setInputText("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo List</h1>

      {/* ========= 表单：添加新 todo ========= */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {/* todos 列表在下面的小节展示 */}
    </div>
  );
}
```

**代码解释：**
```javascript
fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: inputText })
})
// 发送 POST 请求到后端，携带 JSON 数据 { text: "..." }

setTodos([...todos, newTodo]);
// 将后端返回的新 todo 添加到本地 state
```

---

#### 📺 测试 POST 操作

**终端 2：**

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Learn full-stack"}'
```

**期望输出：**
```json
{
  "id": 4,
  "text": "Learn full-stack",
  "completed": false,
  "created_at": "2025-01-17T14:30:00.000Z"
}
```

**验证：查看所有 todos**
```bash
curl http://localhost:3000/api/todos | jq
```

---

### 5.3: PATCH（更新）- 切换 completed 状态

#### 🔧 后端 API 代码

**在 `app/api/todos/route.js` 中添加 PATCH 函数：**

```javascript
// ========================================
// PATCH /api/todos - 更新 todo
// ========================================
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, completed, text } = body;

    // 验证 id
    if (id == null) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 动态构建更新查询
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (typeof text === "string") {
      updates.push(`text = $${paramCount++}`);
      values.push(text);
    }

    if (typeof completed === "boolean") {
      updates.push(`completed = $${paramCount++}`);
      values.push(completed);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // 添加 id 到参数
    values.push(id);

    // 执行更新
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**代码解释：**
```javascript
// 动态构建 SQL 查询
// 如果只传 { id: 1, completed: true }
query = "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *"
values = [true, 1]

// 如果传 { id: 1, text: "New text", completed: true }
query = "UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *"
values = ["New text", true, 1]
```

---

#### 🎨 前端 React 代码

**在 `app/page.js` 中添加：**

```javascript
export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  // ... fetchTodos() 和 handleSubmit() 函数（上面已定义）

  // ========================================
  // 切换完成状态（对应后端 PATCH）
  // ========================================
  async function handleToggle(id, completed) {
    try {
      // 1. 调用后端 PATCH API
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed })
      });

      // 2. 获取更新后的 todo
      const updatedTodo = await response.json();

      // 3. 更新本地状态
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo List</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {/* ========= 列表：显示和切换 todos ========= */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id, todo.completed)}
            />
            <span style={{
              textDecoration: todo.completed ? "line-through" : "none"
            }}>
              {todo.text}
            </span>
            {/* 删除按钮在下一节 */}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**代码解释：**
```javascript
body: JSON.stringify({ id, completed: !completed })
// 发送更新请求：将 completed 取反（true → false 或 false → true）

setTodos(todos.map(t => t.id === id ? updatedTodo : t));
// 更新本地 state：用后端返回的新数据替换对应 id 的 todo
```

---

#### 📺 测试 PATCH 操作

**终端 2：**

```bash
# 标记 id=1 为已完成
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}'
```

**期望输出：**
```json
{
  "id": 1,
  "text": "Buy milk",
  "completed": true,
  "created_at": "2025-01-17T10:00:00.000Z"
}
```

---

### 5.4: DELETE（删除）- 删除 todo

#### 🔧 后端 API 代码

**在 `app/api/todos/route.js` 中添加 DELETE 函数：**

```javascript
// ========================================
// DELETE /api/todos - 删除 todo
// ========================================
export async function DELETE(req) {
  try {
    // 从 URL 查询参数获取 id
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // 验证 id
    if (idParam == null) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 删除
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [idParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**代码解释：**
```javascript
const { searchParams } = new URL(req.url);
// 解析 URL：http://localhost:3000/api/todos?id=1

const idParam = searchParams.get("id");
// 获取查询参数 ?id=1 中的 id 值

const result = await pool.query(
  "DELETE FROM todos WHERE id = $1 RETURNING *",
  [idParam]
);
// 删除 id 匹配的行，并返回被删除的数据
```

---

#### 🎨 前端 React 代码（完整版）

**`app/page.js` 的完整代码：**

```javascript
// app/page.js
"use client";

import { useState, useEffect } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  // 1️⃣ GET - 加载所有 todos
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  }

  // 2️⃣ POST - 创建新 todo
  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInputText("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  // 3️⃣ PATCH - 切换完成状态
  async function handleToggle(id, completed) {
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed })
      });

      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  }

  // ========================================
  // 4️⃣ DELETE - 删除 todo（对应后端 DELETE）
  // ========================================
  async function handleDelete(id) {
    try {
      // 1. 调用后端 DELETE API
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE"
      });

      // 2. 检查是否成功
      if (response.ok) {
        // 3. 从本地 state 中移除
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo List</h1>

      {/* 表单：添加新 todo */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {/* 列表：显示、切换、删除 todos */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id, todo.completed)}
            />
            <span style={{
              textDecoration: todo.completed ? "line-through" : "none"
            }}>
              {todo.text}
            </span>
            {/* ========= 删除按钮 ========= */}
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**代码解释：**
```javascript
const response = await fetch(`/api/todos?id=${id}`, {
  method: "DELETE"
});
// 发送 DELETE 请求到 /api/todos?id=1

setTodos(todos.filter(t => t.id !== id));
// 从本地 state 中移除被删除的 todo
```

---

#### 📺 测试 DELETE 操作

**终端 2：**

```bash
# 删除 id=4
curl -X DELETE "http://localhost:3000/api/todos?id=4"
```

**期望输出：**
```json
{
  "success": true,
  "deleted": {
    "id": 4,
    "text": "Learn full-stack",
    "completed": false,
    "created_at": "2025-01-17T14:30:00.000Z"
  }
}
```

**验证：查看所有 todos**
```bash
curl http://localhost:3000/api/todos | jq
```

---

### 5.5: 数据流总结

**完整的数据流（以创建 todo 为例）：**

```
1. 用户在浏览器输入 "Buy milk" 并点击 "Add"
   ↓
2. React handleSubmit() 被触发
   ↓
3. fetch("/api/todos", { method: "POST", body: ... })
   ↓
4. Next.js 路由到 POST 函数（app/api/todos/route.js）
   ↓
5. pool.query("INSERT INTO todos ...")
   ↓
6. PostgreSQL 插入数据，生成 id=4
   ↓
7. RETURNING * 返回新创建的 todo
   ↓
8. NextResponse.json(result.rows[0], { status: 201 })
   ↓
9. React 接收响应：{ id: 4, text: "Buy milk", completed: false }
   ↓
10. setTodos([...todos, newTodo])
   ↓
11. React 重新渲染，用户看到新 todo 出现在列表中
```

---

## 6. 完整测试和调试

### 6.1: 完整的 route.js 文件

**你的 `app/api/todos/route.js` 完整代码应该包含所有 4 个 CRUD 函数：**

```javascript
// app/api/todos/route.js
import { NextResponse } from "next/server";
import pool from "@/lib/db.js";

// GET /api/todos - 获取所有 todos
export async function GET(req) {
  try {
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/todos - 创建新 todo
export async function POST(req) {
  try {
    const body = await req.json();
    const text = (body?.text || "").toString().trim();

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text, false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/todos - 更新 todo
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, completed, text } = body;

    if (id == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (typeof text === "string") {
      updates.push(`text = $${paramCount++}`);
      values.push(text);
    }

    if (typeof completed === "boolean") {
      updates.push(`completed = $${paramCount++}`);
      values.push(completed);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/todos - 删除 todo
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (idParam == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [idParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### 6.2: 完整测试流程（从零开始）

**📺 终端 1：** 确保服务器在运行
```bash
npm run dev
```

**📺 终端 2：** 运行以下测试命令

---

**测试 1: 重置数据库**

```bash
psql postgresql://localhost/todo_next -f db/schema.sql
```

输出：
```
DROP TABLE
CREATE TABLE
INSERT 0 3
```

---

**测试 2: GET - 确认初始数据**

```bash
curl http://localhost:3000/api/todos | jq
```

应该看到 3 个初始 todos。

---

**测试 3: POST - 创建新 todo**

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Task 4"}'
```

输出应包含 `"id": 4`。

---

**测试 4: POST - 再创建一个**

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Task 5"}'
```

输出应包含 `"id": 5`。

---

**测试 5: GET - 查看所有 todos**

```bash
curl http://localhost:3000/api/todos | jq
```

应该看到 5 个 todos（3 个初始 + 2 个新建）。

---

**测试 6: PATCH - 更新 todo**

标记 id=1 为已完成：
```bash
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}'
```

输出中 `completed` 应该是 `true`。

---

**测试 7: GET - 验证更新**

```bash
curl http://localhost:3000/api/todos | jq
```

检查 id=1 的 `completed` 是否为 `true`。

---

**测试 8: DELETE - 删除 todo**

删除 id=5：
```bash
curl -X DELETE "http://localhost:3000/api/todos?id=5"
```

输出应显示 `"success": true` 和被删除的数据。

---

**测试 9: GET - 最终验证**

```bash
curl http://localhost:3000/api/todos | jq
```

应该只剩 4 个 todos（id=5 已删除）。

---

### 6.3: 自动化测试脚本

**创建 `test-api.sh`：**

```bash
#!/bin/bash

echo "=== 1. 重置数据库 ==="
psql postgresql://localhost/todo_next -f db/schema.sql

echo -e "\n=== 2. GET - 获取所有 todos ==="
curl http://localhost:3000/api/todos | jq

echo -e "\n=== 3. POST - 创建 todo ==="
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Task 4"}' | jq

echo -e "\n=== 4. PATCH - 更新 todo ==="
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}' | jq

echo -e "\n=== 5. DELETE - 删除 todo ==="
curl -X DELETE "http://localhost:3000/api/todos?id=4" | jq

echo -e "\n=== 6. GET - 最终结果 ==="
curl http://localhost:3000/api/todos | jq
```

**运行脚本：**
```bash
chmod +x test-api.sh
./test-api.sh
```

---

### 6.4: 在浏览器中测试

**打开浏览器访问：**
```
http://localhost:3000
```

你应该看到：
1. 一个输入框和 "Add" 按钮
2. 一个 todo 列表，包含复选框和删除按钮

**尝试操作：**
- ✅ 添加新 todo → 应该立即出现在列表中
- ✅ 点击复选框 → 文本应该显示删除线
- ✅ 点击删除按钮 → todo 应该从列表中消失
- ✅ 刷新页面 → 所有数据依然存在（因为保存在数据库中）

---

### 6.5: 调试技巧

**1. 查看服务器日志**

📺 终端 1（服务器窗口）会显示所有错误和日志：

```
GET /api/todos 200 in 15ms
POST /api/todos 201 in 23ms
PATCH /api/todos 200 in 18ms
DELETE /api/todos?id=4 200 in 20ms
```

**2. 查看数据库数据**

```bash
psql postgresql://localhost/todo_next
```

```sql
-- 查看所有数据
SELECT * FROM todos;

-- 按完成状态分组统计
SELECT completed, COUNT(*) FROM todos GROUP BY completed;

-- 退出
\q
```

**3. 检查环境变量**

```bash
cat .env.local
```

应该包含：
```
DATABASE_URL=postgresql://localhost/todo_next
```

**4. 使用浏览器开发者工具**

按 `F12` 或 `Cmd+Option+I`（Mac），切换到 Network 标签：
- 查看每个 API 请求的详细信息
- 检查请求头、请求体、响应数据
- 查看响应状态码（200, 201, 400, 404, 500）

**5. 添加 console.log 调试**

在 React 代码中：
```javascript
async function handleSubmit(e) {
  e.preventDefault();
  console.log("提交的文本:", inputText);

  const response = await fetch("/api/todos", {...});
  const newTodo = await response.json();
  console.log("后端返回的数据:", newTodo);

  setTodos([...todos, newTodo]);
}
```

在 API 代码中：
```javascript
export async function POST(req) {
  const body = await req.json();
  console.log("收到的请求体:", body);

  const result = await pool.query(...);
  console.log("数据库返回:", result.rows[0]);

  return NextResponse.json(result.rows[0], { status: 201 });
}
```

---

## 7. 连接前端：React 完整代码参考

> 📌 这里展示完整的 React 组件代码（已在第 5 节展示过）

**`app/page.js` 完整代码：**

```javascript
// app/page.js
"use client";

import { useState, useEffect } from "react";

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [inputText, setInputText] = useState("");

  // 1️⃣ GET - 加载所有 todos
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  }

  // 2️⃣ POST - 创建新 todo
  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText })
      });

      const newTodo = await response.json();
      setTodos([...todos, newTodo]);
      setInputText("");
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  }

  // 3️⃣ PATCH - 切换完成状态
  async function handleToggle(id, completed) {
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed })
      });

      const updatedTodo = await response.json();
      setTodos(todos.map(t => t.id === id ? updatedTodo : t));
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    }
  }

  // 4️⃣ DELETE - 删除 todo
  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Todo List</h1>

      {/* 表单：添加新 todo */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add new todo..."
        />
        <button type="submit">Add</button>
      </form>

      {/* 列表：显示、切换、删除 todos */}
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggle(todo.id, todo.completed)}
            />
            <span style={{
              textDecoration: todo.completed ? "line-through" : "none"
            }}>
              {todo.text}
            </span>
            <button onClick={() => handleDelete(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### CRUD 操作与数据流对照表

| 操作 | 前端函数 | 后端 API | 数据库 SQL | 数据流 |
|------|----------|----------|------------|--------|
| **读取** | `fetchTodos()` | `GET /api/todos` | `SELECT * FROM todos` | DB → API → React State → UI |
| **创建** | `handleSubmit()` | `POST /api/todos` | `INSERT INTO todos` | UI → React → API → DB → API → React State → UI |
| **更新** | `handleToggle()` | `PATCH /api/todos` | `UPDATE todos SET` | UI → React → API → DB → API → React State → UI |
| **删除** | `handleDelete()` | `DELETE /api/todos` | `DELETE FROM todos` | UI → React → API → DB → React State → UI |

---

### 完整数据流示例（创建 todo）

```
1. 用户在浏览器输入 "Buy milk" 并点击 "Add"
   ↓
2. React handleSubmit() 被触发
   ↓
3. fetch("/api/todos", { method: "POST", body: JSON.stringify({ text: "Buy milk" }) })
   ↓
4. Next.js 路由到 POST 函数（app/api/todos/route.js）
   ↓
5. pool.query("INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *", ["Buy milk", false])
   ↓
6. PostgreSQL 执行插入，生成 id=4
   ↓
7. RETURNING * 返回新创建的行：{ id: 4, text: "Buy milk", completed: false, created_at: "..." }
   ↓
8. NextResponse.json(result.rows[0], { status: 201 })
   ↓
9. React 接收响应：{ id: 4, text: "Buy milk", completed: false, created_at: "..." }
   ↓
10. setTodos([...todos, newTodo])
   ↓
11. React 重新渲染，用户看到新 todo 出现在列表中
```

---

## 8. 常见错误排查指南

### 错误 1: Connection refused

```bash
curl: (7) Failed to connect to localhost port 3000: Connection refused
```

**原因：** Next.js 服务器没有运行

**解决：**
```bash
# 在终端 1
npm run dev
```

---

### 错误 2: connect ECONNREFUSED 127.0.0.1:5432

```json
{"error": "connect ECONNREFUSED 127.0.0.1:5432"}
```

**原因：** PostgreSQL 数据库没有启动

**解决：**
```bash
# macOS
brew services start postgresql@14

# 验证
brew services list | grep postgresql
```

---

### 错误 3: database "todo_next" does not exist

**原因：** 数据库未创建

**解决：**
```bash
psql postgres
```

然后：
```sql
CREATE DATABASE todo_next;
\q
```

---

### 错误 4: relation "todos" does not exist

**原因：** 表未创建

**解决：**
```bash
psql postgresql://localhost/todo_next -f db/schema.sql
```

---

### 错误 5: Cannot find module 'pg'

**原因：** pg 库未安装

**解决：**
```bash
npm install pg
```

---

### 错误 6: 400 Bad Request - "text is required"

**原因：** POST 请求缺少 text 字段

**检查：**
```bash
# 确保 -d 参数格式正确
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Your task here"}'
```

---

### 调试技巧

**1. 查看服务器日志**

📺 终端 1（服务器窗口）会显示所有错误和日志。

**2. 查看数据库**

```bash
psql postgresql://localhost/todo_next
```

```sql
SELECT * FROM todos;
```

**3. 检查环境变量**

```bash
cat .env.local
```

应该包含：
```
DATABASE_URL=postgresql://localhost/todo_next
```

---

## 9. 数据库访问方式对比

### Raw SQL vs ORM

**当前方式：Raw SQL**
```javascript
const result = await pool.query(
  "SELECT * FROM todos WHERE id = $1",
  [id]
);
```

**优点：**
- ✅ 完全控制 SQL
- ✅ 性能最佳
- ✅ 学习 SQL 基础

**缺点：**
- ❌ 没有类型安全
- ❌ 容易写错 SQL
- ❌ 手动处理参数

---

**Prisma（高级 ORM）：**
```typescript
const todo = await prisma.todo.findUnique({
  where: { id }
});
```

**优点：**
- ✅ 类型安全
- ✅ 自动补全
- ✅ 简洁易读

**缺点：**
- ❌ 包体积大（~80MB）
- ❌ 复杂查询不灵活

---

**建议：**
- 学习阶段：Raw SQL（理解底层原理）
- 小项目：Raw SQL
- 团队项目：Prisma

---

## 总结

### 你学到了什么

**1. PostgreSQL 数据库：**
- ✅ 安装和启动 PostgreSQL
- ✅ 创建数据库和表
- ✅ 执行 SQL 查询
- ✅ 使用 psql 命令行

**2. Next.js API 路由：**
- ✅ 创建 API 路由文件
- ✅ 实现 CRUD 操作（GET/POST/PATCH/DELETE）
- ✅ 连接数据库
- ✅ 错误处理

**3. 测试和调试：**
- ✅ 使用 curl 测试 API
- ✅ 排查常见错误
- ✅ 查看日志和数据库

**4. 前后端集成：**
- ✅ React 调用 API
- ✅ 更新 UI State
- ✅ 完整数据流

---

### 下一步学习

**已掌握：**
- ✅ 基础 CRUD API
- ✅ 数据库操作
- ✅ 前后端连接

**进阶主题：**
- 错误处理和验证（Zod）
- 身份认证（NextAuth.js）
- 部署（Vercel + Supabase）
- 测试（Jest + React Testing Library）

---

**Happy Coding! 🚀**
