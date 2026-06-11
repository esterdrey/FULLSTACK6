import { useState, useCallback } from 'react';
import styles from './Toast.module.css';

export function useToast() {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const ToastComponent = toast ? (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <span className={styles.icon}>{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.message}
        </div>
    ) : null;

    return { showToast, ToastComponent };
}
