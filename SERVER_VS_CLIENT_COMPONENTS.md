# Server Components vs Client Components in Next.js

## 🎯 The Big Picture

Next.js has TWO types of components:
1. **Server Components** (default) - Run on the SERVER
2. **Client Components** (need `"use client"`) - Run in the BROWSER

---

## 🖥️ Server Components (Default)

### What Are They?
- Components that render on the **server** (Node.js)
- The HTML is generated on the server and sent to the browser
- **No JavaScript is sent to the browser** for these components

### When to Use?
✅ Fetching data from a database  
✅ Reading files from the file system  
✅ Accessing environment variables (secrets)  
✅ Static content that doesn't need interaction  
✅ Better performance (less JavaScript to download)

### What You CANNOT Use:
❌ React hooks (`useState`, `useEffect`, `useContext`)  
❌ Browser APIs (`window`, `document`, `localStorage`)  
❌ Event handlers (`onClick`, `onChange`, `onSubmit`)  
❌ `fetch()` in the browser (but you CAN use it on the server)

### Example:
```javascript
// This is a Server Component (no "use client")
export default async function ServerPage() {
  // This runs on the SERVER
  const data = await fetch('https://api.example.com/data');
  const todos = await data.json();
  
  return (
    <div>
      <h1>Server Component</h1>
      {todos.map(todo => (
        <p key={todo.id}>{todo.text}</p>
      ))}
    </div>
  );
}
```

---

## 🌐 Client Components ("use client")

### What Are They?
- Components that render in the **browser** (client-side)
- JavaScript is sent to the browser
- Can be interactive and stateful

### When to Use?
✅ Need to use React hooks (`useState`, `useEffect`)  
✅ Need interactivity (buttons, forms, clicks)  
✅ Need browser APIs (`localStorage`, `window.location`)  
✅ Need to track state (like form inputs, toggles)  
✅ Real-time updates or animations

### What You CANNOT Use:
❌ Direct database access  
❌ File system operations  
❌ Server-only Node.js modules

### Example:
```javascript
"use client"; // This makes it a Client Component

import { useState } from "react";

export default function ClientPage() {
  // This runs in the BROWSER
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <h1>Client Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

---

## 📊 Comparison Table

| Feature | Server Component | Client Component |
|---------|------------------|------------------|
| **Directive** | (none, default) | `"use client"` |
| **Runs on** | Server | Browser |
| **React Hooks** | ❌ No | ✅ Yes |
| **Event Handlers** | ❌ No | ✅ Yes |
| **useState** | ❌ No | ✅ Yes |
| **useEffect** | ❌ No | ✅ Yes |
| **Database Access** | ✅ Yes | ❌ No |
| **Browser APIs** | ❌ No | ✅ Yes |
| **Interactive** | ❌ No | ✅ Yes |
| **JavaScript Sent** | ❌ No | ✅ Yes (larger bundle) |
| **SEO** | ✅ Better | ⚠️ Depends |

---

## 🔄 How They Work Together in Your App

### Your Todo App Architecture:

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Client)                     │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  app/page.js ("use client")                              │
│  ↓                                                        │
│  • useState, useEffect                                   │
│  • fetch("/api/todos") ──────────────────┐              │
│  • Event handlers (onClick, onChange)     │              │
│  • Renders UI with data                   │              │
│                                            │              │
└────────────────────────────────────────────┼──────────────┘
                                             │
                                             │ HTTP Request
                                             │
┌────────────────────────────────────────────┼──────────────┐
│                  Next.js Server            ↓              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  app/api/todos/route.js (Server)                         │
│  ↓                                                        │
│  • Receives HTTP request                                 │
│  • Talks to PostgreSQL database                          │
│  • Returns JSON response                                 │
│                                                           │
│  lib/db.js (Server)                                      │
│  ↓                                                        │
│  • Connection pool to PostgreSQL                         │
│                                                           │
└────────────────────────────────────────────┼──────────────┘
                                             │
                                             │ SQL Query
                                             │
┌────────────────────────────────────────────┼──────────────┐
│                  PostgreSQL Database       ↓              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  todos table                                             │
│  • id, text, completed, created_at                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🤔 Why Is Your page.js a Client Component?

Your `app/page.js` uses `"use client"` because it needs:

1. **useState** - To track tasks, newTask, loading
2. **useEffect** - To fetch data when page loads
3. **Event handlers** - onClick, onChange, onSubmit
4. **Browser fetch()** - To call your API from the browser

```javascript
"use client"; // ← Required because of the features below

