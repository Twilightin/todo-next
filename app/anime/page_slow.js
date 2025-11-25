"use client";

import { useEffect, useState } from "react";

export default function App() {
  const [animeList, setAnimeList] = useState([]);

  function Table({ animeList }) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#e5e7eb" }}>
          <tr>
            <th style={{ textAlign: "left", padding: "12px" }}>id</th>
            <th style={{ textAlign: "left", padding: "12px" }}>title</th>
            <th style={{ textAlign: "left", padding: "12px" }}>status</th>
            <th style={{ textAlign: "left", padding: "12px" }}>score</th>
          </tr>
        </thead>
        <tbody>
          <Row animeList={animeList} />
        </tbody>
      </table>
    );
  }

  function Row({ animeList }) {
    return (
      <>
        {animeList.map((l) => (
          <tr key={l.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ textAlign: "left", padding: "12px" }}>{l.id}</td>
            <td style={{ textAlign: "left", padding: "12px" }}>{l.title}</td>
            <td style={{ textAlign: "left", padding: "12px" }}>{l.status}</td>
            <td style={{ textAlign: "left", padding: "12px" }}>{l.score}</td>
          </tr>
        ))}
      </>
    );
  }

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [score, setScore] = useState("");

  async function handleSubmit(e) {
    e.preventDefault()
    const newAnime = {
      title: {title},
      status: {status},
      score: {score}
    }

    const response = await fetch("/api/anime", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({      
      title: {title},
      status: {status},
      score: {score}})
    })

    setAnimeList(prev => [...prev, newAnime])
    setTitle("")
    setStatus("")
    setScore("")
  }

  function Form() {
    return (
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="input title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Select a status</option>
          <option value="plan_to_watch">plan_to_watch</option>
          <option value="watching">watchings</option>
          <option value="completed">completed</option>
        </select>
        <input
          type="text"
          placeholder="input score..."
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <button type="submit">Add Anime</button>
      </form>
    );
  }

  async function fetchAnime() {
    const response = await fetch("/api/anime");
    const data = await response.json();
    setAnimeList(data);
  }

  useEffect(() => {
    fetchAnime();
  }, []);

  return (
    <>
      <div>App</div>
      {/* <ul>
        {animeList.map((a) => (
          <li>{a.title}</li>
        ))}
      </ul> */}
      <Table animeList={animeList} />
      <Form />
    </>
  );
}
