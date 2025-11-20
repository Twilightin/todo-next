# API + Curl Memorization Cheatsheet

This guide helps you memorize the patterns for writing API routes and curl commands using a simple memory system.

---

## 🧠 The Memory System: "CRUD = Data Location"

**Think about WHERE the data goes:**

| HTTP Method | Memory Trick | Data Location | Example |
|-------------|--------------|---------------|---------|
| **GET** | "**G**o **G**rab" | Data comes FROM server → no body needed | Read a book |
| **POST** | "**P**ost a letter" | Data goes TO server → body required | Mail a letter |
| **PATCH** | "**P**atch with ID" | Data goes TO server + id needed → body with id | Fix a specific page |
| **DELETE** | "**D**elete by address" | Just the address → id in URL | Burn a specific letter |

**Key Pattern:**
- **Reading (GET)** = no package to send
- **Creating/Updating (POST/PATCH)** = send a package (body)
- **Deleting (DELETE)** = just point to address (URL param)

---


## 📋 Understanding Request Data with Real Examples

> 🎯 **This section shows ACTUAL VALUES at each step - not just code!**

---

### 🔍 GET vs POST: Where is the Data?

**Key difference:**

| Method | Data Location | Example |
|--------|--------------|---------|
| **GET** | URL query params | `/api/todos?id=1` |
| **POST** | Request body (invisible in URL) | `/api/todos` + hidden body |

---

### 📦 POST Request: Step-by-Step Value Breakdown

Let's trace what happens when you create a todo with text "Buy milk".

#### Step 0: User Action (What Actually Happens First!)

**What user does:**
```
1. User types "Buy milk" in the input field
2. User clicks "Add Task" button
3. React's handleSubmit() function runs
```

**React code in app/page.js:**
```javascript
function handleSubmit(e) {
  e.preventDefault();

  // User typed "Buy milk" in input
  // newTask = "Buy milk"

  // Now we call fetch to send this to server...
}
```

---

#### Step 1: Browser Prepares and Sends Request

**React code continues:**
```javascript
const response = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ text: "Buy milk" })  // ← Convert object to string
});
```

**Why `JSON.stringify()`?**
```javascript
// Browser has: JavaScript object (in memory)
{ text: "Buy milk" }

// HTTP can only send: TEXT (strings)
// So we convert object → text:
JSON.stringify({ text: "Buy milk" })
// Result: '{"text":"Buy milk"}'  // ← This STRING gets sent over internet
```

**Think of it like packaging:**
- You have a book (JavaScript object)
- You put it in a box with tape (JSON.stringify)
- The box travels through mail (HTTP)
- Server receives the box
- Server opens the box (req.json) to get the book back

---

#### Step 2: HTTP Request Travels to Server

**Raw HTTP request (what the server receives):**
```
POST /api/todos HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{"text":"Buy milk"}
```

The body is just a **string** of JSON text: `'{"text":"Buy milk"}'`

**Important:** The server receives the PACKAGED version (the box with tape), not the original book!

---

#### Step 3: Backend Receives Request

**Backend code:**
```javascript
export async function POST(req) {
  // At this point:
  console.log(req);  // ← req is a Request object

  // req contains:
  // - req.url = "http://localhost:3000/api/todos"
  // - req.method = "POST"
  // - req.body = ReadableStream (raw data, not usable yet!)

  // We CANNOT do this:
  // const text = req.text;  // ❌ undefined! req doesn't have .text
  // const body = req.body;  // ❌ ReadableStream, not an object!
}
```

**Why we need `await req.json()`:**
- The browser SENT a string (JSON.stringify converted object → string)
- The server RECEIVES that string in req.body
- We need to REVERSE the process: convert string → object back
- `req.json()` is the UNPACKING tool (opens the box to get the book)

**The round trip:**
```
Browser: { text: "Buy milk" }  →  JSON.stringify()  →  '{"text":"Buy milk"}'
         (object in memory)                             (string sent over HTTP)
                                     ↓
                                 HTTP travels
                                     ↓
Server:  '{"text":"Buy milk"}'  →  req.json()  →  { text: "Buy milk" }
         (string received)                         (object in memory again!)
```

---

#### Step 4: Parse JSON Body

```javascript
export async function POST(req) {
  // STEP 4a: Parse the JSON string into a JavaScript object
  const body = await req.json();

  // Now let's see what 'body' contains:
  console.log(body);
  // Output: { text: "Buy milk" }

  console.log(typeof body);
  // Output: "object"

  console.log(body.text);
  // Output: "Buy milk"
}
```

