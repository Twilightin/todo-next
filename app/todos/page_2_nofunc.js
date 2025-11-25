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
        <TaskList key={task.id} task={task} />
      ))}
    </ul>
  );
}

function TaskList({ task, onToggle, onDelete }) {
  return (
    <li>
      <span>{task.id} {task.text}</span>
      <input type="checkbox" checked={task.completed} onChange={onToggle} />
      <span onClick={onDelete}>❌</span>
    </li>
  );
}

function Form({ onSubmit, taskText, setTaskText}) {
  return <form onSubmit={onSubmit}>
    <input type="text" placeholder="input task..." value={taskText} onChange={e=>setTaskText(e.target.value)}/>
    <button type="submit">Add Task</button>
  </form>
}

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [taskText, setTaskText] = useState("")

  function handleToggle() {
  }

  function handleSubmit() {
  }

  function handleDelete() {
  }
  
  return (
    <>
      <h1>Todo List</h1>
      <TaskThread tasks={tasks} onToggle={handleToggle} onDelete={handleDelete}/>
      <Form onSubmit={handleSubmit} taskText={taskText} setTaskText={setTaskText}/>
    </>
  );
}
