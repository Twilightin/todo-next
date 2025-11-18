import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

// GET - Fetch all todos or a single todo by id
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get("id");

    if (idParam) {
      const result = await pool.query("SELECT * FROM todos WHERE id = $1", [idParam]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    }

    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new todo
export async function POST(req) {
  try {
    const body = await req.json();
    const text = (body?.text || "").toString().trim();
    
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *",
      [text, false]
    );
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update an existing todo
export async function PATCH(req) {
  try {
    const body = await req.json();
    const id = body?.id;
    
    if (id == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    // Build dynamic update query based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (typeof body.text === "string") {
      updates.push(`text = $${paramCount++}`);
      values.push(body.text);
    }
    
    if (typeof body.completed === "boolean") {
      updates.push(`completed = $${paramCount++}`);
      values.push(body.completed);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE todos SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a todo by id
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    let idParam = searchParams.get("id");

    // Allow id via JSON body as well
    if (!idParam) {
      const body = await req.json().catch(() => null);
      idParam = body?.id;
    }

    if (idParam == null) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const result = await pool.query("DELETE FROM todos WHERE id = $1 RETURNING *", [idParam]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, deleted: result.rows[0] });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
