"use client";
import React, { useEffect, useState } from "react";

// const initialTasks = [
//   { id: 1, text: "Morning excuses", completed: false },
//   { id: 2, text: "Reading book", completed: false },
//   { id: 3, text: "Have lunch", completed: true },
// ];

function TaskThread({ tasks, onToggle, onDelete }) {
  return (
    <ul>
      {tasks.map((t) => (
        <TaskList key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}

function TaskList({ task, onToggle, onDelete }) {
  return (
    <li>
      <span
        style={{ textDecoration: task.completed ? "line-through" : "none" }}
      >
        {task.id} {task.text}
      </span>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <button onClick={() => onDelete(task.id)}>❌</button>
    </li>
  );
}

function Form({ onSubmit, taskText, setTaskText }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={taskText}
        placeholder="input text..."
        onChange={(e) => setTaskText(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

// ------------------------------------------------------------------------

export default function Page() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    const response = await fetch("/api/todos");
    const data = await response.json();
    setTasks(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!taskText.trim()) return;

    const response = await fetch("/api/todos", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text: taskText}),
    })

    // const newTask = {
    //   id: Date.now(),
    //   text: taskText,
    //   completed: false,
    // };

    const newTask = await response.json()
    // console.log("🙅‍♀️", newTask)
    setTasks((prev) => [...prev, newTask]);
    setTaskText("");
  }

  async function handleToggle(id) {

    const response = await fetch(`/api/todos?id=${id}`, {
        method: "PATCH"
    })

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  async function handleDelete(id) {

    // 💥
    // const body = await fetch("/api/todos", {
    //     method: "DELETE",
    //     headers: {"Content-Type": "application/json"},
    //     body: JSON.stringify({ id: id}),
    // })

    const body = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE"
    })

    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <>
      <h1>Simple Todo-List</h1>
      <TaskThread
        tasks={tasks}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
      <Form
        onSubmit={handleSubmit}
        taskText={taskText}
        setTaskText={setTaskText}
      />
    </>
  );
}
