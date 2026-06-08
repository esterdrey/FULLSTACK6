import { Form, redirect, useActionData, Link } from "react-router-dom";
import styles from "./Register.module.css";

export async function action({ request }) {
  const formData = await request.formData();

  const name = formData.get("name");
  const username = formData.get("username");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const website = formData.get("website");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error_msg: "Passwords do not match." };
  }

  const res = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      username,
      email,
      phone,
      website,
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { error_msg: data.message || "Registration failed." };
  }

  localStorage.setItem("currentUser", JSON.stringify(data.user));
  return redirect("/home");
}

function Register() {
  const error = useActionData();

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.registerCard}>
        <h2 className={styles.title}>Register</h2>

        {error && <p className={styles.error}>{error.error_msg}</p>}

        <Form method="post" className={styles.registerForm}>
          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Name:</label>
            <input className={styles.formInput} type="text" name="name" required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Username:</label>
            <input className={styles.formInput} type="text" name="username" required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Email:</label>
            <input className={styles.formInput} type="email" name="email" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Phone:</label>
            <input className={styles.formInput} type="text" name="phone" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Website:</label>
            <input className={styles.formInput} type="text" name="website" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Password:</label>
            <input className={styles.formInput} type="password" name="password" required />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.formLabel}>Confirm Password:</label>
            <input
              className={styles.formInput}
              type="password"
              name="confirmPassword"
              required
            />
          </div>

          <button className={styles.submitBtn} type="submit">
            Register
          </button>
        </Form>

        <h4>
          Already have an account? <Link to="/login">Login here</Link>
        </h4>
      </div>
    </div>
  );
}

export default Register;