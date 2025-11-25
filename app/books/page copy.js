"use client";

import React, { useEffect, useState } from "react";

export default function Page() {  // Fix 4: Capitalize component name
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [info, setInfo] = useState(null);  // Initialize as null

  async function fetchBooks() {
    const response = await fetch("/api/books");
    const data = await response.json();
    setBooks(data);
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    // Fix 2: Correct URL with query parameter
    const response = await fetch(`/api/books?title=${encodeURIComponent(searchTitle)}`);
    const data = await response.json();
    setInfo(data);
    setSearchTitle("");
  }

  return (
    <>
      <h1>My Library</h1>
      <div>
        {books.map(b => (
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

      {/* Fix 3: Properly display search results */}
      {info && (
        <div>
          <h3>Search Results:</h3>
          {Array.isArray(info) ? (
            info.map(book => (
              <div key={book.id}>
                <h4>{book.title}</h4>
                <p>Author: {book.author}</p>
                <p>Rating: {book.rating}</p>
              </div>
            ))
          ) : (
            <pre>{JSON.stringify(info, null, 2)}</pre>
          )}
        </div>
      )}
    </>
  );
}