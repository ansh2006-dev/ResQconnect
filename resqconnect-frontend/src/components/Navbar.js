import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" onClick={closeMenu}>
          <i className="fas fa-heartbeat"></i>
          <span>ResQConnect</span>
        </NavLink>
        
        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          <NavLink to="/" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-home"></i>
            <span>Home</span>
          </NavLink>
          <NavLink to="/emergency" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-exclamation-triangle"></i>
            <span>Emergency</span>
          </NavLink>
          <NavLink to="/weather" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-cloud-sun"></i>
            <span>Weather</span>
          </NavLink>
          <NavLink to="/report" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-flag"></i>
            <span>Report</span>
          </NavLink>
          <NavLink to="/status" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-tasks"></i>
            <span>Status</span>
          </NavLink>
          <NavLink to="/resources" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-book-open"></i>
            <span>Resources</span>
          </NavLink>
          <NavLink to="/contact" className={({isActive}) => isActive ? "navbar-item active" : "navbar-item"} onClick={closeMenu}>
            <i className="fas fa-envelope"></i>
            <span>Contact Us</span>
          </NavLink>
        </div>
        
        <div className="navbar-actions">
          <a href="tel:911" className="emergency-btn">
            <i className="fas fa-phone-alt"></i>
            <span>Emergency Call</span>
          </a>
          
          <button 
            className="menu-toggle" 
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
          >
            <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 