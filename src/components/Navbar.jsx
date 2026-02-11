import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userEmail, handleLogout }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <i className="fas fa-book"></i>
            <span>BiblioConnect</span>
          </Link>
        </div>
        
        <div className="navbar-menu">
          {isLoggedIn ? (
            <div className="navbar-user">
              <div className="nav-links">
                <Link to="/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> Dashboard
                </Link>
                <Link to="/profile" className="nav-link">
                  <i className="fas fa-user-circle"></i> Profile
                </Link>
              </div>
              <span className="user-email">
                <i className="fas fa-user"></i> {userEmail}
              </span>
              <button onClick={handleLogoutClick} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="auth-btn login-btn">
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link to="/signup" className="auth-btn signup-btn">
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// testing

export default Navbar;