import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png';
import iconMensajes from '../assets/mensajes.png';
import iconNotis from '../assets/notis.png';

const Header = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const avatarRef = useRef(null);

  // Si no llegó usuario por props, lo busca en localStorage
  const usuario = props.usuario || JSON.parse(localStorage.getItem('usuario') || 'null');
  // true si hay usuario, false si es null
  const estaLogueado = !!usuario;
   // Obtiene el tipo de usuario (jugador/entrenador/club) sin romper si usuario es null
  const userRole = usuario?.tipousuario || null;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleAvatarDropdown = (e) => {
    // prevent nav dropdown toggle when clicking avatar
    e && e.stopPropagation();
    setAvatarDropdownOpen(!avatarDropdownOpen);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('usuario');
    } catch (err) {
      // ignore
    }
    setAvatarDropdownOpen(false);
    // recargar la app para volver al estado sin sesión iniciada
    window.location.reload();
  };

  const openMiPerfilView = () => {
    setAvatarDropdownOpen(false);
    if (props.cambiarVista) props.cambiarVista('miperfil');
  };

  // Cerrar dropdown del avatar al hacer click fuera
  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!avatarRef.current) return;
      if (!avatarRef.current.contains(event.target)) {
        setAvatarDropdownOpen(false);
      }
    };

    if (avatarDropdownOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
    }

    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [avatarDropdownOpen]);

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
        <div className="header-avatar-wrapper" ref={avatarRef}>
          <div
            className="header-avatar header-avatar--logueado"
            title={usuario.nombre || usuario.email}
            onClick={toggleAvatarDropdown}
          >
            <img
              src={usuario.fotoperfil}
              alt="Foto de perfil"
              className="header-avatar-img"
            />
          </div>

          {avatarDropdownOpen && (
            <div className="header-dropdown-menu header-dropdown-menu--avatar">
              <div
                className="header-dropdown-item"
                onClick={openMiPerfilView}
              >
                <div className="header-dropdown-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.7-9.8 5v2.2h19.6V19.2c0-3.3-6.5-5-9.8-5z" />
                  </svg>
                </div>
                <div>
                  <div className="header-dropdown-title">Ver mi perfil</div>
                </div>
              </div>

              <div
                className="header-dropdown-item header-dropdown-item--logout"
                onClick={handleLogout}
              >
                <div className="header-dropdown-icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M10 17l5-5-5-5v3H3v4h7v3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-0.9 2-2V5c0-1.1-0.9-2-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="header-dropdown-title header-dropdown-title--logout">Cerrar sesión</div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

      // Caso 3: hay usuario pero sin foto → mostrar la inicial
    const iniciales = usuario.nombre
      ? usuario.nombre.charAt(0).toUpperCase()
      : usuario.email.charAt(0).toUpperCase();

    return (
      <div className="header-avatar-wrapper" ref={avatarRef}>
        <div
          className="header-avatar header-avatar--logueado header-avatar--iniciales"
          title={usuario.nombre || usuario.email}
          onClick={toggleAvatarDropdown}
        >
          {iniciales}
        </div>

        {avatarDropdownOpen && (
          <div className="header-dropdown-menu header-dropdown-menu--avatar">
            <div className="header-dropdown-item" onClick={openMiPerfilView}>
              <div className="header-dropdown-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M12 12c2.7 0 4.9-2.2 4.9-4.9S14.7 2.2 12 2.2 7.1 4.4 7.1 7.1 9.3 12 12 12zm0 2.2c-3.3 0-9.8 1.7-9.8 5v2.2h19.6V19.2c0-3.3-6.5-5-9.8-5z" />
                </svg>
              </div>
              <div>
                <div className="header-dropdown-title">Ver mi perfil</div>
              </div>
            </div>

            <div
              className="header-dropdown-item header-dropdown-item--logout"
              onClick={handleLogout}
            >
              <div className="header-dropdown-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M10 17l5-5-5-5v3H3v4h7v3zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-0.9 2-2V5c0-1.1-0.9-2-2-2z" />
                </svg>
              </div>
              <div>
                <div className="header-dropdown-title header-dropdown-title--logout">Cerrar sesión</div>
              </div>
            </div>
          </div>
        )}
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
            <li><button
  className="header-nav-link"
  onClick={() => props.cambiarVista('entrenadores')}
>
  Entrenadores
</button></li>
            <li>
  <button
    className="header-nav-link"
    onClick={() => props.cambiarVista('jugadores')}
  >
    Jugadores
  </button>
</li>
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