**What happened:**
```javascript
// Before req.json():
req.body = '{"text":"Buy milk"}'  // ← JSON string (not usable)

// After await req.json():
body = { text: "Buy milk" }  // ← JavaScript object (usable!)
```

---

#### Step 5: Extract and Clean the Text

```javascript
export async function POST(req) {
  const body = await req.json();
  // body = { text: "Buy milk" }

  // STEP 5a: Get the 'text' property
  const text = body.text;
  console.log(text);
  // Output: "Buy milk"

  // STEP 5b: Remove extra spaces
  const cleanedText = text.trim();
  console.log(cleanedText);
  // Output: "Buy milk" (no change in this case)
}
```

**Example with spaces:**
```javascript
// If user typed extra spaces:
// body = { text: "  Buy milk  " }

const text = body.text;
// text = "  Buy milk  "

const cleanedText = text.trim();
// cleanedText = "Buy milk"  ← Spaces removed!
```

---

#### Step 6: Insert Into Database (The Real Magic!)

**Now we save the todo to PostgreSQL:**

```javascript
export async function POST(req) {
  const body = await req.json();
  const text = (body?.text || "").toString().trim();
  // text = "Buy milk"

  // STEP 6: Insert into database with RETURNING *
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    ["Buy milk", false]
  );

  console.log("6. result =", result);
  console.log("6. result.rows[0] =", result.rows[0]);
}
```

**What happens in PostgreSQL:**

```sql
-- SQL that gets executed:
INSERT INTO todos (text, completed) VALUES ('Buy milk', false) RETURNING *;

-- PostgreSQL does:
-- 1. Creates a new row in the todos table
-- 2. Automatically generates id = 4 (auto-increment)
-- 3. Sets text = 'Buy milk'
-- 4. Sets completed = false
-- 5. Sets created_at = current timestamp (automatic)
-- 6. RETURNING * tells PostgreSQL to send back the complete row
```

**What the database returns:**

```javascript
result = {
  rows: [
    {
      id: 4,                                    // ← Generated by database
      text: "Buy milk",                        // ← What we inserted
      completed: false,                        // ← What we inserted
      created_at: "2025-01-19T15:30:00.123Z"  // ← Generated by database
    }
  ],
  rowCount: 1,      // How many rows were inserted
  command: "INSERT" // What SQL command was executed
}

// To get the actual todo object:
result.rows[0] = {
  id: 4,
  text: "Buy milk",
  completed: false,
  created_at: "2025-01-19T15:30:00.123Z"
}
```

**Why use `RETURNING *`?**

```sql
-- ❌ Without RETURNING:
INSERT INTO todos (text, completed) VALUES ('Buy milk', false);
-- Returns: nothing! We don't know what id was assigned!

-- ✅ With RETURNING *:
INSERT INTO todos (text, completed) VALUES ('Buy milk', false) RETURNING *;
-- Returns: { id: 4, text: "Buy milk", completed: false, created_at: "..." }
-- We get back the complete row including the database-generated id!
```

**The complete flow in your app:**

```
User types "Buy milk"
   ↓
Browser sends: '{"text":"Buy milk"}'
   ↓
Backend receives: { text: "Buy milk" }
   ↓
Backend cleans: "Buy milk" (trimmed)
   ↓
Backend sends to database: ["Buy milk", false]
   ↓
PostgreSQL inserts row and generates id=4
   ↓
PostgreSQL returns: { id: 4, text: "Buy milk", completed: false, created_at: "..." }
   ↓
Backend receives: result.rows[0]
   ↓
Backend sends to browser: { id: 4, text: "Buy milk", completed: false, created_at: "..." }
   ↓
React adds to state: setTasks([...tasks, newTodo])
   ↓
User sees new todo in the list with id=4
```

---

#### Step 7: Why `body?.text` instead of `body.text`?

**The `?.` (optional chaining) protects against errors:**

```javascript
// Example 1: Normal request
const body = { text: "Buy milk" };
const text = body?.text;
// text = "Buy milk"  ✅ Works!

// Example 2: Malformed request (body is null)
const body = null;
const text = body?.text;
// text = undefined  ✅ Doesn't crash!

// Without optional chaining:
const body = null;
const text = body.text;  // ❌ ERROR! Cannot read property 'text' of null
```

---

### 📊 Complete POST Example with All Values

