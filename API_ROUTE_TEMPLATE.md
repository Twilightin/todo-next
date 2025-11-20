# API Route Template Guide

> 🎯 **Goal**: Learn to write API routes and React code by filling in templates

This guide provides blank templates you can copy and fill in for any CRUD operation. Each template shows you the **structure** so you can memorize the pattern.

---

## Table of Contents

1. [All 4 Operations Side-by-Side](#1-all-4-operations-side-by-side)
2. [Blank Templates](#2-blank-templates)
3. [Template Structure Guide](#3-template-structure-guide)
4. [Filled Examples (Todo App)](#4-filled-examples-todo-app)
5. [Practice Exercises](#5-practice-exercises)

> 💡 **Need detailed POST explanation?** See [API_CURL_CHEATSHEET.md](API_CURL_CHEATSHEET.md#📦-understanding-post-request-step-by-step-with-real-values)

---

## 📋 All 4 Operations Side-by-Side

### 1️⃣ GET - Fetch Todos

#### Backend Route (app/api/todos/route.js)
```javascript
export async function GET(req) {
  // Extract id from URL: /api/todos?id=1
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  if (idParam) {
    // Single todo: SELECT WHERE id = $1
    const result = await pool.query("SELECT * FROM todos WHERE id = $1", [idParam]);
    return NextResponse.json(result.rows[0]);
  }

  // All todos: SELECT * ORDER BY id
  const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
  return NextResponse.json(result.rows);
}
```

#### React Code (app/page.js)
```javascript
async function fetchTodos() {
  const response = await fetch("/api/todos");
  const data = await response.json();
  setTasks(data);
}

useEffect(() => {
  fetchTodos(); // Call our function to get todos from database
}, []); 
```

#### Curl Test
```bash
# Get all todos
curl http://localhost:3000/api/todos

# Get single todo (id=1)
curl http://localhost:3000/api/todos?id=1
```

**Memory:** GET = **G**rab data, **no -d** (no data sent)

---

### 2️⃣ POST - Create Todo

#### Backend Route (app/api/todos/route.js)
```javascript
export async function POST(req) {
  // Get data from request body
  const body = await req.json();
  const text = body?.text.trim();

  // Insert new todo with default completed=false
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    [text, false]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
```

#### React Code (app/page.js)
```javascript
async function handleSubmit(e) {
  e.preventDefault();

  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: newTask })
  });

  const newTodo = await response.json();
  setTasks([...tasks, newTodo]);
}
```

#### Curl Test
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Learn Next.js"}'
```

**Memory:** POST = **P**ackage to send → needs **-H** (header) + **-d** (data)

---

### 3️⃣ PATCH - Update Todo

#### Backend Route (app/api/todos/route.js)
```javascript
export async function PATCH(req) {
  // Get id and fields to update from body
  const body = await req.json();
  const id = body?.id;

  // Build dynamic UPDATE query
  const updates = [];
  const values = [];
  let paramCount = 1;

  if (typeof body.text === "string") {
    updates.push(`text = $${paramCount++}`);
    values.push(body.text);
  }

  if (typeof body.completed === "boolean") {
    updates.push(`completed = $${paramCount++}`);
    values.push(body.completed);
  }

  values.push(id);
  
  const query = `
    UPDATE todos 
    SET ${updates.join(", ")} 
    WHERE id = $${paramCount} 
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return NextResponse.json(result.rows[0]);
}
```

#### React Code (app/page.js)
```javascript
async function handleToggle(id, completed) {
  const response = await fetch("/api/todos", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, completed: !completed })
  });

  const updatedTodo = await response.json();
  setTasks(tasks.map(t => t.id === id ? updatedTodo : t));
}
```

#### Curl Test
```bash
# Toggle completion status
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}'

# Update text
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: "application/json" \
  -d '{"id":1,"text":"Updated task"}'
```

**Memory:** PATCH = **P**artial update → needs **id in body** + **-H** + **-d**

---

### 4️⃣ DELETE - Remove Todo

#### Backend Route (app/api/todos/route.js)
```javascript
export async function DELETE(req) {
  // Get id from URL query parameter
  const { searchParams } = new URL(req.url);
  let idParam = searchParams.get("id");

  // Or allow id from body as alternative
  if (!idParam) {
    const body = await req.json().catch(() => null);
    idParam = body?.id;
  }

  const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [idParam]);

  return NextResponse.json({ success: true, deleted: result.rows[0] });
}
```

#### React Code (app/page.js)
```javascript
async function handleDelete(id) {
  const response = await fetch(`/api/todos?id=${id}`, {
    method: "DELETE"
  });

  if (response.ok) {
    setTasks(tasks.filter(t => t.id !== id));
  }
}
```

#### Curl Test
```bash
# Delete by URL parameter
curl -X DELETE "http://localhost:3000/api/todos?id=1"

# Or delete by body (also works)
curl -X DELETE http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1}'
```

**Memory:** DELETE = **D**estroy by address → **id in URL** (no -d needed)

---

## 1. Blank Templates

### 🔧 Backend API Route Template

**File: `app/api/[resource]/route.js`**

```javascript
// ============================================
// IMPORTS
// ============================================
import { NextResponse } from "next/server";
import pool from "@/lib/db.js";

// ============================================
// GET - READ (Fetch all or single item)
// ============================================
export async function GET(req) {
  try {
    // 1. Parse URL for query parameters
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("____");  // Fill in parameter name

    // 2. If ID provided, fetch single item
    if (idParam) {
      const result = await pool.query(
        "SELECT * FROM ____ WHERE id = $1",  // Fill in table name
        [idParam]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    }

    // 3. Otherwise, fetch all items
    const result = await pool.query(
      "SELECT * FROM ____ ORDER BY id ASC"  // Fill in table name
    );

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// POST - CREATE (Add new item)
// ============================================
export async function POST(req) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const ____ = (body?.____ || "").toString().trim();  // Fill in field name

    // 2. Validate input
    if (!____) {  // Fill in validation
      return NextResponse.json(
        { error: "____ is required" },  // Fill in field name
        { status: 400 }
      );
    }

    // 3. Insert into database
    const result = await pool.query(
      "INSERT INTO ____ (____) VALUES ($1, $2) RETURNING *",  // Fill in table and columns
      [____, ____]  // Fill in values
    );

    // 4. Return newly created item
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================
// PATCH - UPDATE (Modify existing item)
// ============================================
export async function PATCH(req) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const id = body?.id;

    // 2. Validate ID
    if (id == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // 3. Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Add fields to update (customize for your resource)
    if (typeof body.____ === "____") {  // Fill in field name and type
      updates.push(`____ = $${paramCount++}`);  // Fill in column name
      values.push(body.____);  // Fill in field name
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // 4. Add ID to values
    values.push(id);

    // 5. Execute update
    const query = `UPDATE ____ SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;  // Fill in table name
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

// ============================================
// DELETE - REMOVE (Delete item)
// ============================================
export async function DELETE(req) {
  try {
    // 1. Get ID from query parameter
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // 2. Validate ID
    if (idParam == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // 3. Delete from database
    const result = await pool.query(
      "DELETE FROM ____ WHERE id = $1 RETURNING *",  // Fill in table name
      [idParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 4. Return success
    return NextResponse.json({ success: true, deleted: result.rows[0] });

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### 🎨 Frontend React Template

**File: `app/page.js` (or any component)**

```javascript
"use client";

import { useState, useEffect } from "react";

export default function ____Page() {  // Fill in resource name
  // ============================================
  // STATE
  // ============================================
  const [items, setItems] = useState([]);  // Rename 'items' to your resource
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(true);

  // ============================================
  // GET - FETCH ALL ITEMS
  // ============================================
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await fetch("/api/____");  // Fill in API path
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================
  // POST - CREATE NEW ITEM
  // ============================================
  async function handleSubmit(e) {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const response = await fetch("/api/____", {  // Fill in API path
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ____: inputValue })  // Fill in field name
      });

      const newItem = await response.json();
      setItems([...items, newItem]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to create:", error);
    }
  }

  // ============================================
  // PATCH - UPDATE ITEM
  // ============================================
  async function handleUpdate(id, updatedFields) {
    try {
      const response = await fetch("/api/____", {  // Fill in API path
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updatedFields })
      });

      const updatedItem = await response.json();
      setItems(items.map(item => item.id === id ? updatedItem : item));
    } catch (error) {
      console.error("Failed to update:", error);
    }
  }

  // ============================================
  // DELETE - REMOVE ITEM
  // ============================================
  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/____?id=${id}`, {  // Fill in API path
        method: "DELETE"
      });

      if (response.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  }

  // ============================================
  // RENDER
  // ============================================
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>____ List</h1>  {/* Fill in resource name */}

      {/* Form for creating new item */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add new ____..."  {/* Fill in resource name */}
        />
        <button type="submit">Add</button>
      </form>

      {/* List of items */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {/* Customize display based on your resource */}
            <span>{item.____}</span>  {/* Fill in field to display */}
            <button onClick={() => handleDelete(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 2. Template Structure Guide

### Backend Route Structure (EDQRE)

Each API function follows the **EDQRE** pattern:

1. **E**xport - `export async function GET(req)`
2. **D**ata - Get data from request (body, query params)
3. **Q**uery - Execute database query
4. **R**eturn - Send response with `NextResponse.json()`
5. **E**rror - Catch and handle errors

**Example breakdown:**

```javascript
export async function POST(req) {           // 1. Export
  try {
    const body = await req.json();          // 2. Data (get from request)
    const text = body?.text?.trim();

    const result = await pool.query(...);   // 3. Query (database)

    return NextResponse.json(               // 4. Return (response)
      result.rows[0],
      { status: 201 }
    );
  } catch (error) {                         // 5. Error (handling)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

### Frontend React Structure

Each React function follows the **FCUS** pattern:

1. **F**etch - Call API with `fetch()`
2. **C**heck - Check response status
3. **U**pdate - Update local state
4. **S**how - UI re-renders automatically

**Example breakdown:**

```javascript
async function handleSubmit(e) {
  e.preventDefault();

  // 1. Fetch (call API)
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputText })
  });

  // 2. Check (response status) - optional but recommended
  if (!response.ok) throw new Error("Failed");

  const newTodo = await response.json();

  // 3. Update (local state)
  setTodos([...todos, newTodo]);

  // 4. Show (React re-renders automatically)
}
```

---

### Common Patterns Reference

**Getting data from request:**

```javascript
// Query parameters (GET, DELETE)
const { searchParams } = new URL(req.url);
const id = searchParams.get("id");

// Request body (POST, PATCH)
const body = await req.json();
const text = body?.text;
```

**Database queries:**

```javascript
// SELECT (read)
const result = await pool.query("SELECT * FROM todos WHERE id = $1", [id]);

// INSERT (create)
const result = await pool.query(
  "INSERT INTO todos (text) VALUES ($1) RETURNING *",
  [text]
);

// UPDATE (modify)
const result = await pool.query(
  "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
  [true, id]
);

// DELETE (remove)
const result = await pool.query(
  "DELETE FROM todos WHERE id = $1 RETURNING *",
  [id]
);
```

**React state updates:**

```javascript
// Add to array
setItems([...items, newItem]);

// Update in array
setItems(items.map(item => item.id === id ? updatedItem : item));

// Remove from array
setItems(items.filter(item => item.id !== id));
```

---

## 3. Filled Examples (Todo App)

### Example: GET - Fetch All Todos

**Backend (`app/api/todos/route.js`):**

```javascript
export async function GET(req) {
  try {
    // 1. Parse URL for query parameters
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");  // ✅ Filled: "id"

    // 2. If ID provided, fetch single todo
    if (idParam) {
      const result = await pool.query(
        "SELECT * FROM todos WHERE id = $1",  // ✅ Filled: "todos"
        [idParam]
      );

      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      return NextResponse.json(result.rows[0]);
    }

    // 3. Otherwise, fetch all todos
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"  // ✅ Filled: "todos"
    );

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Frontend (`app/page.js`):**

```javascript
async function fetchTodos() {
  try {
    const response = await fetch("/api/todos");  // ✅ Filled: "/api/todos"
    const data = await response.json();
    setTodos(data);
  } catch (error) {
    console.error("Failed to fetch todos:", error);
  } finally {
    setLoading(false);
  }
}
```

---

### Example: POST - Create New Todo

**Backend (`app/api/todos/route.js`):**

```javascript
export async function POST(req) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const text = (body?.text || "").toString().trim();  // ✅ Filled: "text"

    // 2. Validate input
    if (!text) {  // ✅ Filled: text validation
      return NextResponse.json(
        { error: "text is required" },  // ✅ Filled: "text"
        { status: 400 }
      );
    }

    // 3. Insert into database
    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",  // ✅ Filled: table and columns
      [text, false]  // ✅ Filled: values
    );

    // 4. Return newly created todo
    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Frontend (`app/page.js`):**

```javascript
async function handleSubmit(e) {
  e.preventDefault();
  if (!inputText.trim()) return;

  try {
    const response = await fetch("/api/todos", {  // ✅ Filled: "/api/todos"
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText })  // ✅ Filled: "text" field
    });

    const newTodo = await response.json();
    setTodos([...todos, newTodo]);
    setInputText("");
  } catch (error) {
    console.error("Failed to create todo:", error);
  }
}
```

---

### Example: PATCH - Toggle Todo Completion

**Backend (`app/api/todos/route.js`):**

```javascript
export async function PATCH(req) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const id = body?.id;

    // 2. Validate ID
    if (id == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // 3. Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    // Add fields to update
    if (typeof body.text === "string") {  // ✅ Filled: "text" and "string"
      updates.push(`text = $${paramCount++}`);  // ✅ Filled: "text"
      values.push(body.text);  // ✅ Filled: "text"
    }

    if (typeof body.completed === "boolean") {  // ✅ Filled: "completed" and "boolean"
      updates.push(`completed = $${paramCount++}`);  // ✅ Filled: "completed"
      values.push(body.completed);  // ✅ Filled: "completed"
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // 4. Add ID to values
    values.push(id);

    // 5. Execute update
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;  // ✅ Filled: "todos"
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
```

**Frontend (`app/page.js`):**

```javascript
async function handleToggle(id, completed) {
  try {
    const response = await fetch("/api/todos", {  // ✅ Filled: "/api/todos"
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed })  // ✅ Toggle completed
    });

    const updatedTodo = await response.json();
    setTodos(todos.map(t => t.id === id ? updatedTodo : t));
  } catch (error) {
    console.error("Failed to toggle todo:", error);
  }
}
```

---

### Example: DELETE - Remove Todo

**Backend (`app/api/todos/route.js`):**

```javascript
export async function DELETE(req) {
  try {
    // 1. Get ID from query parameter
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // 2. Validate ID
    if (idParam == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // 3. Delete from database
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",  // ✅ Filled: "todos"
      [idParam]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 4. Return success
    return NextResponse.json({ success: true, deleted: result.rows[0] });

  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Frontend (`app/page.js`):**

```javascript
async function handleDelete(id) {
  try {
    const response = await fetch(`/api/todos?id=${id}`, {  // ✅ Filled: "/api/todos"
      method: "DELETE"
    });

    if (response.ok) {
      setTodos(todos.filter(t => t.id !== id));
    }
  } catch (error) {
    console.error("Failed to delete todo:", error);
  }
}
```

---

## 4. Practice Exercises

### Exercise 1: User Profile API

**Scenario:** Build an API for managing user profiles with fields: `name`, `email`, `bio`

**Database table:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tasks:**

1. **Copy the blank backend template** and fill in:
   - Table name: `users`
   - Fields: `name`, `email`, `bio`
   - Validation: name and email are required

2. **Copy the blank frontend template** and fill in:
   - Resource name: `User`
   - API path: `/api/users`
   - Display fields: name and email

**Hints:**
- POST should validate both `name` and `email`
- PATCH can update `name`, `email`, or `bio`
- Display users in a list with name and email

---

### Exercise 2: Product Catalog API

**Scenario:** Build an API for a product catalog with fields: `name`, `price`, `inStock`

**Database table:**
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tasks:**

1. **Backend:**
   - Fill in template for `products` table
   - Validate: name and price are required
   - PATCH should allow updating name, price, or in_stock

2. **Frontend:**
   - Create form with inputs for name and price
   - Display products with a checkbox for "In Stock" status
   - Add toggle function for in_stock status

**Hints:**
- Price validation: `if (typeof body.price !== "number")`
- Display price: `${product.price.toFixed(2)}`

---

### Exercise 3: Blog Posts API

**Scenario:** Build a blog API with fields: `title`, `content`, `published`

**Database table:**
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tasks:**

1. **Backend:**
   - Fill template for `posts` table
   - POST: Create with title, content, published=false
   - PATCH: Allow updating title, content, or published status
   - GET: Optionally filter by `?published=true`

2. **Frontend:**
   - Form with title input and content textarea
   - Display posts with title (as heading) and content
   - Add "Publish" button to toggle published status

**Bonus challenges:**
- Add GET filter for published posts only
- Add search by title in GET endpoint
- Add character count for content in React

---

## 5. Quick Reference Cheat Sheet

### Backend Route Checklist

**For every route function:**
- [ ] `export async function [METHOD](req)`
- [ ] `try/catch` block
- [ ] Get data from request (body or query params)
- [ ] Validate required fields
- [ ] Execute database query with `pool.query()`
- [ ] Return `NextResponse.json()`
- [ ] Handle errors with status codes

### Frontend Function Checklist

**For every CRUD operation:**
- [ ] `async function` keyword
- [ ] `try/catch` block
- [ ] `await fetch()` with correct method and headers
- [ ] `await response.json()` to parse response
- [ ] Update state with `setState()`
- [ ] Handle errors with console.error or UI message

### HTTP Methods & Operations

| Method | Purpose | Data Location | Returns |
|--------|---------|---------------|---------|
| GET | Read | Query params (`?id=1`) | Item(s) |
| POST | Create | Request body | New item |
| PATCH | Update | Request body (id + fields) | Updated item |
| DELETE | Remove | Query params (`?id=1`) | Success message |

### Common Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 404 | Not Found | Item doesn't exist |
| 500 | Server Error | Database/unexpected error |

---

## 6. Tips for Memorization

### Memorize Route Writing (EDQRE)

**E**xport → **D**ata → **Q**uery → **R**eturn → **E**rror

```javascript
export async function POST(req) {     // E: Export
  try {
    const body = await req.json();    // D: Data
    const result = await pool.query() // Q: Query
    return NextResponse.json()        // R: Return
  } catch (error) {                   // E: Error
    return NextResponse.json()
  }
}
```

### Memorize React Calling (FCUS)

**F**etch → **C**heck → **U**pdate → **S**how

```javascript
const response = await fetch()        // F: Fetch
if (!response.ok) throw Error()       // C: Check
setItems([...items, newItem])         // U: Update
// React re-renders automatically     // S: Show
```

### Memorize Data Location (3 Rules)

1. **GET & DELETE**: Data in URL query (`?id=1`)
2. **POST & PATCH**: Data in request body
3. **All need ID except POST**: POST creates new ID

---

**Now you have the templates! Copy, fill in the blanks, and practice! 🚀**
