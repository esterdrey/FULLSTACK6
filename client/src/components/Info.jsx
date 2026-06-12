import { useState } from "react";
import styles from "./Info.module.css";

function Info({ user, onClose }) {
  const [mode, setMode] = useState("view");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    website: user?.website || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
  try {
    const res = await fetch(`http://localhost:3000/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const updatedUser = await res.json();

    if (!res.ok) {
      alert(updatedUser.message || "Failed to update profile");
      return;
    }

    const fullUpdatedUser = {
      ...user,
      ...updatedUser,
    };

    localStorage.setItem("currentUser", JSON.stringify(fullUpdatedUser));

    alert("Profile updated successfully");

    setMode("view");
    onClose();
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Error updating profile");
  }
};

  const handleChangePassword = async () => {
    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      alert("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/users/${user.id}/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldPassword: passwordData.oldPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to change password");
        return;
      }

      alert("Password changed successfully");

      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMode("view");
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Error changing password");
    }
  };

  

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 className={styles.mainTitle}>My Profile</h2>

        <div className={styles.infos}>
          <div className={styles.section}>
            {mode === "view" && (
              <>
                <h3 className={styles.sectionTitle}>Personal Info</h3>

                <p>
                  <strong>Name:</strong> {user.name || "Not provided"}
                </p>
                <p>
                  <strong>Username:</strong> {user.username || "Not provided"}
                </p>
                <p>
                  <strong>Email:</strong> {user.email || "Not provided"}
                </p>
                <p>
                  <strong>Phone:</strong> {user.phone || "Not provided"}
                </p>
                <p>
                  <strong>Website:</strong> {user.website || "Not provided"}
                </p>

                <div className={styles.actions}>
                  <button
                    className={styles.editBtn}
                    onClick={() => setMode("edit")}
                  >
                    Edit Profile
                  </button>

                  <button
                    className={styles.saveBtn}
                    onClick={() => setMode("password")}
                  >
                    Change Password
                  </button>

                 
                   
                </div>
              </>
            )}

            {mode === "edit" && (
              <>
                <h3 className={styles.sectionTitle}>Edit Profile</h3>

                <label className={styles.label}>Name</label>
                <input
                  className={styles.input}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />

                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <label className={styles.label}>Phone</label>
                <input
                  className={styles.input}
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <label className={styles.label}>Website</label>
                <input
                  className={styles.input}
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />

                <div className={styles.actions}>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    Save
                  </button>

                  <button
                    className={styles.cancelBtn}
                    onClick={() => setMode("view")}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {mode === "password" && (
              <>
                <h3 className={styles.sectionTitle}>Change Password</h3>

                <label className={styles.label}>Old Password</label>
                <input
                  className={styles.input}
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                />

                <label className={styles.label}>New Password</label>
                <input
                  className={styles.input}
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />

                <label className={styles.label}>Confirm Password</label>
                <input
                  className={styles.input}
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />

                <div className={styles.actions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleChangePassword}
                  >
                    Save Password
                  </button>

                  <button
                    className={styles.cancelBtn}
                    onClick={() => setMode("view")}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;