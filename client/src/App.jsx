import { useEffect } from "react";
import "./App.css";
import { UserContext } from "./UserContext";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/blocked";

  useEffect(() => {
    if (!currentUser && !isAuthPage) {
      navigate("/login", { replace: true });
      return;
    }

    if (currentUser && isAuthPage) {
      navigate("/home", { replace: true });
    }
  }, [location.pathname, isAuthPage, navigate, currentUser]);

  return (
    <UserContext.Provider value={currentUser}>
      {!isAuthPage && currentUser && <Navbar />}
      <Outlet />
    </UserContext.Provider>
  );
}

export default App;
