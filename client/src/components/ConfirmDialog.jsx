import { useState, useCallback } from 'react';
import styles from './ConfirmDialog.module.css';

export function useConfirmDialog() {
    const [state, setState] = useState(null);

    const confirm = useCallback((message) => {
        return new Promise((resolve) => {
            setState({ message, resolve });
        });
    }, []);

    const handleConfirm = () => {
        state.resolve(true);
        setState(null);
    };

    const handleCancel = () => {
        state.resolve(false);
        setState(null);
    };

    const ConfirmDialogComponent = state ? (
        <div className={styles.overlay} onClick={handleCancel}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <p className={styles.message}>{state.message}</p>
                <div className={styles.actions}>
                    <button className={styles.btnCancel} onClick={handleCancel}>Cancel</button>
                    <button className={styles.btnConfirm} onClick={handleConfirm}>Delete</button>
                </div>
            </div>
        </div>
    ) : null;

    return { confirm, ConfirmDialogComponent };
}
