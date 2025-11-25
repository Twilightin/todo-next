'use client'

import { useEffect, useState } from "react"

export default function App() {
    const [books, setBooks] = useState([])
    const [bookId, setBookId] = useState("")
    const [searchedBook, setSearchedBook] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleSubmit(e) {
        e.preventDefault()
        if (!bookId.trim()) return

        setIsLoading(true)
        setError("")

        try {
            const response = await fetch(`/api/books/?id=${bookId}`)
            const data = await response.json()

            if (data.error) {
                setError('Book not found')
                setSearchedBook(null)
            } else {
                setSearchedBook(data)
                setBookId('') // Clear input after successful search
            }
        } catch (err) {
            setError('Error searching for book')
            setSearchedBook(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        async function fetchBooks() {
            try {
                const response = await fetch("/api/books/")
                const data = await response.json()

                // Check if data is an array before setting
                if (Array.isArray(data)) {
                    setBooks(data)
                } else {
                    console.error('API returned non-array data:', data)
                    setBooks([])
                }
            } catch (err) {
                console.error('Error fetching books:', err)
                setBooks([])
            }
        }

        fetchBooks()
    }, [])

    return <>
        <h1>Books</h1>
        <ul>
            {books.map((book) => (
                <li key={book.id}>{book.title}</li>
            ))}
        </ul>
        <h2>Search Book by ID</h2>
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Enter book ID"
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !bookId.trim()}>
                {isLoading ? 'Searching...' : 'Search'}
            </button>
        </form>

        {error && <p style={{color: 'red'}}>{error}</p>}
        {searchedBook && (
            <div style={{marginTop: '20px', padding: '10px', border: '1px solid #ccc'}}>
                <h3>{searchedBook.title}</h3>
                <p><strong>Author:</strong> {searchedBook.author}</p>
                <p><strong>Price:</strong> ¥{searchedBook.price}</p>
                <p><strong>Rating:</strong> {searchedBook.rating}/5.0</p>
            </div>
        )}
        
    </>
}
