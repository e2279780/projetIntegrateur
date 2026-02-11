import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile = ({ userEmail }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  //changer plus tard avec api / supabase
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: userEmail || 'user@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Library Street, Montreal, QC H3A 0G4',
    joinDate: '2024-01-15'
  });

  const [formData, setFormData] = useState({ ...userData });
  const [errors, setErrors] = useState({});


  useEffect(() => {
    setFormData({ ...userData });
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address est invalid';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\(\)\-]/g, ''))) {
      newErrors.phone = 'Numero de telephone invalide';
    }
    
    return newErrors;
  };

  const handleSave = () => {
    const formErrors = validateForm();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    
  
    setTimeout(() => {
      setUserData({ ...formData });
      setIsEditing(false);
      setIsLoading(false);
      setSaveMessage('Profile updated successfully!');
      
  
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({ ...userData });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1><i className="fas fa-user-circle"></i> Mon Profile</h1>
        <p className="welcome-message">Gérer vos informations de compte</p>
        
        {saveMessage && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> {saveMessage}
          </div>
        )}
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header-section">
            <div className="avatar">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-title">
              <h2>{userData.name}</h2>
              <p className="user-email">{userData.email}</p>
              <p className="member-since">
                Member depuis {new Date(userData.joinDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i> Modifier Profile
              </button>
            )}
          </div>
          
          <div className="profile-info-section">
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-user"></i> Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Entrer votre nom complet"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>
                
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
                    placeholder="votre@email.com"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                  <div className="input-hint">
                    <i className="fas fa-info-circle"></i> Ceci va etre votre login email
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> Numero de telephone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                  <div className="input-hint">
                    <i className="fas fa-info-circle"></i> Optionel - utilisé pour les notifications
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">
                    <i className="fas fa-home"></i> Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Entre votre address complete"
                  />
                  <div className="input-hint">
                    <i className="fas fa-info-circle"></i> Optionel - utiliser pour les livraisons de livres
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i> Sauvegarder les modifications
                      </>
                    )}
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times"></i> Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="info-display">
                <div className="info-section">
                  <h3><i className="fas fa-user"></i> Informations Personnelles</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Nom complet</div>
                      <div className="info-value">{userData.name}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Email Address</div>
                      <div className="info-value">{userData.email}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Numero de telephone</div>
                      <div className="info-value">{userData.phone}</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Address</div>
                      <div className="info-value">{userData.address}</div>
                    </div>
                  </div>
                </div>
                
                <div className="info-section">
                  <h3><i className="fas fa-info-circle"></i> Compte Detaille</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Compte Status</div>
                      <div className="info-value status-active">Active</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Membre depuis</div>
                      <div className="info-value">
                        {new Date(userData.joinDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Dernier fois mis a jour</div>
                      <div className="info-value">
                        {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;