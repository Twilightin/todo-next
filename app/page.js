"use client";

import { useState } from "react";

function Form({ status, setStatus }) {
  return (
    <>
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="">Select a status</option>
        <option value="plan_to_watch">plan_to_watch</option>
        <option value="watching">watching</option>
        <option value="completed">completed</option>
      </select>
    </>
  );
}

export default function App() {
  const [status, setStatus] = useState("");
  return (
    <>
      <h1>Hello</h1>
      <Form status={status} setStatus={setStatus}/>
    </>
  );
}
