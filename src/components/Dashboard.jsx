import React from 'react';
import './Dashboard.css';

const Dashboard = ({ userEmail }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1><i className="fas fa-tachometer-alt"></i> Dashboard</h1>
        <p className="welcome-message">Bienvenue, {userEmail || 'Reader'}!</p>
        <div className="api-note">
          <i className="fas fa-code"></i> data
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="empty-dashboard">
          <div className="empty-icon">
            <i className="fas fa-database"></i>
          </div>
          <h3>data</h3>
          <p>
            data
            <br />
            data
          </p>
          <div className="api-tips">
            <h4><i className="fas fa-lightbulb"></i> data:</h4>
            <ul>
              <li>data</li>
              <li>data</li>
              <li>data</li>
              <li>data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;