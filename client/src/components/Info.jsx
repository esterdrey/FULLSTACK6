import styles from "./Info.module.css";

function Info({ user, onClose }) {
  if (!user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <h2 className={styles.mainTitle}>My Profile</h2>

        <div className={styles.infos}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Personal Info</h3>
            <p><strong>Name:</strong> {user.name || "Not provided"}</p>
            <p><strong>Username:</strong> {user.username || "Not provided"}</p>
            <p><strong>Email:</strong> {user.email || "Not provided"}</p>
            <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
            <p><strong>Website:</strong> {user.website || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;