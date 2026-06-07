import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Posts, { loader as postsLoader } from './pages/Posts.jsx';
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children:[
      { path: 'users/:userId/posts', element: <Posts /> , loader:postsLoader       },
    ]
  },
]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
