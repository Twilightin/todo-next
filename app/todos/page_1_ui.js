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
        {tasks.map((t) => (
          <TaskList key={t.id} task={t} onToggle={onToggle} onDelete={onDelete}/>
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

export default function Page() {
  const [tasks, setTasks] = useState(initialTasks);
  const [taskText, setTaskText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if(!taskText.trim()) return
    const newTask = {
      id: Date.now(),
      text: taskText,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskText("");
  }

  function handleToggle(id) {
    setTasks(prev => prev.map(task =>
        task.id === id ? {...task, completed: !task.completed} : task
    ))
  }
  
  function handleDelete(id) {
    setTasks(prev => prev.filter(task =>
        task.id !== id
    ))
  }

  return (
    <>
      <h1>Simple Todo-List</h1>
      <TaskThread tasks={tasks} onToggle={handleToggle} onDelete={handleDelete}/>
      <Form onSubmit={handleSubmit} taskText={taskText} setTaskText={setTaskText}/>
    </>
  );
}


