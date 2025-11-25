"use client";
import React, { useState } from "react";

const initialTasks = [
  { id: 1, text: "Morning excuses", completed: false },
  { id: 2, text: "Reading book", completed: false },
  { id: 3, text: "Have lunch", completed: true },
];

function TaskThread({ tasks, onToggle, onDelete }) {
  return (
    <ul>
      {tasks.map((task) => (
        <TaskList key={task.id} task={task} onToggle={onToggle} onDelete={onDelete}/>
      ))}
    </ul>
  );
}

function TaskList({ task, onToggle, onDelete }) {
  return (
    <li>
      <span>
        {task.id} {task.text}
      </span>
      <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} />
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
  const [tasks, setTasks] = useState(initialTasks);
  const [taskText, setTaskText] = useState("");

  function handleToggle(id) {
    setTasks(prev => prev.map(task =>
      task.id === id ? {...task, completed: !task.completed} : task
    ))
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!taskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskText("");
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

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
