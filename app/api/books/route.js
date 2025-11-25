import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const titleParam = searchParams.get("title");

  if (titleParam) {
    const result = await pool.query("SELECT * FROM books WHERE title ILIKE $1", [
      `%${titleParam}%`,
    ]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book Not Found"})
    }
    return NextResponse.json(result.rows)
  }

  const result = await pool.query("SELECT * FROM books");
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Book Not Found"})
    }  
    return NextResponse.json(result.rows)
}