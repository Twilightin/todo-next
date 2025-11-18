# From Local UI to API Integration Tutorial

This tutorial shows you step-by-step how to transform `page_ui.js` (local state only) into `page.js` (API-connected with database). You'll learn how to call APIs, fetch data, and handle server responses.

---

## 📋 Table of Contents

1. [Understanding the Difference](#understanding-the-difference)
2. [What is an API?](#what-is-an-api)
3. [Step-by-Step Transformation](#step-by-step-transformation)
4. [Complete Code Comparison](#complete-code-comparison)
5. [Testing Your API](#testing-your-api)

---

## Understanding the Difference

### `page_ui.js` - Local State Only
- ❌ Data **only exists in browser memory**
- ❌ Refresh page = **all data is lost**
- ❌ No database, no persistence
- ✅ Simple, good for learning React basics

### `page.js` - API Connected
- ✅ Data **stored in PostgreSQL database**
- ✅ Refresh page = **data persists**
- ✅ Multiple users can see same data
- ✅ Real-world application pattern

---

## What is an API?

**API = Application Programming Interface**

Think of it as a **waiter in a restaurant**:

```
You (Browser)
    ↓
    "I want to order food" (HTTP Request)
    ↓
Waiter (API Route at /api/todos)
    ↓
    "Let me get that from the kitchen" (Database Query)
    ↓
Kitchen (PostgreSQL Database)
    ↓
    "Here's your food" (Database Response)
    ↓
Waiter (API Route)
    ↓
    "Here you go!" (HTTP Response with JSON)
    ↓
You (Browser) - Now you eat (display data)
```

### HTTP Methods (What you want to do)

| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Read/Fetch data | "Show me all todos" |
| **POST** | Create new data | "Add a new todo" |
| **PATCH** | Update existing data | "Mark todo as completed" |
| **DELETE** | Remove data | "Delete this todo" |

---

## How API Routes Handle HTTP Requests

### Understanding the Server Side ([app/api/todos/route.js](app/api/todos/route.js))

When your browser sends a request to `/api/todos`, Next.js routes it to the `route.js` file. This file **exports functions named after HTTP methods** that handle those requests.

### The Route File Structure

```javascript
// app/api/todos/route.js
import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

// Export function named after HTTP method
export async function GET(req) {
  // Handle GET requests
}

export async function POST(req) {
  // Handle POST requests
}

export async function PATCH(req) {
  // Handle PATCH requests
}

export async function DELETE(req) {
  // Handle DELETE requests
}
```

**Key points:**
- Each exported function name **MUST match** the HTTP method (GET, POST, PATCH, DELETE)
- Next.js automatically routes requests to the correct function
- Each function receives a `req` (request) object
- Each function must return a `NextResponse` object

---

### Request → Route → Database → Response Flow

```
Browser                    Next.js Route              PostgreSQL
  ↓                             ↓                          ↓
fetch("/api/todos")  →  GET(req) function  →  pool.query("SELECT...")
                             ↓                          ↓
                        Waits for data  ←  Returns rows from database
                             ↓
                    NextResponse.json(data)
                             ↓
Receives JSON data  ←  Sends HTTP response
  ↓
Updates UI with data
```

---

### Example 1: GET Request - Fetching All Todos

**Client-side (Browser):**
```javascript
// Simple GET request
const response = await fetch("/api/todos");
const data = await response.json();
```

**Server-side ([route.js:5-23](app/api/todos/route.js#L5-L23)):**
```javascript
export async function GET(req) {
  try {
    // 1. Parse URL to check for query parameters
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    // 2. If ID provided, fetch single todo
    if (idParam) {
      const result = await pool.query(
        "SELECT * FROM todos WHERE id = $1",
        [idParam]
      );
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(result.rows[0]);
    }

    // 3. Otherwise, fetch all todos
    const result = await pool.query(
      "SELECT * FROM todos ORDER BY id ASC"
    );

    // 4. Return data as JSON
    return NextResponse.json(result.rows);

  } catch (error) {
    // 5. Handle errors
    console.error("GET error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**What happens:**
1. Next.js calls the `GET` function when request arrives
2. `new URL(req.url)` parses the full URL (e.g., `http://localhost:3000/api/todos?id=1`)
3. `searchParams.get("id")` extracts query parameter (the `?id=1` part)
4. `pool.query()` sends SQL to PostgreSQL database
5. `result.rows` contains array of todo objects from database
6. `NextResponse.json()` converts JavaScript object to JSON and sends it back

---

### Example 2: POST Request - Creating a Todo

**Client-side (Browser):**
```javascript
const response = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Buy milk" })
});
const newTodo = await response.json();
```

**Server-side ([route.js:27-45](app/api/todos/route.js#L27-L45)):**
```javascript
export async function POST(req) {
  try {
    // 1. Parse JSON from request body
    const body = await req.json();
    const text = (body?.text || "").toString().trim();

    // 2. Validate input
    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }  // 400 = Bad Request
      );
    }

    // 3. Insert into database
    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text, false]
    );

    // 4. Return newly created todo (includes database-assigned ID)
    return NextResponse.json(result.rows[0], { status: 201 });
    // 201 = Created (success status for POST)

  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

**Breaking down the database query:**
```sql
INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *
```
- `INSERT INTO todos` - Add new row to `todos` table
- `(text, completed)` - Columns we're setting
- `VALUES ($1, $2)` - Placeholders for parameters (prevents SQL injection)
- `RETURNING *` - Return the complete row (including auto-generated `id`)

**Parameters array:** `[text, false]`
- `$1` = `text` (from request body)
- `$2` = `false` (default value for new todos)

---

### Example 3: PATCH Request - Updating a Todo

**Client-side (Browser):**
```javascript
const response = await fetch("/api/todos", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1, completed: true })
});
const updatedTodo = await response.json();
```

**Server-side ([route.js:49-90](app/api/todos/route.js#L49-L90)):**
```javascript
export async function PATCH(req) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const id = body?.id;

    // 2. Validate ID is provided
    if (id == null) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 3. Build dynamic update query
    //    (only update fields that were provided)
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

    // 4. Ensure at least one field is being updated
    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // 5. Add ID to end of values array
    values.push(id);

    // 6. Build and execute query
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    // 7. Check if todo was found
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // 8. Return updated todo
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

**Dynamic query example:**

If request body is `{ id: 1, completed: true }`:
```javascript
updates = ["completed = $1"]
values = [true, 1]  // [completed value, id value]
query = "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *"
```

If request body is `{ id: 1, text: "New text", completed: true }`:
```javascript
updates = ["text = $1", "completed = $2"]
values = ["New text", true, 1]  // [text, completed, id]
query = "UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *"
```

**Why dynamic?** Allows partial updates - you can update just `text`, just `completed`, or both.

---

### Example 4: DELETE Request - Removing a Todo

**Client-side (Browser):**
```javascript
const response = await fetch("/api/todos?id=1", {
  method: "DELETE"
});
const result = await response.json();
```

**Server-side ([route.js:94-119](app/api/todos/route.js#L94-L119)):**
```javascript
export async function DELETE(req) {
  try {
    // 1. Get ID from query parameter
    const { searchParams } = new URL(req.url);
    let idParam = searchParams.get("id");

    // 2. Fallback: check request body for ID
    if (!idParam) {
      const body = await req.json().catch(() => null);
      idParam = body?.id;
    }

    // 3. Validate ID is provided
    if (idParam == null) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    // 4. Delete from database
    const result = await pool.query(
      "DELETE FROM todos WHERE id = $1 RETURNING *",
      [idParam]
    );

    // 5. Check if todo existed
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    // 6. Return success with deleted item info
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

**Why `RETURNING *`?**
- Returns the deleted row data
- Useful for confirmation/logging
- Allows sending back what was deleted

---

### HTTP Status Codes Explained

The routes return different status codes based on what happened:

| Code | Meaning | When Used |
|------|---------|-----------|
| **200** | OK | Successful GET, PATCH, DELETE (default) |
| **201** | Created | Successful POST (new resource created) |
| **400** | Bad Request | Missing required fields, validation errors |
| **404** | Not Found | Requested resource doesn't exist |
| **500** | Internal Server Error | Database error, unexpected server error |

**In code:**
```javascript
// Success with default status (200)
return NextResponse.json(data);

// Success with custom status
return NextResponse.json(data, { status: 201 });

// Error with status
return NextResponse.json({ error: "Not found" }, { status: 404 });
```

---

### SQL Injection Protection

**❌ DANGEROUS (Never do this):**
```javascript
// Vulnerable to SQL injection!
const query = `SELECT * FROM todos WHERE id = ${id}`;
const result = await pool.query(query);
```

**✅ SAFE (Always use parameterized queries):**
```javascript
// Parameters are safely escaped
const query = "SELECT * FROM todos WHERE id = $1";
const result = await pool.query(query, [id]);
```

**Why?** If `id` comes from user input:
```javascript
// Malicious input: id = "1; DROP TABLE todos;"
// Dangerous query becomes:
"SELECT * FROM todos WHERE id = 1; DROP TABLE todos;"  // 😱

// Safe query with parameters:
"SELECT * FROM todos WHERE id = $1" with [id]
// Database treats entire input as a single value, not executable SQL
```

All routes in [route.js](app/api/todos/route.js) use parameterized queries (`$1`, `$2`) for security.

---

### Database Connection Pool ([lib/db.js](lib/db.js))

The routes import `pool` from `lib/db.js`:

```javascript
import pool from "../../../lib/db.js";
```

**What is a pool?**
- Manages multiple database connections
- Reuses connections instead of creating new ones each time
- More efficient than opening/closing connections per request

**How it works:**
```javascript
const result = await pool.query("SELECT * FROM todos");
// 1. Pool gets an available connection (or creates one)
// 2. Executes the query
// 3. Returns connection to pool for reuse
// 4. Returns query result
```

---

### Request/Response Object Details

**Request object (`req`):**
```javascript
export async function POST(req) {
  // Get full URL
  req.url  // "http://localhost:3000/api/todos?id=1"

  // Parse JSON body
  const body = await req.json();

  // Get headers
  const contentType = req.headers.get("Content-Type");
}
```

**Response object (`NextResponse`):**
```javascript
import { NextResponse } from "next/server";

// Return JSON
return NextResponse.json({ message: "Hello" });

// Return JSON with custom status
return NextResponse.json({ error: "Not found" }, { status: 404 });

// Set custom headers
return NextResponse.json(data, {
  status: 200,
  headers: { "X-Custom-Header": "value" }
});
```

---

### Complete Request Flow Example

Let's trace a complete request from browser to database and back:

**1. User clicks "Add Todo" button**
```javascript
// Browser executes:
const response = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Buy milk" })
});
```

**2. Request travels over HTTP**
```
POST /api/todos HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"text":"Buy milk"}
```

**3. Next.js routes to POST function**
```javascript
// Next.js calls this function in route.js:
export async function POST(req) {
  const body = await req.json();  // { text: "Buy milk" }
  const text = body.text.trim();  // "Buy milk"

  // Execute SQL
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    ["Buy milk", false]
  );
  // result.rows[0] = { id: 1, text: "Buy milk", completed: false, ... }

  return NextResponse.json(result.rows[0], { status: 201 });
}
```

**4. PostgreSQL executes query**
```sql
INSERT INTO todos (text, completed) VALUES ('Buy milk', false) RETURNING *;
-- Returns: { id: 1, text: 'Buy milk', completed: false, created_at: ... }
```

**5. Response travels back to browser**
```
HTTP/1.1 201 Created
Content-Type: application/json

{"id":1,"text":"Buy milk","completed":false,"created_at":"2025-11-17T..."}
```

**6. Browser receives and processes**
```javascript
const newTodo = await response.json();
// newTodo = { id: 1, text: "Buy milk", completed: false, ... }

setTasks(prev => [...prev, newTodo]);  // Update UI
```

---

## Step-by-Step Transformation

### Step 1: Understanding Local State (page_ui.js)

**Original code:**
```javascript
const [tasks, setTasks] = useState([]);
```

**What happens:**
- Tasks stored in **browser memory only**
- When you refresh → **GONE** 💥

---

### Step 2: Adding Loading State

**Why?** When fetching from API, there's a delay (network request takes time).

**Add this:**
```javascript
const [loading, setLoading] = useState(true);
```

**Usage:**
```javascript
if (loading) {
  return <div>Loading todos...</div>;
}
```

This shows a message while waiting for data from the server.

---

### Step 3: Fetching Data When Page Loads (useEffect)

**Problem:** How do we get data from database when page first loads?

**Solution:** Use `useEffect` hook!

```javascript
import { useEffect } from "react";

useEffect(() => {
  fetchTodos(); // Call function to get data
}, []);
// ↑ Empty array [] means "run this ONCE when page loads"
```

**What is useEffect?**
- Runs code **AFTER** component renders
- Perfect for fetching data, timers, subscriptions
- The empty `[]` means "only run once on mount"

---

### Step 4: Creating the Fetch Function

**In page_ui.js (NO API):**
```javascript
// Data is just created locally
const item = {
  id: Date.now(),
  text: trimmedTask,
  completed: false,
};
setTasks(prev => [...prev, item]);
```

**In page.js (WITH API):**
```javascript
async function fetchTodos() {
  try {
    // 1. Send GET request to our API
    const response = await fetch("/api/todos");

    // 2. Check if request succeeded
    if (!response.ok) throw new Error("Failed to fetch");

    // 3. Convert response from JSON to JavaScript object
    const data = await response.json();

    // 4. Update state with data from database
    setTasks(data);

  } catch (error) {
    console.error("Error fetching todos:", error);
  } finally {
    // 5. Done loading (whether success or error)
    setLoading(false);
  }
}
```

**Breaking down `async/await`:**

```javascript
async function fetchTodos() {
  // async = "this function does asynchronous work"

  const response = await fetch("/api/todos");
  // await = "wait for this to finish before continuing"
  // fetch() = browser function to make HTTP requests

  const data = await response.json();
  // .json() = convert JSON string to JavaScript object
}
```

**What is JSON?**
JSON = JavaScript Object Notation (a text format for data)

```javascript
// JavaScript object
{ id: 1, text: "Buy milk", completed: false }

// JSON (as text/string)
'{"id":1,"text":"Buy milk","completed":false}'
```

- `response.json()` → converts JSON string TO JavaScript object
- `JSON.stringify()` → converts JavaScript object TO JSON string

---

### Step 5: Creating a New Todo via API

**In page_ui.js (NO API):**
```javascript
function handleSubmit(e) {
  e.preventDefault();
  const item = {
    id: Date.now(), // We make up an ID
    text: trimmedTask,
    completed: false,
  };
  setTasks(prev => [...prev, item]); // Just add to local array
  setNewTask("");
}
```

**In page.js (WITH API):**
```javascript
async function handleSubmit(e) {
  e.preventDefault();

  const trimmedTask = newTask.trim();
  if (!trimmedTask) return;

  try {
    // 1. Send POST request with task data
    const response = await fetch("/api/todos", {
      method: "POST",               // We're creating something
      headers: {
        "Content-Type": "application/json"  // We're sending JSON
      },
      body: JSON.stringify({        // Convert JS object to JSON string
        text: trimmedTask
      }),
    });

    // 2. Check if creation succeeded
    if (!response.ok) throw new Error("Failed to create todo");

    // 3. Get the newly created todo from server
    //    (includes the ID assigned by database)
    const newTodo = await response.json();

    // 4. Add to local state
    setTasks(prev => [...prev, newTodo]);

    // 5. Clear input
    setNewTask("");

  } catch (error) {
    console.error("Error creating todo:", error);
  }
}
```

**Key differences:**
1. **ID creation**: Database creates ID (not `Date.now()`)
2. **Network request**: Must wait for server response
3. **Error handling**: Network can fail, database can fail
4. **Response data**: Server sends back complete todo with database-assigned ID

---

### Step 6: Deleting via API

**In page_ui.js (uses array index):**
```javascript
function handleDelete(index) {
  setTasks(prev => prev.filter((_, i) => i !== index));
  // Filter out item at position 'index'
}
```

**Problem with index:**
- Index can change when items are added/removed
- Not reliable for database operations

**In page.js (uses database ID):**
```javascript
async function handleDelete(id) {
  try {
    // 1. Send DELETE request with todo ID in URL
    const response = await fetch(`/api/todos?id=${id}`, {
      method: "DELETE",
    });

    // 2. Check if deletion succeeded
    if (!response.ok) throw new Error("Failed to delete");

    // 3. Remove from local state by ID (not index!)
    setTasks(prev => prev.filter(task => task.id !== id));

  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}
```

**Why use ID instead of index?**
```javascript
// Example: You have 3 todos
[
  { id: 1, text: "Task A" },  // index 0
  { id: 2, text: "Task B" },  // index 1
  { id: 3, text: "Task C" },  // index 2
]

// If you delete index 1, indices shift:
[
  { id: 1, text: "Task A" },  // index 0
  { id: 3, text: "Task C" },  // index 1 (changed!)
]

// But IDs never change:
// id: 1 is always Task A
// id: 3 is always Task C
```

---

### Step 7: Updating (Toggle) via API

**In page_ui.js (uses index):**
```javascript
function handleToggle(index) {
  setTasks(prev =>
    prev.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    )
  );
}
```

**In page.js (uses ID + API):**
```javascript
async function handleToggle(id, completed) {
  try {
    // 1. Send PATCH request with updated data
    const response = await fetch("/api/todos", {
      method: "PATCH",              // Updating existing data
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id,                         // Which todo to update
        completed: !completed       // Toggle the boolean
      }),
    });

    // 2. Check if update succeeded
    if (!response.ok) throw new Error("Failed to update");

    // 3. Get updated todo from server
    const updatedTodo = await response.json();

    // 4. Update local state
    setTasks(prev => prev.map(task =>
      task.id === id ? updatedTodo : task
    ));

  } catch (error) {
    console.error("Error updating todo:", error);
  }
}
```

**Understanding `.map()`:**
```javascript
// map() goes through each item and can transform it
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
// Result: [2, 4, 6]

// In our case:
setTasks(prev => prev.map(task =>
  task.id === id ? updatedTodo : task
  // ↑ If this is the task we updated, replace it
  //   Otherwise, keep the original task
));
```

---

### Step 8: Updating Component Calls

**In page_ui.js (passes index):**
```javascript
<TasksList
  tasks={tasks}
  handleDelete={handleDelete}      // Gets called with index
  handleToggle={handleToggle}      // Gets called with index
/>

// In TasksList component:
{tasks.map((task, index) => (
  <Tasks
    key={index}
    onDelete={() => handleDelete(index)}
    onToggle={() => handleToggle(index)}
  />
))}
```

**In page.js (passes ID):**
```javascript
<TasksList
  tasks={tasks}
  handleDelete={handleDelete}           // Gets called with id
  handleToggle={handleToggle}           // Gets called with id and completed
/>

// In TasksList component:
{tasks.map((task) => (
  <Tasks
    key={task.id}                       // Use id for React key
    onDelete={() => handleDelete(task.id)}
    onToggle={() => handleToggle(task.id, task.completed)}
  />
))}
```

**Why `key={task.id}` instead of `key={index}`?**
React uses `key` to track which items changed. IDs are stable, indices can shift.

---

## Complete Code Comparison

### page_ui.js - Local State Only

```javascript
"use client";
import { useState } from "react";

export default function DiyPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  // ❌ NO useEffect - no data fetching
  // ❌ NO loading state

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;

    // ❌ Create item locally, no API call
    const item = {
      id: Date.now(),              // Local ID
      text: trimmedTask,
      completed: false,
    };

    setTasks(prev => [...prev, item]);  // Just update state
    setNewTask("");
  }

  function handleDelete(index) {     // ❌ Uses index
    setTasks(prev => prev.filter((_, i) => i !== index));
  }

  function handleToggle(index) {     // ❌ Uses index
    setTasks(prev =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  }

  return (
    <div>
      <h1>DIY Page</h1>
      <Form handleSubmit={handleSubmit} newTask={newTask} setNewTask={setNewTask} />
      <TasksList
        tasks={tasks}
        handleDelete={handleDelete}
        handleToggle={handleToggle}
      />
    </div>
  );
}
```

### page.js - API Connected

```javascript
"use client";
import { useState, useEffect } from "react";  // ✅ Added useEffect

export default function DiyPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);  // ✅ Added loading state

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  // ✅ NEW: Fetch function
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

  // ✅ API call for creating
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

  // ✅ API call for deleting (uses ID)
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

  // ✅ API call for updating (uses ID)
  async function handleToggle(id, completed) {
    try {
      const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });

      if (!response.ok) throw new Error("Failed to update");
      const updatedTodo = await response.json();
      setTasks(prev => prev.map(task =>
        task.id === id ? updatedTodo : task
      ));
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  // ✅ Show loading state
  if (loading) {
    return <div>Loading todos...</div>;
  }

  return (
    <div>
      <h1>DIY Page</h1>
      <Form handleSubmit={handleSubmit} newTask={newTask} setNewTask={setNewTask} />
      <TasksList
        tasks={tasks}
        handleDelete={handleDelete}      // ✅ Now expects ID
        handleToggle={handleToggle}      // ✅ Now expects ID and completed
      />
    </div>
  );
}
```

---

## Key Concepts Summary

### 1. **async/await**
```javascript
async function doSomething() {
  // async = this function does asynchronous work

  const result = await fetch("/api/todos");
  // await = wait for this to complete before continuing
}
```

### 2. **fetch() - Making HTTP Requests**
```javascript
// GET request (default)
fetch("/api/todos")

