import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const titleParam = searchParams.get("title");
    const idParam = searchParams.get("id");

    if (idParam) {
      const result = await pool.query("SELECT * FROM books WHERE id = $1", [
        idParam,
      ]);
      return NextResponse.json(result.rows[0] || { error: "Book not found" });
    }

    if (titleParam) {
      console.log("Searching for title:", titleParam);
      const result = await pool.query(
        "SELECT * FROM books WHERE title ILIKE $1",
        [`%${titleParam}%`]
      );
      console.log("Found rows:", result.rows.length);
      return NextResponse.json(
        result.rows.length > 0
          ? result.rows
          : { error: "No books found", searchedFor: titleParam }
      );
    }

    const result = await pool.query("SELECT * FROM books");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
