import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Posts, { loader as postsLoader } from './pages/Posts.jsx';
import Todos, {loader as todosLoader} from './pages/Todos.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      { path: 'users/:userId/posts', element: <Posts /> , loader:postsLoader       },
      {path:'users/:userId/todos',element:<Todos/>, loader:todosLoader}

    ]
  },
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
