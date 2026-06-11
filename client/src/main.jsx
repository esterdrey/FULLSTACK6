import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

import LoginPage, { action as loginAction } from "./pages/Login.jsx";
import MyPosts, { loader as myPostsLoader } from "./pages/MyPosts.jsx";
import AllPosts,{loader as allPostsLoader} from "./pages/AllPosts.jsx";
import Todos, { loader as todosLoader } from "./pages/Todos.jsx";
import Register, { action as registerAction } from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import Albums, {loader as albumsLoader} from "./pages/Albums.jsx"
import Album, {loader as albumLoader} from "./pages/Album.jsx"
import ErrorPage from "./pages/ErrorPage.jsx";
import AdminPanel,{loader as adminLoader} from "./pages/AdminPanel.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "login", element: <LoginPage />, action: loginAction },
      { path: "users/:username/posts", element: <MyPosts />, loader: myPostsLoader },
      { path: "posts", element: <AllPosts />, loader: allPostsLoader },
      { path: "users/:username/todos", element: <Todos />, loader: todosLoader },
      {path:"users/:username/albums",element:<Albums/> , loader: albumsLoader},
      {path:"users/:username/albums/:id",element:<Album/>,loader:albumLoader},
      { path: "register", element: <Register />, action: registerAction },
      { path: "home", element: <Home /> },
      {path:"admin", element:<AdminPanel/>,loader:adminLoader },
      {path:"*",element:<ErrorPage/>}
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);