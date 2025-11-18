# PostgreSQL Setup Guide for Todo Next.js App

This document outlines all the steps taken to integrate PostgreSQL with the Next.js todo application.

---

## 📁 Files Created/Modified

### 1. `.env.local` - Database Connection String
```bash
POSTGRES_URL=postgresql://localhost:5432/todo_next
```

**Purpose:** Stores the PostgreSQL connection URL as an environment variable for secure database access.

---

### 2. `lib/db.js` - Database Connection Pool
```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export default pool;
```

**Purpose:** Creates and exports a PostgreSQL connection pool that manages database connections efficiently across the application.

---

### 3. `db/schema.sql` - Database Schema
```sql
-- Create the todos table
CREATE TABLE IF NOT EXISTS todos (
  id SERIAL PRIMARY KEY,
  text VARCHAR(255) NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert some sample data
INSERT INTO todos (text, completed) VALUES
  ('Morning excuses', false),
  ('Reading book', false),
  ('Have lunch', false);
```

**Purpose:** Defines the database schema for the `todos` table with sample data.

**Table Structure:**
- `id` - Auto-incrementing primary key
- `text` - Todo item text (max 255 chars)
- `completed` - Boolean flag for completion status
- `created_at` - Timestamp of creation

---

### 4. `app/api/todos/route.js` - CRUD API Routes
```javascript
import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET - Fetch all todos or a single todo by id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const result = await pool.query("SELECT * FROM todos WHERE id = $1", [idParam]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new todo
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

// PATCH - Update an existing todo
export async function PATCH(req) {
  try {
    const body = await req.json();
    const id = body?.id;
    
    if (id == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

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

// DELETE - Delete a todo by id
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let idParam = searchParams.get("id");

    if (!idParam) {
      const body = await req.json().catch(() => null);
      idParam = body?.id;
    }

    if (idParam == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [idParam]);
    
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

**Purpose:** Implements full CRUD operations for todos using PostgreSQL.

---

## 🚀 Step-by-Step Setup Process

### Step 1: Install PostgreSQL Client Library
```bash
cd /Users/twilightin/TruthSetYouFree/NodeJS/todo-next
npm install pg
```

**What it does:** Installs the `pg` (node-postgres) package, which is the PostgreSQL client for Node.js.

---

### Step 2: Configure Environment Variables
Create `.env.local` file in the project root with your PostgreSQL connection string:
```bash
POSTGRES_URL=postgresql://localhost:5432/todo_next
```

**Note:** Replace with your actual PostgreSQL credentials if needed:
```bash
POSTGRES_URL=postgresql://username:password@localhost:5432/todo_next
```

---

### Step 3: Create Database Connection Pool
Created `lib/db.js` to manage PostgreSQL connections using a connection pool pattern for better performance.

---

### Step 4: Set Up Database Schema
Create the database and run the schema:

```bash

psql -d template1
CREATE DATABASE <db_name>;
psql -h localhost

# Create the database (if it doesn't exist)
# createdb todo_next

# Run the schema SQL file
psql postgresql://twilightin@localhost:5432/todo_next -f db/schema.sql
```

Or manually connect and run:
```bash
psql postgresql://twilightin@localhost:5432/todo_next
```
Then paste the contents of `db/schema.sql`.

---

### Step 5: Implement API Routes
Created `app/api/todos/route.js` with full CRUD operations using Next.js 13+ App Router conventions.

---

### Step 6: Connect Frontend to Backend
Updated `app/page.js` to fetch and sync todos with the PostgreSQL database through the API:

**Changes made:**
1. Added `useEffect` hook to fetch todos when the page loads
2. Replaced local-only state management with API calls
3. Implemented async functions for all CRUD operations:
   - `fetchTodos()` - GET all todos from database
   - `handleSubmit()` - POST new todo to database
   - `handleDelete()` - DELETE todo from database
   - `handleToggle()` - PATCH todo completion status
4. Added loading state and error handling
5. Changed from using array indices to using database IDs for operations

---

## 📡 API Endpoints

### GET `/api/todos`
Fetch all todos
```bash
curl http://localhost:3000/api/todos
```

### GET `/api/todos?id=1`
Fetch a specific todo by ID
```bash
curl http://localhost:3000/api/todos?id=1
```

### POST `/api/todos`
Create a new todo
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "New task"}'
```

### PATCH `/api/todos`
Update an existing todo
```bash
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "completed": true}'
```

