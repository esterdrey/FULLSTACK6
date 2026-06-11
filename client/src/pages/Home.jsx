import styles from "./Home.module.css";
import { useCurrentUser } from "../UserContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}


function Home() {
  const currentUser = useCurrentUser();

  const initials = (name) =>
    name
      ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
      : "?";

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.avatar}>{initials(currentUser?.name)}</div>
        <div>
          <h2 className={styles.greeting}>
            {getGreeting()}, {currentUser?.name?.split(" ")[0]}!
          </h2>
          <p className={styles.userMeta}>
            @{currentUser?.username} · {currentUser?.email}
          </p>
        </div>
      </div>

      
      <div className={styles.infoSection}>
        <p className={styles.sectionTitle}>Profile</p>
        {[
          { icon: "👤", value: currentUser?.name },
          { icon: "🔖", value: `@${currentUser?.username}` },
          { icon: "✉️", value: currentUser?.email },
          { icon: "📞", value: currentUser?.phone },
          { icon: "🌐", value: currentUser?.website },
        ].map(({ icon, value }) => (
          <p key={value} className={styles.infoRow}>
            <span className={styles.infoIcon}>{icon}</span>
            {value}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Home;
