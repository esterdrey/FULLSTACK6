import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCurrentUser } from "../UserContext";
import Info from "./Info";
import styles from "./Navbar.module.css";

function Navbar() {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const [showInfo, setShowInfo] = useState(false);

  if (!currentUser) return null;

  const logout = () => {
    localStorage.removeItem("currentUser");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.logo}>JSON App</div>

        <div className={styles.links}>
          <NavLink to="/home">Home</NavLink>
          <NavLink to={`/users/${currentUser.id}/todos`}>Todos</NavLink>
          <NavLink to={`/users/${currentUser.id}/posts`}>Posts</NavLink>

          <button onClick={() => setShowInfo(true)}>Info</button>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      {showInfo && (
        <Info user={currentUser} onClose={() => setShowInfo(false)} />
      )}
    </>
  );
}

export default Navbar;