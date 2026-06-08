import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import LoginPage, { action as loginAction } from "./pages/Login.jsx";
import Posts, { loader as postsLoader } from "./pages/Posts.jsx";
import Todos, { loader as todosLoader } from "./pages/Todos.jsx";
import Register, { action as registerAction } from "./pages/Register.jsx";
import Home, { loader as homeLoader } from "./pages/Home.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <LoginPage />, action: loginAction },
      { path: "users/:userId/posts", element: <Posts />, loader: postsLoader },
      { path: "users/:userId/todos", element: <Todos />, loader: todosLoader },
      { path: "register", element: <Register />, action: registerAction },
      { path: "home", element: <Home />, loader: homeLoader },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);