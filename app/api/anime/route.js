import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const {searchParams} = new URL(req.url)
  const idParam = searchParams.get("id")

  if (idParam) {
      const result = await pool.query("SELECT * FROM anime WHERE id = $1", [idParam])  // ✅ Added await
      return NextResponse.json(result.rows[0] || { error: "Anime not found" })
  }

  const result = await pool.query("SELECT * FROM anime ORDER BY id ASC");
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const body = await req.json();
  const { title, status, score } = await body;

  const result = await pool.query(
    "INSERT INTO anime (title, status, score) VALUES ($1, $2, $3) RETURNING *",
    [title, status, score]
  );
  return NextResponse.json(result.rows[0], { status: 201 });
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const idParam = searchParams.get("id")
  const result = await pool.query("DELETE FROM anime WHERE id = $1 RETURNING *", [idParam])
  return NextResponse.json(result.rows[0])
}

export async function PATCH(req) {
  // const { searchParams } = new URL(req.url)
  // const idParam = searchParams.get("id")

  const body = await req.json()
  const { id, title, status, score} = await body

  const result = await pool.query("UPDATE anime SET status = $1 WHERE id = $2 RETURNING *", [status, id])
  return NextResponse.json(result.rows[0])
}