// POST request (create)
fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "New todo" })
})

// DELETE request
fetch("/api/todos?id=1", {
  method: "DELETE"
})

// PATCH request (update)
fetch("/api/todos", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: 1, completed: true })
})
```

### 3. **Working with Responses**
```javascript
const response = await fetch("/api/todos");

// Check if successful (status 200-299)
if (!response.ok) {
  throw new Error("Request failed");
}

// Get data from response
const data = await response.json();  // Convert JSON to JavaScript
```

### 4. **JSON Conversion**
```javascript
// JavaScript → JSON (for sending)
const jsObject = { text: "Buy milk" };
const jsonString = JSON.stringify(jsObject);
// Result: '{"text":"Buy milk"}'

// JSON → JavaScript (for receiving)
const data = await response.json();
// Converts: '{"text":"Buy milk"}' → { text: "Buy milk" }
```

### 5. **Error Handling**
```javascript
try {
  const response = await fetch("/api/todos");
  if (!response.ok) throw new Error("Failed");
  const data = await response.json();
} catch (error) {
  console.error("Something went wrong:", error);
} finally {
  setLoading(false);  // Runs whether success or failure
}
```

### 6. **useEffect for Data Fetching**
```javascript
useEffect(() => {
  fetchTodos();
}, []);
// [] = empty dependency array = run once on mount
```

---

## Testing Your API

### Using Browser DevTools

1. Open page in browser
2. Press **F12** (Windows) or **Cmd+Option+I** (Mac)
3. Go to **Network** tab
4. Perform actions (add/delete/toggle todos)
5. See all API requests and responses!

### Using curl (Terminal)

```bash
# Get all todos
curl http://localhost:3000/api/todos

# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Test todo"}'

# Delete a todo
curl -X DELETE "http://localhost:3000/api/todos?id=1"

# Update a todo
curl -X PATCH http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"id":1,"completed":true}'
```

---

## Common Mistakes & Solutions

### ❌ Mistake 1: Forgetting `await`
```javascript
// WRONG - fetch returns a Promise, not data
const data = fetch("/api/todos");

// RIGHT - await the Promise
const response = await fetch("/api/todos");
const data = await response.json();
```

### ❌ Mistake 2: Not checking `response.ok`
```javascript
// WRONG - might fail silently
const data = await response.json();

// RIGHT - check for errors
if (!response.ok) throw new Error("Failed");
const data = await response.json();
```

### ❌ Mistake 3: Forgetting to stringify JSON
```javascript
// WRONG - can't send JavaScript object directly
body: { text: "todo" }

// RIGHT - convert to JSON string
body: JSON.stringify({ text: "todo" })
```

### ❌ Mistake 4: Using index instead of ID
```javascript
// WRONG - indices can change
handleDelete={index}

// RIGHT - IDs are stable
handleDelete={task.id}
```

### ❌ Mistake 5: Not handling errors
```javascript
// WRONG - no error handling
async function fetchTodos() {
  const response = await fetch("/api/todos");
  const data = await response.json();
  setTasks(data);
}

// RIGHT - wrap in try/catch
async function fetchTodos() {
  try {
    const response = await fetch("/api/todos");
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setTasks(data);
  } catch (error) {
    console.error("Error:", error);
  }
}
```

---

## Next Steps

Once you understand this tutorial:

1. ✅ You can connect any React component to an API
2. ✅ You understand HTTP methods (GET, POST, PATCH, DELETE)
3. ✅ You know how to handle async operations
4. ✅ You can debug API calls using browser DevTools

**Practice exercises:**
- Add a "loading" spinner while fetching
- Add error messages to the UI (not just console)
- Add a "Clear All" button that deletes all todos
- Add filtering (show all/completed/active)

---

**Happy coding! 🚀**
