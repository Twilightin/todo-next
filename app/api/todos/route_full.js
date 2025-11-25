import { NextResponse } from "next/server"
import pool from "../../../lib/db.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const idParam = searchParams.get("id")

  if (idParam) {
    const result = await pool.query("SELECT id, text, completed FROM todos WHERE id = $1", [idParam])
    return NextResponse.json(result.rows[0])
  }

  const result = await pool.query("SELECT id, text, completed FROM todos ORDER BY id ASC")
  if (result.rows.length > 0) return NextResponse.json(result.rows)
  return NextResponse.json({error: "No Task Found"})
}

export async function POST(req) {
  const body = await req.json()
  const {text} = body

  const result = await pool.query("INSERT INTO todos (text) VALUES ($1) RETURNING *", [text])
  return NextResponse.json(result.rows[0])
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const idParam = searchParams.get("id")

  const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [idParam])
  return NextResponse.json(result.rows[0])
}


export async function PATCH(req) {
  const { searchParams } = new URL(req.url)
  const idParam = searchParams.get("id")

  const result = await pool.query("UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *", [idParam])
  return NextResponse.json(result.rows[0])
}

// 💥
// export async function DELETE(req) {
//   const body = await req.json()
//   const {id} = body

//   const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [id])
//   return NextResponse.json(result.rows[0])
// }

// curl http://localhost:3000/api/todos
// curl "http://localhost:3000/api/todos?id=1"

// curl -X POST http://localhost:3000/api/todos \
//   -H "Content-Type: application/json" \
//   -d '{"text":"Learn Next.js"}'

// curl -X DELETE "http://localhost:3000/api/todos?id=1"

// curl -X DELETE http://localhost:3000/api/todos \
//   -H "Content-Type: application/json" \
//   -d '{"id":1}'