import { NextResponse } from "next/server"
import pool from "../../../lib/db.js";

export async function GET(req) {
  const response = await pool.query("SELECT id, text, completed FROM todos ORDER BY id ASC")

  if (response.rows.length > 0) return NextResponse.json(response.rows)
  return NextResponse.json({error: "No Task Found"})
}

