import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const result = await pool.query("SELECT id, text, completed FROM todos");
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const body = await req.json();
  const { text } = body;

  const result = await pool.query(
    "INSERT INTO todos (text) VALUES ($1) RETURNING *",
    [text]
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

export async function PATCH(req) {
  const body = await req.json();
  const { id, text } = body;

  const result = await pool.query("UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *", [text, id])
  return NextResponse.json(result.rows[0])
}