```javascript
export async function POST(req) {
  // 1. Parse request body
  const body = await req.json();
  console.log("1. body =", body);
  // Output: { text: "  Buy milk  " }

  // 2. Safely get text field
  const rawText = body?.text;
  console.log("2. rawText =", rawText);
  // Output: "  Buy milk  "

  // 3. Convert to string (in case it's not)
  const stringText = rawText.toString();
  console.log("3. stringText =", stringText);
  // Output: "  Buy milk  "

  // 4. Remove extra spaces
  const text = stringText.trim();
  console.log("4. text =", text);
  // Output: "Buy milk"

  // Often combined into one line:
  const text = (body?.text || "").toString().trim();

  // 5. Insert into database
  console.log("5. Inserting into database...");
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    [text, false]
  );
  console.log("6. result =", result);
  // Output: {
  //   rows: [{ id: 4, text: "Buy milk", completed: false, created_at: "2025-01-19T15:30:00.123Z" }],
  //   rowCount: 1,
  //   command: "INSERT"
  // }

  console.log("7. result.rows[0] =", result.rows[0]);
  // Output: { id: 4, text: "Buy milk", completed: false, created_at: "2025-01-19T15:30:00.123Z" }

  // 8. Return the newly created todo to the browser
  return NextResponse.json(result.rows[0], { status: 201 });
}
```

---

### 🎯 Common Confusions Explained

#### Q1: Why `JSON.stringify()` in browser AND `req.json()` in server? Isn't that doing the same thing twice?

**Answer:** No! They do OPPOSITE things (one packs, one unpacks):

```javascript
// BROWSER SIDE (sending):
const data = { text: "Buy milk" };  // JavaScript object

// Problem: HTTP can only send TEXT (strings), not objects
// Solution: Convert object → string
const stringified = JSON.stringify(data);  // '{"text":"Buy milk"}'
fetch("/api/todos", { body: stringified }); // Send string over HTTP

// =====================================

// SERVER SIDE (receiving):
// req.body contains: '{"text":"Buy milk"}'  ← Still a string!

// Problem: We need a JavaScript object to use body.text
// Solution: Convert string → object (REVERSE of JSON.stringify)
const body = await req.json();  // { text: "Buy milk" }
const text = body.text;  // "Buy milk" ✅ Now we can access it
```

