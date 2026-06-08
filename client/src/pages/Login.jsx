import { Form, redirect, useActionData, Link } from "react-router-dom";
import styles from "./Login.module.css";

export async function action({ request }) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");

  const res = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error_msg: data.message || "Invalid username or password" };
  }

  localStorage.setItem("currentUser", JSON.stringify(data.user));
  return redirect("/home");
}

function LoginPage() {
  const error = useActionData();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginCard}>
        <h2 className={styles.title}>Login</h2>

        {error && <p className={styles.error}>{error.error_msg}</p>}

        <Form method="post" className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Username:</label>
            <input
              className={styles.formInput}
              type="text"
              name="username"
              placeholder="Username"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Password:</label>
            <input
              className={styles.formInput}
              type="password"
              name="password"
              placeholder="Password"
              required
            />
          </div>

          <button className={styles.submitBtn} type="submit">
            Login
          </button>
        </Form>

        <h4>
          Don't have an account? <Link to="/register">Register here</Link>
        </h4>
      </div>
    </div>
  );
}

export default LoginPage;