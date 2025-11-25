"use client";

import React, { useEffect, useState } from "react";

export default function page() {
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [info, setInfo] = useState();
  const [error, setError] = useState()

  async function fetchBooks() {
    const response = await fetch("/api/books");
    const data = await response.json();
    setBooks(data);
    console.log(books);
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const response = await fetch(
      `/api/books?title=${encodeURIComponent(searchTitle)}`
    );
    const data = await response.json();
    if (data.error) {
        setError(data.error)
        setInfo(null)
    } else {
        setInfo(data)
        setError(null)
    }
    setSearchTitle("");
  }

  return (
    <>
      <h1>My Library</h1>
      {/* <BookThread books={books} /> */}
      <div>
        {books.map((b) => (
          <p key={b.id}>{b.title}</p>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <h3>Search Book Info</h3>
        <input
          type="text"
          value={searchTitle}
          placeholder="input book title..."
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {error && (<p>Error: {error}</p>)}
      {info && (
        <div>
        <h2>Book Info</h2>
            {info.map(book =>(
                <div key={book.id}>
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
                <p>Rating: {book.rating}</p>
                </div>))}
                </div>
      )}
    </>
  );
}