**Why not just send the object directly?**
- HTTP is a text-based protocol (like email)
- You can't send a JavaScript object through HTTP (like you can't email a physical book)
- You must convert it to text first (like taking a photo of the book's pages)
- The receiver must convert it back (like printing the photos to read)

---

#### Q2: Why create `body` variable first? Why not directly use `req.text`?

**Answer:** `req` is just a container for the HTTP request. It doesn't have the data directly!

```javascript
// ❌ These DON'T work:
req.text        // undefined
req.data        // undefined
req.params      // undefined
req.body.text   // Error! req.body is a stream, not an object

// ✅ This works:
const body = await req.json();  // Parse the stream into an object
const text = body.text;         // Now we can access properties
```

---

#### Q3: What does `await req.json()` actually do?

**Answer:** It converts the JSON string into a JavaScript object.

```javascript
// HTTP request body (string):
'{"text":"Buy milk","completed":false}'

// After await req.json() (object):
{ text: "Buy milk", completed: false }

// Now we can do:
body.text        // "Buy milk"
body.completed   // false
```

---

#### Q4: Why `body?.text` and not `body.text`?

**Answer:** Safety! If the request is broken, `?.` prevents crashes.

```javascript
// Scenario 1: Good request
const body = { text: "Buy milk" };
body?.text  // ✅ "Buy milk"
body.text   // ✅ "Buy milk" (both work)

// Scenario 2: Bad request (someone sends empty body)
const body = null;
body?.text  // ✅ undefined (safe!)
body.text   // ❌ CRASH! Cannot read property 'text' of null
```

---

### 📋 Comparison: GET vs POST Data Extraction

**GET request (data in URL):**
```javascript
// URL: /api/todos?id=5

export async function GET(req) {
  // Extract from URL
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  console.log(id);  // "5"
}
```

**POST request (data in body):**
```javascript
// URL: /api/todos
// Body: {"text":"Buy milk"}

export async function POST(req) {
  // Extract from body
  const body = await req.json();
  const text = body?.text;

  console.log(text);  // "Buy milk"
}
```

---

### 🧪 Test It Yourself: Add Console Logs

**Add this to your route.js to see real values:**

```javascript
export async function POST(req) {
  console.log("=== POST REQUEST DEBUG ===");

  const body = await req.json();
  console.log("1. Full body:", body);
  console.log("2. Type of body:", typeof body);
  console.log("3. body.text:", body?.text);

  const text = (body?.text || "").toString().trim();
  console.log("4. Final text:", text);
  console.log("5. Text length:", text.length);

  // Database operation
  console.log("6. Inserting into database...");
  const result = await pool.query(
    "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
    [text, false]
  );
  console.log("7. Database result:", result.rows[0]);
  console.log("8. Generated ID:", result.rows[0].id);

  return NextResponse.json(result.rows[0], { status: 201 });
}
```

**Then test with curl:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"  Buy milk  "}'
```

**You'll see in terminal:**
```
=== POST REQUEST DEBUG ===
1. Full body: { text: '  Buy milk  ' }
2. Type of body: object
3. body.text:   Buy milk
4. Final text: Buy milk
5. Text length: 8
6. Inserting into database...
7. Database result: {
  id: 4,
  text: 'Buy milk',
  completed: false,
  created_at: 2025-01-19T15:30:00.123Z
}
8. Generated ID: 4
```
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
  const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;

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

## 🎯 Quick Pattern Recognition Table

| Method | Route Pattern | React Pattern | Curl Pattern |
|--------|---------------|---------------|--------------|
| **GET** | `const { searchParams } = new URL(req.url)` | `fetch("/api/todos")` | `curl URL` |
| **POST** | `const body = await req.json()` | `method: "POST", body: JSON.stringify()` | `curl -X POST -H -d` |
| **PATCH** | `const body = await req.json()` | `method: "PATCH", body: JSON.stringify()` | `curl -X PATCH -H -d` |
| **DELETE** | `searchParams.get("id")` | `fetch(\`/api/todos?id=${id}\`, method: "DELETE")` | `curl -X DELETE "URL?id=1"` |

---

## 🔑 The "3H" Curl Memory Trick

For curl commands, remember **"3H"**:

1. **H**TTP method: `-X POST/PATCH/DELETE` (GET doesn't need -X)
2. **H**eader: `-H "Content-Type: application/json"` (only if sending data)
3. **H**andoff data: `-d '{"key":"value"}'` (only POST/PATCH)

**Shortcut:**
- **GET** = 0H (zero H's, just `curl URL`)
- **POST/PATCH** = 3H (all three H's)
- **DELETE** = 1H (just HTTP method, id in URL)

---

## 💡 Route Writing Pattern

Every Next.js route function follows this 5-step pattern:

```javascript
export async function [METHOD](req) {        // 1. Export + method name
  const body = await req.json();             // 2. Get data (if needed)
  const result = await pool.query(SQL, [...]) // 3. Database operation
  return NextResponse.json(result.rows)      // 4. Return JSON response
}                                             // 5. Error handling (wrap in try/catch)
```

**Memory acronym:** **"EDQRE"** = Export, Data, Query, Return, Error

---

## 🧪 Practice Drill

**Fill in the blanks without looking:**

1. GET uses `searchParams.get()` because data is in the ______
2. POST needs `-H` and `-d` because we're sending a ______
3. PATCH needs an ______ in the body to know which todo to update
4. DELETE id goes in the ______ like `?id=1`

**Answers:** URL, body/package, id, URL

---

## 🚀 Quick Reference: When to Use Each

- **GET** = Read/display todos → List page, single todo view
- **POST** = Create new todo → "Add Task" button
- **PATCH** = Update part of todo → Toggle checkbox, edit text
- **DELETE** = Remove todo → "Delete" button (❌)

---

## 🔒 Security Pattern (Always!)

All routes use **parameterized queries** to prevent SQL injection:

```javascript
// ✅ SAFE - Uses $1, $2 placeholders
pool.query("SELECT * FROM todos WHERE id = $1", [id])

// ❌ DANGEROUS - Never do this!
pool.query(`SELECT * FROM todos WHERE id = ${id}`)
```

**Memory:** Dollar signs = **$**afe queries

---

## 📝 Common Mistakes to Avoid

1. **Forgetting quotes in curl:** Use `"http://..."` for URLs with `?`
   ```bash
   # ❌ Wrong - shell interprets ? as wildcard
   curl -X DELETE http://localhost:3000/api/todos?id=1

   # ✅ Correct - quotes protect special characters
   curl -X DELETE "http://localhost:3000/api/todos?id=1"
   ```

2. **Wrong Content-Type:** Always use `application/json` (not `text/plain`)

3. **Forgetting -X:** GET doesn't need it, but POST/PATCH/DELETE do

4. **Body vs URL param:**
   - GET/DELETE → id in URL (`?id=1`)
   - POST/PATCH → id in body (`{"id":1}`)

---

## 🎓 Test Your Memory

Without looking at code, write from memory:

1. Curl command to create a todo with text "Test"
2. React fetch code for deleting todo with id=5
3. Route function signature for updating a todo

**Answers at the bottom of the file ↓**

---

<details>
<summary>📖 Answers</summary>

1. **Curl POST:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"text":"Test"}'
```

2. **React DELETE:**
```javascript
async function handleDelete(id) {
  const response = await fetch(`/api/todos?id=5`, {
    method: "DELETE"
  });
  if (response.ok) {
    setTasks(tasks.filter(t => t.id !== 5));
  }
}
```

3. **Route PATCH:**
```javascript
export async function PATCH(req) {
  const body = await req.json();
  const { id, ...updates } = body;
  // ... database update logic
  return NextResponse.json(updatedTodo);
}
```

</details>

---

---

# 📚 APPENDIX: JavaScript & Next.js API Reference

This appendix explains all the "magic" libraries and syntax you see in the route code.

---

## 🔷 Next.js App Router Convention

### Why `export async function GET(req)` ?

**Next.js App Router uses function names to route HTTP methods.**

```javascript
// app/api/todos/route.js
export async function GET(req) { }    // Handles GET requests
export async function POST(req) { }   // Handles POST requests
export async function PATCH(req) { }  // Handles PATCH requests
export async function DELETE(req) { } // Handles DELETE requests
```

**How it works:**
1. You create a file: `app/api/todos/route.js`
2. This creates an API endpoint at: `/api/todos`
3. When a GET request arrives at `/api/todos`, Next.js calls your `GET` function
4. When a POST request arrives, Next.js calls your `POST` function

**Convention rules:**
- Function names MUST be: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`
- Function names MUST be uppercase
- Functions MUST be exported
- File MUST be named `route.js` or `route.ts`

**Example request flow:**
```
Browser sends:          Next.js calls:
GET /api/todos     →    export async function GET(req)
POST /api/todos    →    export async function POST(req)
PATCH /api/todos   →    export async function PATCH(req)
DELETE /api/todos  →    export async function DELETE(req)
```

**📖 Documentation:** [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

## 🔷 Web URL API

### `new URL(req.url)`

**Built-in JavaScript API for parsing URLs.**

```javascript
const { searchParams } = new URL(req.url);
```

**What it does:**
Parses a URL string into an object with helpful properties.

**Example:**
```javascript
const url = new URL("http://localhost:3000/api/todos?id=1&sort=asc");

console.log(url.protocol);   // "http:"
console.log(url.host);       // "localhost:3000"
console.log(url.pathname);   // "/api/todos"
console.log(url.search);     // "?id=1&sort=asc"
console.log(url.searchParams); // URLSearchParams object
```

**In our route code:**
```javascript
export async function GET(req) {
  // req.url = "http://localhost:3000/api/todos?id=1"
  const url = new URL(req.url);

  // Now we can access parts of the URL
  console.log(url.pathname);      // "/api/todos"
  console.log(url.searchParams);  // URLSearchParams { 'id' => '1' }
}
```

**Why we need it:**
`req.url` is just a string. `new URL()` converts it into a structured object so we can easily extract query parameters.

**📖 Documentation:** [MDN Web URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)

---

## 🔷 URLSearchParams API

### `searchParams.get("id")`

**Built-in JavaScript API for working with query parameters (`?key=value`).**

```javascript
const { searchParams } = new URL(req.url);
const id = searchParams.get("id");
```

**What it does:**
Extracts values from the query string part of a URL.

**Example:**
```javascript
// URL: http://localhost:3000/api/todos?id=5&completed=true

const url = new URL("http://localhost:3000/api/todos?id=5&completed=true");
const params = url.searchParams;

params.get("id");         // "5" (string)
params.get("completed");  // "true" (string)
params.get("missing");    // null

params.has("id");         // true
params.has("missing");    // false

// Get all values for a parameter (if multiple exist)
params.getAll("tags");    // ["urgent", "work"]
```

**In our route code:**
```javascript
export async function GET(req) {
  // req.url = "http://localhost:3000/api/todos?id=5"

  const { searchParams } = new URL(req.url);
  // searchParams = URLSearchParams { 'id' => '5' }

  const idParam = searchParams.get("id");
  // idParam = "5" (string, not number!)

  // Use it in SQL query
  const result = await pool.query(
    "SELECT * FROM todos WHERE id = $1",
    [idParam]  // "5"
  );
}
```

**⚠️ Important:**
- `searchParams.get()` always returns a **string** (or `null`)
- Even numbers come back as strings: `"5"` not `5`

**Common methods:**
```javascript
searchParams.get("key")      // Get single value
searchParams.getAll("key")   // Get all values (if multiple)
searchParams.has("key")      // Check if exists
searchParams.set("key", "val") // Set/update value
searchParams.append("key", "val") // Add value
searchParams.delete("key")   // Remove parameter
```

**📖 Documentation:** [MDN URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

---

## 🔷 Next.js NextResponse

### `NextResponse.json()`

**Next.js utility for creating HTTP responses.**

```javascript
import { NextResponse } from "next/server";

return NextResponse.json(data);
```

**What it does:**
Creates an HTTP response with JSON body and proper headers.

**Basic usage:**
```javascript
// Simple JSON response (status 200 by default)
return NextResponse.json({ message: "Hello" });

// With custom status code
return NextResponse.json(
  { error: "Not found" },
  { status: 404 }
);

// With custom headers
return NextResponse.json(
  { data: todos },
  {
    status: 200,
    headers: {
      "X-Custom-Header": "value",
      "Cache-Control": "max-age=60"
    }
  }
);
```

**In our route code:**
```javascript
export async function GET(req) {
  const result = await pool.query("SELECT * FROM todos");

  // Automatically:
  // 1. Converts result.rows to JSON string
  // 2. Sets Content-Type: application/json header
  // 3. Sets status code (200 by default)
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const result = await pool.query("INSERT INTO todos ...");

  // Return with 201 status (Created)
  return NextResponse.json(result.rows[0], { status: 201 });
}
```

**What it does behind the scenes:**
```javascript
// When you write:
return NextResponse.json({ id: 1, text: "Buy milk" });

// Next.js sends this HTTP response:
HTTP/1.1 200 OK
Content-Type: application/json

{"id":1,"text":"Buy milk"}
```

**Common status codes:**
```javascript
NextResponse.json(data, { status: 200 })  // OK (default)
NextResponse.json(data, { status: 201 })  // Created
NextResponse.json(data, { status: 400 })  // Bad Request
NextResponse.json(data, { status: 404 })  // Not Found
NextResponse.json(data, { status: 500 })  // Server Error
```

**📖 Documentation:** [Next.js NextResponse](https://nextjs.org/docs/app/api-reference/functions/next-response)

---

## 🔷 PostgreSQL `pg` Library

### `pool.query()` and `result.rows`

**Node.js library for connecting to PostgreSQL.**

```javascript
import pool from "@/lib/db.js";

const result = await pool.query("SELECT * FROM todos");
console.log(result.rows);
```

---

### What is `pool`? (Database Connection Pool)

**`pool` is an object that manages multiple database connections efficiently.**

Think of it like a parking lot:
- **Without pool**: Every time you need a car (database connection), you buy a new one, use it, then throw it away. Very slow and wasteful!
- **With pool**: You have a parking lot with 10 cars ready. When you need one, you take it from the lot, use it, then return it for others to use. Fast and efficient!

---

### Where `pool` Comes From

**Created in `lib/db.js`:**

```javascript
// lib/db.js
import { Pool } from "pg";

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional settings:
  max: 20,           // Maximum 20 connections in the pool
  idleTimeoutMillis: 30000,  // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000,  // Wait max 2 seconds for a connection
});

// Test connection when server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Failed to connect to PostgreSQL:", err);
  } else {
    console.log("✅ Connected to PostgreSQL database");
    release(); // Return connection to pool
  }
});

export default pool;
```

**Then imported in route files:**
```javascript
// app/api/todos/route.js
import pool from "@/lib/db.js";  // Or "../../../lib/db.js"

export async function GET(req) {
  const result = await pool.query("SELECT * FROM todos");
  return NextResponse.json(result.rows);
}
```

---

### Why Use a Connection Pool?

**Problem without pooling:**
```javascript
// ❌ Inefficient - creates new connection every time
const client = new Client({ connectionString: DATABASE_URL });
await client.connect();  // SLOW! Takes ~50-100ms to establish connection
const result = await client.query("SELECT * FROM todos");
await client.end();  // Close connection
```

**Solution with pooling:**
```javascript
// ✅ Efficient - reuses existing connections
const result = await pool.query("SELECT * FROM todos");
// Fast! Takes ~5-10ms because connection already exists
```

**Benefits:**
1. **Speed**: Reusing connections is 10-20x faster than creating new ones
2. **Resource management**: Limits total connections to database
3. **Automatic**: Pool handles all connection management automatically
4. **Concurrency**: Multiple requests can use different connections simultaneously

---

### How Connection Pool Works

**Visual example:**

```
Request 1 arrives → Pool: "Here's connection #1" → Query executes → Connection #1 returned to pool
Request 2 arrives → Pool: "Here's connection #2" → Query executes → Connection #2 returned to pool
Request 3 arrives → Pool: "Here's connection #1 again!" → Query executes → Connection returned
```

**If all connections are busy:**
```
Request arrives → Pool: "All 20 connections busy, please wait..."
→ When connection available: "Here's connection #5" → Query executes
```

---

### Connection Pool Configuration

**Key settings:**

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Maximum connections in pool
  max: 20,  // Default: 10

  // Minimum idle connections to maintain
  min: 0,  // Default: 0

  // Close idle connections after this time
  idleTimeoutMillis: 30000,  // 30 seconds (default: 10000)

  // Max time to wait for available connection
  connectionTimeoutMillis: 2000,  // 2 seconds (default: 0 = no timeout)
});
```

**Typical configurations:**

**Development (local):**
```javascript
const pool = new Pool({
  connectionString: "postgresql://localhost/todo_next",
  max: 5,  // Small pool for local testing
});
```

**Production (cloud):**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,  // Larger pool for production traffic
  ssl: { rejectUnauthorized: false }  // Enable SSL for cloud databases
});
```

---

### Using `pool.query()`

**Basic syntax:**
```javascript
const result = await pool.query(sqlQuery, parameters);
```

**Method 1: Simple query (no parameters):**
```javascript
const result = await pool.query("SELECT * FROM todos");
console.log(result.rows);  // [{ id: 1, text: "...", ... }]
```

**Method 2: Parameterized query (recommended for security):**
```javascript
const result = await pool.query(
  "SELECT * FROM todos WHERE id = $1",
  [5]  // Parameters array
);
console.log(result.rows[0]);  // { id: 5, text: "...", ... }
```

**Method 3: Multiple parameters:**
```javascript
const result = await pool.query(
  "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
  ["Buy milk", false]
);
console.log(result.rows[0]);  // { id: 6, text: "Buy milk", ... }
```

---

### What `pool.query()` Returns

**Full result object structure:**
```javascript
const result = await pool.query("SELECT * FROM todos WHERE id = $1", [1]);

// result object structure:
{
  rows: [
    { id: 1, text: "Buy milk", completed: false, created_at: "..." }
  ],
  rowCount: 1,
  command: "SELECT",
  fields: [ ... ]
}
```

**Key properties:**
- `result.rows` - Array of row objects (the actual data)
- `result.rowCount` - Number of rows affected/returned
- `result.command` - SQL command that was executed

**Examples:**

**SELECT query:**
```javascript
const result = await pool.query("SELECT * FROM todos");

result.rows
// [
//   { id: 1, text: "Buy milk", completed: false },
//   { id: 2, text: "Walk dog", completed: true }
// ]

result.rows[0]        // { id: 1, text: "Buy milk", ... }
result.rows.length    // 2
result.rowCount       // 2
```

**INSERT query with RETURNING:**
```javascript
const result = await pool.query(
  "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
  ["Buy milk", false]
);

result.rows[0]
// { id: 3, text: "Buy milk", completed: false, created_at: "..." }

result.rowCount  // 1
```

**UPDATE query:**
```javascript
const result = await pool.query(
  "UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *",
  [true, 1]
);

result.rows[0]   // Updated row
result.rowCount  // 1 (number of rows updated)
```

**DELETE query:**
```javascript
const result = await pool.query(
  "DELETE FROM todos WHERE id = $1 RETURNING *",
  [1]
);

result.rows[0]   // Deleted row (before deletion)
result.rowCount  // 1 (number of rows deleted)
```

**Why `result.rows[0]`?**
```javascript
// When fetching single row, we want the object, not an array
const result = await pool.query("SELECT * FROM todos WHERE id = $1", [1]);

result.rows        // [{ id: 1, text: "Buy milk", ... }] - Array
result.rows[0]     // { id: 1, text: "Buy milk", ... } - Object

// So we return:
return NextResponse.json(result.rows[0]);  // Single object
// Instead of:
return NextResponse.json(result.rows);     // Array with one item
```

**Parameterized queries (`$1`, `$2`):**
```javascript
// ✅ SAFE - Parameters are escaped automatically
pool.query("SELECT * FROM todos WHERE id = $1", [userInput])

// ❌ DANGEROUS - SQL injection vulnerable!
pool.query(`SELECT * FROM todos WHERE id = ${userInput}`)
```

**📖 Documentation:** [node-postgres (pg)](https://node-postgres.com/)

---

## 🔷 JavaScript Syntax Explained

### Destructuring Assignment

**Extract values from objects/arrays into variables.**

```javascript
// Object destructuring
const { searchParams } = new URL(req.url);
// Same as:
const url = new URL(req.url);
const searchParams = url.searchParams;

// Array destructuring
const [first, second] = [10, 20];
// first = 10, second = 20
```

**Nested destructuring:**
```javascript
const body = { user: { name: "Alice", age: 30 } };
const { user: { name } } = body;
// name = "Alice"
```

**In our code:**
```javascript
// Instead of:
const url = new URL(req.url);
const searchParams = url.searchParams;

// We write:
const { searchParams } = new URL(req.url);
```

---

### Optional Chaining (`?.`)

**Safely access nested properties that might not exist.**

```javascript
const text = body?.text?.trim();
// If body is null/undefined, returns undefined (no error)
// If body.text is null/undefined, returns undefined
```

**Without optional chaining:**
```javascript
// ❌ Crashes if body is null/undefined
const text = body.text.trim();

// ✅ Safe but verbose
const text = body && body.text && body.text.trim();

// ✅ Safe and concise with ?.
const text = body?.text?.trim();
```

**In our code:**
```javascript
const text = (body?.text || "").toString().trim();
// 1. body?.text - Get text if body exists
// 2. || "" - Use empty string if text is null/undefined
// 3. .toString() - Convert to string
// 4. .trim() - Remove whitespace
```

---

### Nullish Coalescing (`??`)

**Provide default value only if `null` or `undefined`.**

```javascript
const value = input ?? "default";
// If input is null or undefined, use "default"
```

**Difference from `||`:**
```javascript
const a = 0 || 5;     // 5 (0 is falsy)
const b = 0 ?? 5;     // 0 (0 is not null/undefined)

const c = "" || "hi";  // "hi" ("" is falsy)
const d = "" ?? "hi";  // "" ("" is not null/undefined)
```

**In our code:**
```javascript
if (id == null) {  // Checks for null OR undefined
  return error;
}
```

---

### Template Literals (Backticks)

**Create strings with embedded expressions.**

```javascript
const name = "Alice";
const greeting = `Hello, ${name}!`;  // "Hello, Alice!"

const url = `/api/todos?id=${id}`;   // "/api/todos?id=5"
```

**In our code:**
```javascript
// React fetch with dynamic URL
const response = await fetch(`/api/todos?id=${id}`);
// If id = 5, becomes: "/api/todos?id=5"

// Dynamic SQL query building
const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount}`;
// Becomes: "UPDATE todos SET text = $1, completed = $2 WHERE id = $3"
```

---

### Async/Await

**Handle asynchronous operations (promises) more cleanly.**

```javascript
// ✅ With async/await (modern, clean)
async function getData() {
  const result = await pool.query("SELECT * FROM todos");
  return result.rows;
}

// ❌ With .then() (old style, harder to read)
function getData() {
  return pool.query("SELECT * FROM todos").then(result => {
    return result.rows;
  });
}
```

**Rules:**
- `await` can only be used inside `async` functions
- `await` pauses execution until promise resolves
- Errors can be caught with `try/catch`

**In our code:**
```javascript
export async function GET(req) {  // async keyword
  try {
    const result = await pool.query("...");  // await pauses here
    return NextResponse.json(result.rows);   // continues after query finishes
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

### Spread Operator (`...`)

**Expand arrays or objects.**

```javascript
// Array spread
const old = [1, 2, 3];
const new = [...old, 4, 5];  // [1, 2, 3, 4, 5]

// Object spread
const user = { name: "Alice", age: 30 };
const updated = { ...user, age: 31 };  // { name: "Alice", age: 31 }
```

**In our code (React):**
```javascript
// Add new todo to array
setTodos([...todos, newTodo]);
// Expands: [todo1, todo2, todo3, newTodo]

// Update todo in array
setTodos(todos.map(t => t.id === id ? { ...t, completed: true } : t));
// Creates new object with same properties but completed changed
```

---

## 🔷 Quick Reference Table

| Code | What it is | Example |
|------|------------|---------|
| `export async function GET(req)` | Next.js route handler | Built-in Next.js convention |
| `new URL(req.url)` | Web URL API | Built-in JavaScript |
| `searchParams.get("id")` | URLSearchParams API | Built-in JavaScript |
| `NextResponse.json()` | Next.js response helper | Next.js library |
| `pool.query()` | PostgreSQL client | `pg` npm package |
| `result.rows` | Query result array | `pg` library response |
| `await` | Wait for promise | JavaScript async/await |
| `const { x } = obj` | Destructuring | JavaScript ES6+ |
| `obj?.prop` | Optional chaining | JavaScript ES2020+ |
| `a ?? b` | Nullish coalescing | JavaScript ES2020+ |
| `` `text ${var}` `` | Template literal | JavaScript ES6+ |

---

## 🔷 How to Learn More

**Next.js:**
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)

**JavaScript Web APIs:**
- [URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

**PostgreSQL (pg library):**
- [node-postgres docs](https://node-postgres.com/)
- [Parameterized queries](https://node-postgres.com/features/queries)

**JavaScript Modern Syntax:**
- [Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
- [Optional chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- [Async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

---

**Now you know where all the "magic" comes from! 🎉**
