import { NextResponse } from "next/server";
import { createClient } from "../../../lib/server";

// GET - Fetch all todos or a single todo by id
export async function GET(req) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");

  let query = supabase.from("todos").select();
  if (idParam) {
    query = query.eq("id", idParam).single();
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST - Create a new todo
export async function POST(req) {
  const supabase = await createClient();
  const body = await req.json();
  const text = (body?.text || "").toString().trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const { data, error } = await supabase.from("todos").insert({ text, completed: false }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH - Update an existing todo
export async function PATCH(req) {
  const supabase = await createClient();
  const body = await req.json();
  const id = body?.id;
  if (id == null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const updateFields = {};
  if (typeof body.text === "string") updateFields.text = body.text;
  if (typeof body.completed === "boolean") updateFields.completed = body.completed;
  if (Object.keys(updateFields).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  const { data, error } = await supabase.from("todos").update(updateFields).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE - Delete a todo by id
export async function DELETE(req) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  let idParam = searchParams.get("id");
  if (!idParam) {
    const body = await req.json().catch(() => null);
    idParam = body?.id;
  }
  if (idParam == null) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const { data, error } = await supabase.from("todos").delete().eq("id", idParam).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, deleted: data });
}
