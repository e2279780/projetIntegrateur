import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = ({ handleLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email est invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mot de passe doit contenir au moins 6 caractères';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setErrors({});
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      handleLogin(formData.email);
      navigate('/dashboard');
    }, 1000);
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@bookhaven.com',
      password: 'demo123',
      rememberMe: false
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2><i className="fas fa-sign-in-alt"></i> Login a BiblioConnect</h2>
          <p>Accédez à votre compte BiblioConnect</p>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i> Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="you@example.com"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i> Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="••••••••"
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-options">
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe">Souvenir de moi</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Mot de passe oublié?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Connexion en cours...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i> Login
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="demo-btn"
            onClick={handleDemoLogin}
          >
            <i className="fas fa-magic"></i> Essayer compte demo
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Pas de compte? <Link to="/signup">Inscription ici</Link>
          </p>
          <p className="auth-note">
            <i className="fas fa-info-circle"></i> Utilisez le compte demo pour explorer BiblioConnect sans créer de compte.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;