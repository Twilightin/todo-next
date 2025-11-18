"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const initialTasks = [
  { id: 1, text: "Morning excuses", completed: false },
  { id: 2, text: "Reading book", completed: false },
  { id: 3, text: "Have lunch", completed: false },
];

export default function DiyPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    
    const trimmedTask = newTask.trim();
    if (!trimmedTask) return;
    
    const item = {
      id: Date.now(),
      text: trimmedTask,
      completed: false,
    };
    
    setTasks(prev => [...prev, item]);
    setNewTask("");
  }

  function handleDelete(index) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  function handleToggle(index) {
    setTasks((prev) =>
      prev.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">DIY Page</h1>
      <Form 
        handleSubmit={handleSubmit}
        newTask={newTask}
        setNewTask={setNewTask}
      />
      <TasksList
        tasks={tasks}
        handleDelete={handleDelete}
        handleToggle={handleToggle}
      />
    </div>
  );
}


function TasksList({ tasks, handleDelete, handleToggle }) {
  return (
    <ul className="space-y-2">
      {tasks.map((task, index) => (
        <Tasks
          task={task}
          key={index}
          onDelete={() => handleDelete(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </ul>
  );
}

function Tasks({ task, onDelete, onToggle }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="cursor-pointer"
      />
      <span className={task.completed ? "line-through text-gray-500" : ""}>
        {task.text}
      </span>
      <span
        onClick={onDelete}
        className="ml-auto cursor-pointer hover:scale-110 transition-transform"
      >
        ❌
      </span>
    </li>
  );
}

function Form({ handleSubmit, newTask, setNewTask }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="text"
        placeholder="Input your task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <Button type="submit">Add Task</Button>
    </form>
  );
}
