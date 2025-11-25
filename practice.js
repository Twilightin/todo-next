import { NextResponse } from "next/server"
import { useEffect } from "react"

export async function GET(req) {
    const { searchParam } = new URL(req.url)
    idParam = searchParam.get("id")

    if (idParam) {
        const result = await pool.query("SELECT * FROM todos WHERE id = $1", [idParam])
        return NextResponse.json(result.rows[0])

    const result = await pool.query("SELECT * FROM todos")
    return NextResponse.json(result.rows)
    }
}

async function fetchTodos() {
    const response = await fetch("/api/todos")
    const data = response.json()
    setTasks(data)
}

useEffect (() => {
    fetchTodos();
}, [])

// ===============================================================

export async function GET(req) {
    const { searchParam } = new URL(req.url)
    const idParam = searchParam.get("id")

    if (idParam) {
        const result = await pool.query("SELECT * FROM todos WHERE id = $1", [idParam])
        return NextResponse.json(result.rows[0])

    const result = await pool.query("SELECT * FROM todos")
    return NextResponse.json(result.rows)
    }
}

async function fetchTodos() {
    const response = await fetch("/api/todos")
    const data = await response.json()
    setTasks(data)
}

useEffect(() => {
    fetchTodos();
}, [])


curl http://localhost:3000/api/todos
curl http://localhost:3000/api/todos?id=1
// ---
async function handleSubmit(e) {
    e.preventDefault()

    const response = await fetch("/api/todos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify( { text: newTask})
    })

    const newTodo = await response.json()
    setTasks([...tasks, newTodo])
}

export async function POST(req) {
    const body = await req.json()
    const text = body?.text.trim()

    const result = await pool.query(
        "INSERT INTO todo (text, completed) VALUES ($1, $2) RETURNING *",
        [text, false]
    )

    return NextResponse.json(result.rows[0], {status: 201})
}

curl -X POST http://localhost:3000/api/todos \
    -H "Content-Type: application/json" \
    -d '{"text": "Learn java.js"}'
---

async function handleToggle(id, completed) {
    const response = await fetch("/api/todos", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id, completed: !completed})
    })

    const updatedTodo = await response.json()
    setTasks(prev => prev.map(t => 
        t.id == id ? updatedTodo : t
    ))

}

export async function PATCH(req) {
    const body = await req.json()
    const id = body?.id

    const updates = []
    const values = []
    let paramCount = 1

    if (typeof body.text === "string") {
        updates.push(`text = $${paramCount++}`)
        values.push(body.text)
    }

    if (typeof body.completed === "boolean") {
        updates.push(`completed = $${paramCount+++}`)
        values.push(body.completed)
    }

    values.push(id)
    const query = `
        UPDATE todos
        SET ${updates.join(", ")}
        WHERE id = ${id}
        RETURNING *
    `
}

curl -X http://localhost:3000/api/todo \
    -H "Content-Type: application/json"  \ 
    -d '{"id": 5, "text": "Updated task"}'
---

export async function DELETE(req) {
    const { searchParam } = new URL(req.url)
    let idParam = searchParams.get("id")

    if (!idParam) {
        const body = await req.json().catch(() => null)
        idParam = body?.id
    }

    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [idParam])
    
    return NextResponse.json(success: true, deleted: result.rows[0])
}

async function handleDelete(id) {
    const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE"
    })

    if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id))
    }
}

curl -X DELETE "http://localhost:3000/api/todos?id=1"
curl -X DELETE http://localhost:3000/api/todos?id=1 \
    -H "Content-Type: application/json" \
    -d "{'id': 1}"