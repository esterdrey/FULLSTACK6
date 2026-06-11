import { useNavigate } from "react-router-dom";
import styles from "./ErrorPage.module.css";

function ErrorPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.code}>404</h1>
                <h2 className={styles.title}>Page Not Found</h2>
                <p className={styles.message}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className={styles.actions}>
                    <button className={styles.btnPrimary} onClick={() => navigate(-1)}>
                        Go Back
                    </button>
                    <button className={styles.btnSecondary} onClick={() => navigate("/home")}>
                        Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorPage;
