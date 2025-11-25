"use client";
import React, { useEffect, useState } from "react";

const initialTasks = [
  { id: 1, text: "Morning excuses", completed: false },
  { id: 2, text: "Reading book", completed: false },
  { id: 3, text: "Have lunch", completed: true },
];

function TaskThread({ tasks, onToggle, onDelete }) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskList
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
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
      <span onClick={() => onDelete(task.id)}>❌</span>
    </li>
  );
}

function Form({ onSubmit, taskText, setTaskText }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="input task..."
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  async function handleToggle(id) {
    // const response = await fetch(`/api/todos?id=${id}`, {
    //   method: "PATCH"
    // })

    const task = tasks.find((t) => t.id === id);

    const response = await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        text: "(*)" + task.text,
        completed: !task.completed,
      }),
    });

    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed, text: "(*)" + task.text }
          : task
      )
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!taskText.trim()) return;

    // const newTask = {
    //   id: Date.now(),
    //   text: taskText,
    //   completed: false,
    // };
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: taskText }),
    });

    const newTask = await response.json();
    setTasks((prev) => [...prev, newTask]);
    setTaskText("");
  }

  async function handleDelete(id) {
    const response = await fetch(`/api/todos?id=${id}`, {
      method: "DELETE",
    });
    // const data = await response.json()
    // console.log(data)
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  async function fetchTasks() {
    const response = await fetch("/api/todos");
    const data = await response.json();
    setTasks(data);
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <>
      <h1>Todo List</h1>
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
