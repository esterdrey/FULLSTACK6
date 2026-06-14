import { useLoaderData, redirect } from "react-router-dom";
import { useState } from "react";
import styles from "./AdminPanel.module.css";
import { useToast } from "../components/Toast.jsx";

export const loader = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) return redirect("/home");

    const adminCheck = await fetch(`http://localhost:3000/users/check-admin?userId=${currentUser.id}`);
    if (!adminCheck.ok) return redirect("/home");

    const res = await fetch(`http://localhost:3000/users?userId=${currentUser.id}`);
    if (!res.ok) throw new Error('Failed to fetch users');
    const users = await res.json();
    return { users, currentUserId: currentUser.id };
};

function AdminPanel() {
    const { users: initialUsers, currentUserId } = useLoaderData();
    const [users, setUsers] = useState(initialUsers.filter(u => u.id !== currentUserId));
    const { showToast, ToastComponent } = useToast();

    const toggleBlock = async (user) => {
        const newBlocked = !user.blocked;
        try {
            const res = await fetch(`http://localhost:3000/users/${user.id}/block`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocked: newBlocked, currentUserId }),
            });
            if (!res.ok) throw new Error();
            setUsers(prev =>
                prev.map(u => u.id === user.id
                    ? { ...u, blocked: newBlocked, login_attempts: newBlocked ? u.login_attempts : 0 }
                    : u)
            );
            showToast(newBlocked ? 'User blocked.' : 'User unblocked.');
        } catch {
            showToast('Failed to update user status.', 'error');
        }
    };

    return (
        <div className={styles.container}>
            {ToastComponent}
            <h1 className={styles.title}>Admin Panel</h1>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Website</th>
                            <th>Failed Logins</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className={user.blocked ? styles.blockedRow : ""}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>{user.website}</td>
                                <td>
                                    <span className={user.login_attempts > 0 ? styles.attemptsWarn : ''}>
                                        {user.login_attempts ?? 0}
                                    </span>
                                </td>
                                <td>
                                    <span className={user.blocked ? styles.badgeBlocked : styles.badgeActive}>
                                        {user.blocked ? "Blocked" : "Active"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={user.blocked ? styles.btnUnblock : styles.btnBlock}
                                        onClick={() => toggleBlock(user)}
                                    >
                                        {user.blocked ? "Unblock" : "Block"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPanel;
