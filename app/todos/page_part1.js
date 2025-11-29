"use client";
import React, { useEffect, useState } from "react";

const initialTasks = [
  { id: 1, text: "Morning excuses", completed: false },
  { id: 2, text: "Reading book", completed: false },
  { id: 3, text: "Have lunch", completed: true },
];

function TasksThread({ tasks, onDelete, onToggle }) {
  return (
    <ul>
      {tasks.map((task) => (
        <TasksList
          key={task.id}
          task={task}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}

function TasksList({ task, onDelete, onToggle }) {
  return (
    <li>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span style={{textDecoration: task.completed ? "line-through" : "none"}}>
      {task.id} {task.text}</span>
      <span onClick={() => onDelete(task.id)}>❌</span>
    </li>
  );
}

function Form({ taskName, setTaskName, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="input something"
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

export default function page() {
  const [tasks, setTasks] = useState(initialTasks);
  const [taskName, setTaskName] = useState("");

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function handleToggle(id) {
    setTasks(prev => prev.map(t =>
      t.id === id ? {...t, completed: !t.completed} : t
    ))
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newTask = {
      id: Date.now(),
      text: taskName,
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setTaskName("");
  }

  return (
    <>
      <TasksThread
        tasks={tasks}
        onDelete={handleDelete}
        onToggle={handleToggle}
      />
      <Form
        taskName={taskName}
        setTaskName={setTaskName}
        onSubmit={handleSubmit}
      />
    </>
  );
}


