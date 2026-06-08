import { useState, useEffect } from "react";
import "./App.css";
import { UserContext } from "./UserContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    const user = saved ? JSON.parse(saved) : null;

    setCurrentUser(user);

    // אם המשתמש לא מחובר - מותר להיות רק ב-login/register
    if (!user && !isAuthPage) {
      navigate("/login", { replace: true });
      return;
    }

    // אם המשתמש כבר מחובר - שלא יוכל להיכנס שוב ל-login/register
    if (user && isAuthPage) {
      navigate("/home", { replace: true });
      return;
    }
  }, [location.pathname, isAuthPage, navigate]);

  return (
    <UserContext.Provider value={currentUser}>
      {!isAuthPage && currentUser && <Navbar />}
      <Outlet />
    </UserContext.Provider>
  );
}

export default App;