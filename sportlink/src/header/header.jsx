import React, { useState } from 'react';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png';
import iconMensajes from '../assets/mensajes.png';
import iconNotis from '../assets/notis.png';

const Header = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Si no llegó usuario por props, lo busca en localStorage
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');
  // true si hay usuario, false si es null
  const estaLogueado = !!usuario;
   // Obtiene el tipo de usuario (jugador/entrenador/club) sin romper si usuario es null
  const userRole = usuario?.tipousuario || null;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

    // Caso 1: no hay usuario → mostrar círculo gris
  const renderAvatar = () => {
    if (!estaLogueado) {
      return (
        <div
          className="header-avatar"
          title="Iniciar Sesión"
          onClick={() => {
            if (props.cambiarVista) props.cambiarVista('login');
          }}
        />
      );
    }

      // Caso 2: hay usuario con foto → mostrar la imagen
    if (usuario.fotoperfil) {
      return (
        <div
          className="header-avatar header-avatar--logueado"
          title={usuario.nombre || usuario.email}
        >
          <img
            src={usuario.fotoperfil}
            alt="Foto de perfil"
            className="header-avatar-img"
          />
        </div>
      );
    }

      // Caso 3: hay usuario pero sin foto → mostrar la inicial
    const iniciales = usuario.nombre
      ? usuario.nombre.charAt(0).toUpperCase()
      : usuario.email.charAt(0).toUpperCase();

    return (
      <div
        className="header-avatar header-avatar--logueado header-avatar--iniciales"
        title={usuario.nombre || usuario.email}
      >
        {iniciales}
      </div>
    );
  };

  const renderDropdownItems = () => {
    switch (userRole) {
      case 'jugador':
        return (
          <>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">🏆</div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Postúlate a las convocatorias activas de los clubes oficiales.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">⚽</div>
              <div>
                <div className="header-dropdown-title">Entrenamientos</div>
                <div className="header-dropdown-desc">Encuentra rutinas enfocadas en el alto rendimiento profesional.</div>
              </div>
            </div>
          </>
        );
      case 'entrenador':
        return (
          <>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">💼</div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Postúlate a vacantes técnicas de clubes y academias.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">🏆</div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Gestiona u observa las convocatorias del mercado de pases.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">⏱️</div>
              <div>
                <div className="header-dropdown-title">Entrenamientos</div>
                <div className="header-dropdown-desc">Diseña y planifica sesiones tácticas avanzadas.</div>
              </div>
            </div>
          </>
        );
      case 'club':
        return (
          <>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">💼</div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Publica ofertas para reclutar staff técnico calificado.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">🏆</div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Organiza pruebas para captar jóvenes promesas.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">🏋️</div>
              <div>
                <div className="header-dropdown-title">Entrenamientos</div>
                <div className="header-dropdown-desc">Supervisa los planes físicos y técnicos de tus planteles.</div>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <header className="header">
      <div className="header-container">

        {/* LOGO */}
        <div className="header-logo-container">
          <a href="/">
            <img
              src={logoSportlink}
              alt="SportLink Logo"
              className="header-logo-img"
            />
          </a>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="header-nav">
          <ul className="header-nav-list">
            <li className="header-nav-item-relative">
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

              {dropdownOpen && (
                <div className="header-dropdown-menu">
                  {renderDropdownItems()}
                </div>
              )}
            </li>
            <li><a href="#entrenadores" className="header-nav-link">Entrenadores</a></li>
            <li><a href="#clubes" className="header-nav-link">Clubes</a></li>
            <li><a href="#calendario" className="header-nav-link">Calendario</a></li>
          </ul>
        </nav>

        {/* ACCIONES DERECHA */}
        <div className="header-actions">
          <button className="header-action-btn">
            <img src={iconMensajes} alt="Mensajes" className="header-action-icon" />
          </button>
          <button className="header-action-btn">
            <img src={iconNotis} alt="Notificaciones" className="header-action-icon" />
          </button>
          {renderAvatar()}
        </div>

      </div>
    </header>
  );
};

export default Header;
