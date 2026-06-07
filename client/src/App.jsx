import { useState } from 'react'
import './App.css'
import { UserContext } from './UserContext';
import { Outlet } from 'react-router-dom';


function App() {
  // const [currentUser, setCurrentUser] = useState(() => {
  //   const saved = localStorage.getItem('currentUser');
  //   return saved ? JSON.parse(saved) : null;
  // });
   const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Lea',
    email: 'lea@example.com'
   });

  return (
    <UserContext.Provider value={currentUser}>
      <Outlet />
    </UserContext.Provider>
  )

  
}

export default App
