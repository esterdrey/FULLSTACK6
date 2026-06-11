import { useLoaderData } from "react-router-dom";
import { useCurrentUser } from "../UserContext";
import styles from "./Todos.module.css";
import TodoItem from "../components/TodoItem.jsx";
import { useState } from "react";

const API = "http://localhost:3000/todos";

export const loader = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || !currentUser.id) {
    return [];
  }

  try {
    const res = await fetch(`${API}?userId=${currentUser.id}`);

    if (!res.ok) {
      throw new Error("Failed to fetch todos");
    }

    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
};

function Todos() {
  const currentUser = useCurrentUser();

  const initialTodos = useLoaderData();

  const [todos, setTodos] = useState(initialTodos || []);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const handleUpdateTodo = async (todo) => {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          title: todo.title,
          completed: todo.completed,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update todo");
      }

      const updated = await res.json();

      setTodos((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleToggle = (todo) => {
    handleUpdateTodo({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleSaveEdit = async (todo) => {
    await handleUpdateTodo(todo);
    setEditingId(null);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();

    const title = newTitle.trim();

    if (!title) return;

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          title,
          completed: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add todo");
      }

      const created = await res.json();

      setTodos((prev) => [...prev, created]);

      setNewTitle("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const res = await fetch(`${API}/${todoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete todo");
      }

      setTodos((prev) => prev.filter((t) => t.id !== todoId));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const sorted = [...todos].sort((a, b) => a.id - b.id);

  return (
    <div className={styles.todosContainer}>
      <h2 className={styles.heading}>Todos</h2>

      <form onSubmit={handleAddTodo} className={styles.addForm}>
        <input
          className={styles.addInput}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New todo..."
        />

        <button
          className={styles.addButton}
          type="submit"
          disabled={!newTitle.trim()}
        >
          Add
        </button>
      </form>

      <ul className={styles.list}>
        {sorted.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isEditing={editingId === todo.id}
            onStartEditing={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onSave={handleSaveEdit}
            onToggle={handleToggle}
            onDelete={handleDeleteTodo}
          />
        ))}
      </ul>
    </div>
  );
}

export default Todos;