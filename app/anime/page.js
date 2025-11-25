"use client";

import { useEffect, useState } from "react";

function Table({ animeList, onDelete, onToggle }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead style={{ backgroundColor: "#e5e7eb" }}>
        <tr>
          <th style={{ textAlign: "left", padding: "12px" }}>id</th>
          <th style={{ textAlign: "left", padding: "12px" }}>title</th>
          <th style={{ textAlign: "left", padding: "12px" }}>status</th>
          <th style={{ textAlign: "left", padding: "12px" }}>score</th>
          <th style={{ textAlign: "left", padding: "12px" }}>delete</th>
        </tr>
      </thead>
      <tbody>
        <Row animeList={animeList} onDelete={onDelete} onToggle={onToggle}/>
      </tbody>
    </table>
  );
}

function Row({ animeList, onDelete, onToggle }) {
  return (
    <>
      {animeList.map((l) => (
        <tr key={l.id} style={{ borderBottom: "1px solid #ddd" }}>
          <td style={{ textAlign: "left", padding: "12px" }}>{l.id}</td>
          <td style={{ textAlign: "left", padding: "12px" }}>{l.title}</td>
          <td style={{ textAlign: "left", padding: "12px" }}>
            <select value={l.status} onChange={(e) => onToggle(l.id, e.target.value)}>
              <option value="plan_to_watch">plan_to_watch</option>
              <option value="watching">watching</option>
              <option value="completed">completed</option>
            </select>
          </td>
          <td style={{ textAlign: "left", padding: "12px" }}>{l.score}</td>
          <td style={{ textAlign: "left", padding: "12px" }}>
            <button onClick={() => onDelete(l.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </>
  );
}

function Form({
  title,
  setTitle,
  status,
  setStatus,
  score,
  setScore,
  handleSubmit,
}) {
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
        <option value="watching">watching</option>
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

export default function App() {
  const [animeList, setAnimeList] = useState([]);

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [score, setScore] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    const response = await fetch("/api/anime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title,
        status: status,
        score: Number(score),
      }),
    });

    const newAnime = await response.json();
    setAnimeList((prev) => [...prev, newAnime]);
    setTitle("");
    setStatus("");
    setScore("");
  }

  async function handleDelete(id) {
    await fetch(`/api/anime?id=${id}`, { method: "DELETE" });
    setAnimeList((prev) => prev.filter((anime) => anime.id !== id));
  }

  async function fetchAnime() {
    const response = await fetch("/api/anime");
    const data = await response.json();
    setAnimeList(data);
  }

  useEffect(() => {
    fetchAnime();
  }, []);

  async function handleToggle(id, newStatus) {
    const response = await fetch("/api/anime", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });

    const data = await response.json();
    const updatedStatus = data.status;
    setAnimeList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  }

  return (
    <>
      <div>App</div>
      {/* <ul>
        {animeList.map((a) => (
          <li>{a.title}</li>
        ))}
      </ul> */}
      <Table
        animeList={animeList}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />
      <Form
        title={title}
        setTitle={setTitle}
        status={status}
        setStatus={setStatus}
        score={score}
        setScore={setScore}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
