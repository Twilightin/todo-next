import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  if (idParam) {
    const result = await pool.query(
      "SELECT id, text, completed FROM todos where id = $1",
      [idParam]
    );
    return NextResponse.json(result.rows[0]);
  }
  const result = await pool.query("SELECT id, text, completed FROM todos");
  if (result.rows.length > 0) return NextResponse.json(result.rows);
  return NextResponse.json({ status: 401, error: "No Task Found" });
}

export async function POST(req) {
  const fromfront = await req.json();
  const text = fromfront?.text;
  const result = await pool.query(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text]
  );
  return NextResponse.json(result.rows[0]);
}

// export async function PATCH(req) {
//   const { searchParams } = new URL(req.url)
//   const idParam = searchParams.get("id")

//   const result = await pool.query("UPDATE todos SET completed = NOT completed WHERE id = $1 RETURNING *", [idParam])
//   return NextResponse.json(result.rows[0])
// }

export async function PATCH(req) {
  const body = await req.json();
  const { id, text, completed } = body;

  const result = await pool.query(
    "UPDATE todos SET text = $1, completed = $2 WHERE id = $3 RETURNING *",
    [text, completed, id]
  );
  return NextResponse.json(result.rows[0]);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  const result = await pool.query(
    "DELETE FROM todos WHERE id = $1 RETURNING *",
    [idParam]
  );
  return NextResponse.json(result.rows[0]);
}
