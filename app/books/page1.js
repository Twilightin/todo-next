'use client'

import { useEffect, useState } from "react"

export default function App() {
    const [books, setBooks] = useState([])
    const [myBook, setMyBook] = useState("")
    const [bookId, setBookId] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        if (!bookId) return

        try {
            const response = await fetch(`/api/books/?id=${bookId}`)
            const data = await response.json()
            if (data.error) {
                setMyBook('Book not found')
            } else {
                setMyBook(data.title)
            }
        } catch (error) {
            console.error('Error:', error)
            setMyBook('Error loading book')
        }
    }

    useEffect(() => {
        async function fetchBooks() {
            const response = await fetch("/api/books/")
            const data = await response.json()
            setBooks(data)
        }

        async function loadMyBook() {
            const response = await fetch(`/api/books/?id=3`)
            const data = await response.json()
            setMyBook(data.title)
        }

        fetchBooks();
        loadMyBook();
    }, [])

    return <>
        <h1>Books</h1>
        <ul>
            {books.map((book) => (
                <li key={book.id}>{book.title}</li>
            ))}
        </ul>
        <h2>My Favourite Book: <span>{myBook}</span></h2>
        <h2>Search The Book</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter book ID"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
            />
            <button type="submit">Search</button>
        </form>
    </>
}
