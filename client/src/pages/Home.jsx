import { useNavigate, useLoaderData } from "react-router-dom";
import styles from "./Home.module.css";
import { useCurrentUser } from "../UserContext";

export const loader = async () => {
  const storedUser = localStorage.getItem("currentUser");

  if (!storedUser) return null;

  const currentUser = JSON.parse(storedUser);
  const uid = currentUser.id;

  if (!uid) return null;

  const [todosRes, postsRes] = await Promise.all([
    fetch(`http://localhost:3000/todos?userId=${uid}`),
    fetch(`http://localhost:3000/posts?userId=${uid}`),
  ]);

  const todos = await todosRes.json();
  const posts = await postsRes.json();

  return {
    todos: Array.isArray(todos) ? todos.length : 0,
    posts: Array.isArray(posts) ? posts.length : 0,
    completed: Array.isArray(todos)
      ? todos.filter((t) => t.completed).length
      : 0,
  };
};

function Home() {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const stats = useLoaderData();

  if (!stats) {
    return <div className={styles.container}>Loading...</div>;
  }

  const initials = (name) =>
    name
      ? name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";

  const completionPct =
    stats.todos > 0 ? Math.round((stats.completed / stats.todos) * 100) : 0;

  const cards = [
    {
      label: "Todos",
      value: stats.todos,
      sub: `${stats.completed} of ${stats.todos} completed`,
      icon: "✅",
      path: `/users/${currentUser?.id}/todos`,
      extra: stats.todos > 0 && (
        <div>
          <div className={styles.progressHeader}>
            <span>Progress</span>
            <span>{completionPct}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Posts",
      value: stats.posts,
      sub: `${stats.posts} post${stats.posts !== 1 ? "s" : ""} published`,
      icon: "📝",
      path: `/users/${currentUser?.id}/posts`,
    },
  ];

  const accountRows = [
    ["Username", currentUser?.username || "Not set"],
    ["Email", currentUser?.email || "Not set"],
    ["Phone", currentUser?.phone || "Not set"],
    ["Website", currentUser?.website || "Not set"],
  ];

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.avatar}>{initials(currentUser?.name)}</div>

        <div>
          <h2 className={styles.userName}>
            Welcome back, {currentUser?.name?.split(" ")[0]}!
          </h2>
          <p className={styles.userMeta}>
            @{currentUser?.username} · {currentUser?.email}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {cards.map((card) => (
          <div
            key={card.label}
            className={styles.statCard}
            onClick={() => navigate(card.path)}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>{card.icon}</span>
              <span className={styles.cardBadge}>{card.label}</span>
            </div>

            <div className={styles.cardValue}>{card.value}</div>
            <div className={styles.cardSub}>{card.sub}</div>
            {card.extra}
          </div>
        ))}
      </div>

      <div className={styles.accountSection}>
        <p className={styles.accountTitle}>Account details</p>

        <div className={styles.accountGrid}>
          {accountRows.map(([label, val]) => (
            <p key={label} className={styles.accountRow}>
              <span className={styles.accountLabel}>{label}:</span> {val}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;