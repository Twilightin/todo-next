import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  if (idParam) {
    const result = await pool.query(
      "SELECT * FROM anime WHERE id = $1",
      [idParam]
    );

    const anime = result.rows[0];

    if (!anime) {
      return NextResponse.json(
        { error: "Anime not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(anime);
  }

  const result = await pool.query("SELECT * FROM anime");
  return NextResponse.json(result.rows);
}

export async function POST(req) {
  const body = await req.json();
  const { title, status, score } = body;

  const result = await pool.query(
    "INSERT INTO anime (title, status, score) VALUES ($1, $2, $3) RETURNING *",
    [title, status, score]
  );

  return NextResponse.json(result.rows[0], { status: 201 });
}
