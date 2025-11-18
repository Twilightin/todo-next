// ============================================
// CLIENT COMPONENT DIRECTIVE
// ============================================
// "use client" tells Next.js this component runs in the BROWSER (client-side)
// You NEED this when using:
// - useState, useEffect (React hooks)
// - Browser APIs (window, document, fetch from browser)
// - Event handlers (onClick, onChange)
// 
// Without "use client", Next.js assumes it's a SERVER COMPONENT (runs on server only)
"use client";

import { Input } from "../components/ui/input.js";
import { Button } from "../components/ui/button.js";
// Import React hooks for managing state and side effects
import { useState, useEffect } from "react";

export default function DiyPage() {
  // ============================================
  // STATE MANAGEMENT (React Hooks)
  // ============================================
  
  // useState creates a "state variable" that React tracks
  // When state changes, React re-renders the component
  const [tasks, setTasks] = useState([]);
  // tasks = current value (starts as empty array [])
  // setTasks = function to update tasks
  
  const [newTask, setNewTask] = useState("");
  // Tracks what user types in the input field
  
  const [loading, setLoading] = useState(true);
  // Tracks if we're still fetching data from API
  // Starts as true because we fetch data immediately

  // ============================================
  // SIDE EFFECTS (useEffect Hook)
  // ============================================
  // useEffect runs code AFTER the component renders
  // Think of it as "do something when the page loads"
  useEffect(() => {
    fetchTodos(); // Call our function to get todos from database
  }, []); 
  // The empty array [] means: "only run this ONCE when component first loads"
  // If you had [tasks], it would run every time tasks changes

  // ============================================
  // FETCH DATA FROM API (GET Request)
  // ============================================
  async function fetchTodos() {
    try {
      // fetch() is a browser API for making HTTP requests
      // It sends a request to our Next.js API route at /api/todos
      const response = await fetch("/api/todos");
      // await = "wait for this to finish before continuing"
      // response contains the HTTP response (status, headers, body)
      
      // Check if the request was successful (status 200-299)
      if (!response.ok) throw new Error("Failed to fetch");
      
      // .json() converts the response body from JSON string to JavaScript object/array
      const data = await response.json();
      // data will be an array like: [{ id: 1, text: "...", completed: false }, ...]
      
      // Update our state with the data from database
      setTasks(data);
      
    } catch (error) {
      // If anything goes wrong (network error, server error), catch it here
      console.error("Error fetching todos:", error);
      
    } finally {
      // finally runs whether try succeeds or fails
      // We're done loading, so set loading to false
      setLoading(false);
    }
  }

  // ============================================
  // CREATE NEW TODO (POST Request)
  // ============================================
  async function handleSubmit(e) {
    // Prevent default form submission (which would refresh the page)
    e.preventDefault();
    
    // Remove spaces from beginning and end of input
    const trimmedTask = newTask.trim();
    // Don't do anything if input is empty
    if (!trimmedTask) return;
    
    try {
      // Send POST request to create new todo
      const response = await fetch("/api/todos", {
        method: "POST", // HTTP method (POST = create new resource)
        headers: { 
          "Content-Type": "application/json" // Tell server we're sending JSON
        },
        body: JSON.stringify({ text: trimmedTask }), // Convert object to JSON string
        // Server receives: {"text": "whatever user typed"}
      });
      
      if (!response.ok) throw new Error("Failed to create todo");
      
      // Server returns the newly created todo with id and other fields
      const newTodo = await response.json();
      // newTodo = { id: 4, text: "...", completed: false, created_at: "..." }
      
      // Update state by adding new todo to the end of existing array
      setTasks(prev => [...prev, newTodo]);
      // prev = previous state, ...prev = spread operator (copy all items)
      // Result: old todos + new todo
      
      // Clear the input field
      setNewTask("");
      
    } catch (error) {
      console.error("Error creating todo:", error);
    }
  }

  // ============================================
  // DELETE TODO (DELETE Request)
  // ============================================
  async function handleDelete(id) {
    try {
      // Send DELETE request with todo id in URL query parameter
      const response = await fetch(`/api/todos?id=${id}`, {
        method: "DELETE", // HTTP method (DELETE = remove resource)
      });
      // URL becomes: /api/todos?id=1 (for example)
      
      if (!response.ok) throw new Error("Failed to delete");
      
      // Remove the deleted todo from our local state
      setTasks(prev => prev.filter(task => task.id !== id));
      // filter() creates new array with only items where condition is true
      // Keep all todos EXCEPT the one we just deleted
      
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  }

  // ============================================
  // UPDATE TODO (PATCH Request)
  // ============================================
  async function handleToggle(id, completed) {
    try {
      // Send PATCH request to update todo's completed status
      const response = await fetch("/api/todos", {
        method: "PATCH", // HTTP method (PATCH = update part of resource)
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          id, // Which todo to update
          completed: !completed // Toggle: if true → false, if false → true
        }),
      });
      
      if (!response.ok) throw new Error("Failed to update");
      
      // Server returns the updated todo
      const updatedTodo = await response.json();
      
      // Update our local state with the changed todo
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTodo : task
      ));
      // map() creates new array by transforming each item
      // If task id matches, replace with updatedTodo, otherwise keep original
      
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  }

  // ============================================
  // CONDITIONAL RENDERING
  // ============================================
  // While data is loading, show a simple loading message
  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <p>Loading todos...</p>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER (After loading is done)
  // ============================================
  // This is what users see - the main UI
  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-4">DIY Page</h1>
      {/* Pass functions and state as props to child components */}
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

// ============================================
// CHILD COMPONENTS (These only handle UI display)
// ============================================

function TasksList({ tasks, handleDelete, handleToggle }) {
  // Receives tasks array and functions from parent
  return (
    <ul className="space-y-2">
      {/* map() loops through each task and creates a <Tasks> component for it */}
      {tasks.map((task) => (
        <Tasks
          task={task}
          key={task.id} // React needs unique key for each item in a list
          onDelete={() => handleDelete(task.id)} // Pass task's id to delete function
          onToggle={() => handleToggle(task.id, task.completed)} // Pass id and current status
        />
      ))}
    </ul>
  );
}

function Tasks({ task, onDelete, onToggle }) {
  // Displays a single todo item
  return (
    <li className="flex items-center gap-2 text-sm">
      {/* Checkbox to toggle completed status */}
      <input
        type="checkbox"
        checked={task.completed} // Checked if completed is true
        onChange={onToggle} // When clicked, call onToggle function
        className="cursor-pointer"
      />
      {/* Todo text with strikethrough if completed */}
      <span className={task.completed ? "line-through text-gray-500" : ""}>
        {task.text}
      </span>
      {/* Delete button (emoji) */}
      <span
        onClick={onDelete} // When clicked, call onDelete function
        className="ml-auto cursor-pointer hover:scale-110 transition-transform"
      >
        ❌
      </span>
    </li>
  );
}

function Form({ handleSubmit, newTask, setNewTask }) {
  // Form for adding new todos
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input field for typing new todo */}
      <Input
        type="text"
        placeholder="Input your task..."
        value={newTask} // Controlled input - value comes from state
        onChange={(e) => setNewTask(e.target.value)} // Update state when user types
      />
      {/* Submit button */}
      <Button type="submit">Add Task</Button>
    </form>
  );
}
