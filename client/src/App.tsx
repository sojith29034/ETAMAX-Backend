import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './admin/Login.tsx';
import Admin from './admin/Admin.tsx';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false); // State for loading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // State to track admin login status
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    const savedStatus = localStorage.getItem('isAdminLoggedIn');
    return savedStatus === 'true';
  });

  useEffect(() => {
    console.log('Saving Admin Login Status:', isAdminLoggedIn);
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn.toString());
  }, [isAdminLoggedIn]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/students`, formData);

      if (response.status === 200) {
        console.log('Data saved:', response.data);
        alert(`${response.data.student.rollNumber} registered successfully. Check ${response.data.student.email} inbox`);

        setFormData({
          name: '',
          rollNumber: '',
          email: ''
        });
      } else {
        console.error('Error:', response.status);
        alert('Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="container mt-5">
              <h2 className="text-center mb-4">Student Registration Form</h2>
              {isLoading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="rollNumber" className="form-label">Roll Number:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="rollNumber"
                      name="rollNumber"
                      placeholder="Enter your roll number"
                      value={formData.rollNumber}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="text-center">
                    <button type="submit" className="btn btn-primary">
                      Submit
                    </button>
                  </div>
                </form>
              )}
            </div>
          }
        />

        <Route path="/login" element={<Login onLogin={() => setIsAdminLoggedIn(true)} />} />
        <Route
          path="/admin/*"
          element={isAdminLoggedIn ? <Admin /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;