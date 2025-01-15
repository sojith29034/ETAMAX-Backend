import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './admin/Login.tsx';
import Admin from './admin/Admin.tsx';

function App() {
  // State to track admin login status
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const savedStatus = localStorage.getItem('isAdminLoggedIn');
    return savedStatus === 'true';
  });

  useEffect(() => {
    console.log('Saving Admin Login Status:', isAdminLoggedIn);
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn.toString());
  }, [isAdminLoggedIn]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" />}
        />

        <Route
          path="/login"
          element={<Login onLogin={() => setIsAdminLoggedIn(true)} />}
        />
        <Route
          path="/admin/*"
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;