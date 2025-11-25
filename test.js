// Memo
// 1. GET()
GET(req)




import { NextRequest, NextResponse } from "next/server";

const { useEffect } = require("react");


async function fetchAnime() {
    const response = await fetch("/api/anime")
    const data = await response.json()
    setAnimeList(data)
}

useEffect(() => {
    fetchAnime();
}, [])

export async function GET(req) {
    const result = await pool.query("SELECT * FROM anime")
    return NextResponse.json(result.rows)
}
---
async function handleSubmit(e) {
    e.preventDefault()
    const response = await fetch("/api/anime", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: {
            title: title,
            status: status,
            score: Number(socre),
        }
    })

    const newAnime = response.json()
    setAnimeList(prev => [...prev, newAnime])
}

export async function POST(req) {
    const body = await req.json()
    const {title, status, score} = await body

    const result = await pool.query("INSERT INTO anime (title, status, score) VALUES ($1, $2, $3) RETURNING *", 
        [title, status, score])
    return NextResponse(result.rows[0], { status: 201})
}
---

GET()
// Frontend
async function fetchAnime() {
    const response = await fetch("/api/anime")
    const data = await response.json()
    setAnimeList(data)
}

useEffect(() => {
    fetchAnime()
}, [])

// Backend
export async function GET(req) {
    const result = await pool.query("SELECT * FROM anime")
    return NextResponse.json(result.rows)
}

POST()
// Frontend
handleSubmit(e) {
    e.preventDefault()
    const response = fetch("api/anime", {
        method: "POST",
        headers: "Content-Type: application/json",
        body: JSON.stringify({
            title: title,
            status: status,
            score: score,
        })
    })
    const newAnime = response.json()
    setAnimeList(prev => [...prev, newAnime])
    setTitle("")
    setStatus("")
    setScore("")
}
// Backend
export async function POST(req) {
    const { title, status, score} = req.json()
    const result = pool.query("INSERT INTO (title, status, score) VALUES ($1, $2, $3) RETURNING *", 
        [title, status, score])
    return NextResponse.json(result.rows[0], { status: 201 })

}

PATCH()
// Frontend
// Backend

DELETE()
// Frontend
function handleDelete(id) {
    const response = fetch("api/anime", {
        method: "DELETE"
    })
}
// Backend
export async function DELETE(req) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get("id")
    const result = await pool.query("DELETE FROM anime WHERE id = $1 RETURNING *",
        [id]
    )
    return NextResponse.json(result.rows[0])
}
