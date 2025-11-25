import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get("id")

    if (idParam) {
      const result = await pool.query("SELECT * FROM anime WHERE id = $1", [idParam])
      const anime = result.rows[0]
      if (!anime) {
        return NextResponse.json({ error: "Anime not found" }, { status: 404 })
      }
      return NextResponse.json(anime)
    }

    const result = await pool.query("SELECT * FROM anime")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const title = body?.title
    const status = body?.status
    const score = body?.score

    const result = await pool.query(
      "INSERT INTO anime (title, status, score) VALUES ($1, $2, $3) RETURNING *",
      [title, status, score]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