### DELETE `/api/todos?id=1`
Delete a todo
```bash
curl -X DELETE http://localhost:3000/api/todos?id=1
```

---

## 🔧 Additional Files Modified

### `components/ui/input.js`
Created a simple Input component for form fields.

### `components/ui/button.js`
Created a simple Button component for form submission.

### `app/layout.js`
Created a minimal layout with header and footer.

### `app/page.js` - Frontend Integration with API
Updated the main page to fetch and manage todos from the PostgreSQL database via API calls.

```javascript
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function DiyPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch todos from API when component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;
    
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmedTask }),
      });
      
      if (!response.ok) throw new Error("Failed to create todo");
      
      const newTodo = await response.json();
      setTasks(prev => [...prev, newTodo]);
      setNewTask("");
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete");
      
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  async function handleToggle(id, completed) {
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
      
      if (!response.ok) throw new Error("Failed to update");
      
      const updatedTodo = await response.json();
      setTasks(prev => prev.map(task => task.id === id ? updatedTodo : task));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <p>Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">DIY Page</h1>
      <Form 
        handleSubmit={handleSubmit}
        newTask={newTask}
        setNewTask={setNewTask}
      />
      <TasksList
        tasks={tasks}
        handleDelete={handleDelete}
        handleToggle={handleToggle}
      />
    </div>
  );
}

function TasksList({ tasks, handleDelete, handleToggle }) {
  return (
    <ul className="space-y-2">
      {tasks.map((task) => (
        <Tasks
          task={task}
          key={task.id}
          onDelete={() => handleDelete(task.id)}
          onToggle={() => handleToggle(task.id, task.completed)}
        />
      ))}
    </ul>
  );
}

function Tasks({ task, onDelete, onToggle }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="cursor-pointer"
      />
      <span className={task.completed ? "line-through text-gray-500" : ""}>
        {task.text}
      </span>
      <span
        onClick={onDelete}
        className="ml-auto cursor-pointer hover:scale-110 transition-transform"
      >
        ❌
      </span>
    </li>
  );
}

function Form({ handleSubmit, newTask, setNewTask }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Input your task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <Button type="submit">Add Task</Button>
    </form>
  );
}
```

**Key Features:**
- ✅ **Fetch todos on page load** using `useEffect` hook
- ✅ **Create todos** via POST request to `/api/todos`
- ✅ **Delete todos** via DELETE request with todo id
- ✅ **Update todos** (toggle completion) via PATCH request
- ✅ **Loading state** while fetching initial data
- ✅ **Error handling** for all API operations
- ✅ **Optimistic UI updates** - updates local state after successful API calls
- ✅ Uses **todo IDs** instead of array indices for reliable identification

---

## ✅ Verification Steps

1. **Check PostgreSQL is running:**
   ```bash
   psql --version
   ```

2. **Verify database exists:**
   ```bash
   psql -l | grep todo_next
   ```

3. **Check table structure:**
   ```bash
   psql postgresql://localhost:5432/todo_next -c "\d todos"
   ```

4. **View sample data:**
   ```bash
   psql postgresql://localhost:5432/todo_next -c "SELECT * FROM todos;"
   ```

5. **Start the Next.js dev server:**
   ```bash
   npm run dev
   ```

6. **Test the API:**
   Visit `http://localhost:3000/api/todos` in your browser or use curl.

---

## 🎯 Key Features

- ✅ Connection pooling for efficient database access
- ✅ Parameterized queries to prevent SQL injection
- ✅ Error handling with appropriate HTTP status codes
- ✅ Support for partial updates (PATCH)
- ✅ RESTful API design
- ✅ Environment-based configuration
- ✅ Sample data for quick testing

---

## 📝 Notes

- The connection pool is automatically managed by the `pg` library
- All queries use parameterized statements (`$1`, `$2`, etc.) for security
- The API uses Next.js App Router conventions (route handlers)
- Error messages are logged to console and returned as JSON responses
- The database schema includes a `created_at` timestamp for future sorting/filtering

---

## 🔮 Future Enhancements

Consider adding:
- User authentication
- Pagination for large todo lists
- Search and filtering capabilities
- Due dates and priorities
- Tags or categories
- Soft deletes with `deleted_at` column
- Database migrations with tools like `node-pg-migrate`
- Input validation with libraries like `zod`
- Rate limiting for API endpoints

---

**Created:** November 14, 2025  
**Author:** GitHub Copilot  
**Project:** todo-next
