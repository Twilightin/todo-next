import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const result = await pool.query("SELECT id, text, completed FROM todos")
  return NextResponse.json(result.rows)
}