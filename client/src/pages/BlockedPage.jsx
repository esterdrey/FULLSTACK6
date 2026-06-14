import { useNavigate } from 'react-router-dom';
import styles from './ErrorPage.module.css';

function BlockedPage() {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <p className={styles.code}>🚫</p>
                <h1 className={styles.title}>Account Blocked</h1>
                <p className={styles.message}>
                    Your account has been blocked by an administrator.<br />
                    Please contact support for assistance.
                </p>
                <div className={styles.actions}>
                    <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                        Go to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlockedPage;
