import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    // Store in localStorage for persistence
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
  };

  // Check localStorage on initial load
  React.useEffect(() => {
    const storedLogin = localStorage.getItem('isLoggedIn');
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedLogin === 'true' && storedEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar 
          isLoggedIn={isLoggedIn} 
          userEmail={userEmail} 
          handleLogout={handleLogout} 
        />
        <div className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Login handleLogin={handleLogin} />
              } 
            />
            <Route 
              path="/signup" 
              element={
                isLoggedIn ? 
                <Navigate to="/dashboard" /> : 
                <Signup handleLogin={handleLogin} />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isLoggedIn ? 
                <Dashboard userEmail={userEmail} /> : 
                <Navigate to="/login" />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;