import { useState, useEffect } from "react"; // ← React hooks

export default function DiyPage() {
  const [tasks, setTasks] = useState([]); // ← useState
  
  useEffect(() => {    // ← useEffect
    fetchTodos();
  }, []);
  
  async function fetchTodos() {
    const response = await fetch("/api/todos"); // ← Browser fetch
    // ...
  }
  
  async function handleSubmit(e) {
    e.preventDefault(); // ← Event handler
    // ...
  }
  
  return (
    <form onSubmit={handleSubmit}> {/* ← Event handler */}
      {/* ... */}
    </form>
  );
}
```

---

## 🏗️ Alternative: Server Component Approach

You COULD fetch data in a Server Component instead:

```javascript
// app/page.js (Server Component - no "use client")
import pool from "@/lib/db";
import TodoList from "./TodoList"; // Client Component

export default async function ServerPage() {
  // This runs on the SERVER - direct database access!
  const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
  const todos = result.rows;
  
  return (
    <div>
      <h1>Todos (fetched on server)</h1>
      {/* Pass data to Client Component for interactivity */}
      <TodoList initialTodos={todos} />
    </div>
  );
}
```

```javascript
// app/TodoList.js (Client Component)
"use client";

import { useState } from "react";

export default function TodoList({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  
  // Handle interactions (create, delete, update)
  // ...
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  );
}
```

**Benefits of this approach:**
- ✅ Faster initial page load (data fetched on server)
- ✅ Better SEO (content is in HTML)
- ✅ No loading state needed on client
- ❌ More complex (need to split components)

---

## 🎓 Key Takeaways

### For Beginners:

1. **Default = Server Component**
   - No `"use client"` = Server Component
   - Can't use hooks or event handlers

2. **Need Interactivity? → "use client"**
   - Add `"use client"` at the top
   - Now you can use hooks and events

3. **Your Current Approach is Fine!**
   - Using `"use client"` for everything is simpler when learning
   - You can optimize later

### The Flow:

```
User Action (Browser)
    ↓
Client Component (useState, onClick)
    ↓
fetch() call to /api/todos
    ↓
API Route (Server)
    ↓
Database (PostgreSQL)
    ↓
Response (JSON)
    ↓
Client Component (update state)
    ↓
Re-render UI
```

---

## 📚 Quick Reference

### "Should I use 'use client'?"

Ask yourself:
- Do I need `useState` or `useEffect`? → **YES, use "use client"**
- Do I need `onClick` or other events? → **YES, use "use client"**
- Do I need browser APIs? → **YES, use "use client"**
- Just displaying static data? → **NO, Server Component is fine**

---

## 🔧 Your Current Stack

```
Browser (Client)
├── app/page.js ("use client")           ← Client Component
│   ├── useState, useEffect
│   └── fetch("/api/todos")
│
Next.js Server
├── app/api/todos/route.js               ← Server-side API Route
│   ├── GET, POST, PATCH, DELETE
│   └── pool.query() to database
├── lib/db.js                            ← Server-side DB connection
│   └── PostgreSQL connection pool
│
PostgreSQL Database
└── todos table
```

---

**Summary:** You're using Client Components because you need React hooks and interactivity. Your API routes are server-side and handle database operations. This is a clean, beginner-friendly architecture! 🎉
