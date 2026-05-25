import React, { useState } from 'react';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png'

const Header = () => {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* LOGO */}
        <div className="header-logo-container">
          <img
            src={logoSportlink}
            alt="SportLink Logo"
            className="header-logo-img"
          />
        </div>

        {/* NAVIGATION */}
        <nav className="header-nav">
          <ul className="header-nav-list">
            <li><a href="#inicio" className="header-nav-link">Inicio</a></li>
            <li>
              {/* Botón Oportunidades con flecha */}
              <button 
                className={`header-nav-link header-nav-dropdown-btn ${dropdownOpen ? 'active' : ''}`}
                onClick={toggleDropdown}
              >
                Oportunidades
                <svg 
                  className={`header-nav-arrow ${dropdownOpen ? 'up' : 'down'}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {/* Aquí iría el dropdown en el futuro */}
            </li>
            <li><a href="#dashboard" className="header-nav-link">Calendario</a></li>
            <li><a href="#nosotros" className="header-nav-link">Nosotros</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;