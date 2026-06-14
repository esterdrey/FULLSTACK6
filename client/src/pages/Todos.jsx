import { useLoaderData,redirect } from "react-router-dom";
import { useCurrentUser } from "../UserContext";
import styles from "./Todos.module.css";
import TodoItem from "../components/TodoItem.jsx";
import { useState, useMemo } from "react";
import { useToast } from "../components/Toast.jsx";

const API = "http://localhost:3000/todos";

export const loader = async () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser?.id) return [];
  const res = await fetch(`${API}?userId=${currentUser.id}`);
  if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        if (data.message === 'Account is blocked') {
            localStorage.removeItem('currentUser');
            return redirect('/blocked');
        }
    }
  if (!res.ok) return [];
  return res.json();
};

function Todos() {
  const currentUser = useCurrentUser();
  const initialTodos = useLoaderData();
  const [todos, setTodos] = useState(initialTodos || []);
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [completedFilter, setCompletedFilter] = useState("all");
  const [sort, setSort] = useState("id");
  const [order, setOrder] = useState("ASC");
  const { showToast, ToastComponent } = useToast();

  const filtered = useMemo(() => {
    let result = [...todos];
    if (search.trim())
      result = result.filter(t => t.title.toLowerCase().includes(search.trim().toLowerCase()));
    if (completedFilter !== "all")
      result = result.filter(t => !!t.completed === (completedFilter === "true"));
    result.sort((a, b) => {
      const valA = a[sort]; const valB = b[sort];
      if (valA < valB) return order === "ASC" ? -1 : 1;
      if (valA > valB) return order === "ASC" ? 1 : -1;
      return 0;
    });
    return result;
  }, [todos, search, completedFilter, sort, order]);

  const handleUpdateTodo = async (todo) => {
    try {
      const res = await fetch(`${API}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, title: todo.title, completed: todo.completed }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch {
      showToast("Failed to update todo.", "error");
    }
  };

  const handleToggle = (todo) => handleUpdateTodo({ ...todo, completed: !todo.completed });
  const handleSaveEdit = async (todo) => { await handleUpdateTodo(todo); setEditingId(null); };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, title, completed: false }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setNewTitle("");
    } catch {
      showToast("Failed to add todo.", "error");
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      const res = await fetch(`${API}/${todoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      if (!res.ok) throw new Error();
      setTodos((prev) => prev.filter((t) => t.id !== todoId));
      showToast("Todo deleted.");
    } catch {
      showToast("Failed to delete todo.", "error");
    }
  };

  return (
    <div className={styles.todosContainer}>
      {ToastComponent}
      <h2 className={styles.heading}>Todos</h2>

      <form onSubmit={handleAddTodo} className={styles.addForm}>
        <input
          className={styles.addInput}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New todo..."
        />
        <button className={styles.addButton} type="submit" disabled={!newTitle.trim()}>
          Add
        </button>
      </form>

      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search todos..."
        />
        <div className={styles.filterGroup}>
          {["all", "false", "true"].map((val) => (
            <button
              key={val}
              className={`${styles.filterBtn} ${completedFilter === val ? styles.active : ""}`}
              onClick={() => setCompletedFilter(val)}
            >
              {val === "all" ? "All" : val === "false" ? "Pending" : "Done"}
            </button>
          ))}
        </div>
        <div className={styles.sortGroup}>
          <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="id">Sort: ID</option>
            <option value="title">Sort: Title</option>
            <option value="completed">Sort: Status</option>
          </select>
          <select className={styles.select} value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="ASC">ASC</option>
            <option value="DESC">DESC</option>
          </select>
        </div>
      </div>

      <ul className={styles.list}>
        {filtered.length === 0 && <p className={styles.empty}>No todos found.</p>}
        {filtered.map((todo) => (
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
