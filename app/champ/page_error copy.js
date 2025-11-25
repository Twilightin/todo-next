"use client";

import React, { useState } from "react";

function Form({ handleSubmit, setName}) {
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="input Champ Name..." onChange={(e) => setName(e.target.value)}></input>
      <button type="submit">Search</button>
    </form>
  );
}

export default function App() {
  const [name, setName] = useState("");
  const [info, setInfo] = useState(undefined);

  async function handleSubmit({ e, setInfo }) {
    e.preventDefault();

    const response = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/15.23.1/data/en_US/champion/${name}.json`
    );
    const data = await response.json();
    console.log(data);
    setInfo(data);
  }

  return (
    <>
      <h1>leagueoflegends Champions</h1>
      <Form handleSubmit={handleSubmit} setName={setName} setInfo={setInfo} />
      <div>{info ? JSON.stringify(info) : "No data yet"}</div>
    </>
  );
}
