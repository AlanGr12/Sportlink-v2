import React from 'react';
import './footer.css';
import logoSportlink from '../assets/logoSportlink.png'

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-main">
        {/* BRAND SECTION */}
        <div className="footer-brand">
          <img
            className="footer-logo"
            src={logoSportlink}
            alt="SportLink"
          />
          <p className="footer-tagline">
            Plataforma de alto rendimiento conectando entrenadores,
            atletas de élite con clubes profesionales a través de
            análisis de datos.
          </p>
        </div>

        {/* NAVIGATION SECTION */}
        <nav className="footer-nav">
          <p className="footer-nav-title">Descubrí</p>
          <ul className="footer-nav-list">
            <li><a href="#entrenadores">Entrenadores</a></li>
            <li><a href="#clubes">Clubes</a></li>
            <li><a href="#pruebas">Pruebas</a></li>
            <li><a href="#dashboard">Calendario</a></li>
          </ul>
        </nav>

        {/* CONTACT SECTION */}
        <div className="footer-contact">
          <p className="footer-contact-title">Contacto</p>
          <ul className="footer-contact-list">
            <li>
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>
              </svg>
              <a href="mailto:sportlink.ar@gmail.com">sportlink.ar@gmail.com</a>
            </li>
            <li>
              <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
              </svg>
              <a href="https://instagram.com/sportlink.ar" target="_blank" rel="noopener noreferrer">sportlink.ar</a>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <span className="footer-copyright">
            © {currentYear} SPORTLINK. Todos los derechos reservados
          </span>
          <nav className="footer-legal">
            <a href="#terminos">Terminos y condiciones</a>
            <a href="#privacidad">Politica de privacidad</a>
            <a href="#cookies">Cookies</a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;