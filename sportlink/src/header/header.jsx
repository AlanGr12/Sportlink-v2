import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png';
import iconMensajes from '../assets/mensajes.png';
import iconNotis from '../assets/notis.png';

// NUEVOS IMPORTACIONES DE ICONOS PARA EL DROPDOWN
import iconCandado from '../assets/candado.png';
import iconEmpleos from '../assets/empleos.png';
import iconEntrenamientos from '../assets/entrenamientos.png';
import iconPruebas from '../assets/pruebas.png';

const Header = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);

  const explorarRef = useRef(null);
  const avatarRef = useRef(null);

  const usuario = props.usuario || null;
  const estaLogueado = !!usuario;
  const userRole = usuario?.tipousuario || null;

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const toggleAvatarDropdown = (e) => {
    e && e.stopPropagation();
    setAvatarDropdownOpen(!avatarDropdownOpen);
  };

  const handleLogout = () => {
    setAvatarDropdownOpen(false);
    if (props.onLogout) {
      props.onLogout();
    }
    props.cambiarVista('landing');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (explorarRef.current && !explorarRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDropdownItems = () => {
    // NUEVO REEMPLAZO CON ICONO DE CANDADO
    if (!estaLogueado) {
      return (
        <div className="header-dropdown-item" style={{ cursor: 'default' }}>
          <div className="header-dropdown-icon">
            <img src={iconCandado} alt="Seguridad" className="header-dropdown-img-icon" />
          </div>
          <div>
            <div className="header-dropdown-title">Inicia sesión</div>
            <div className="header-dropdown-desc">
              Debes iniciar sesión para desbloquear las demás funciones.
            </div>
          </div>
        </div>
      );
    }

    // REEMPLAZO DE EMOJIS POR ICONOS SEGÚN EL ROL
    switch (userRole) {
      case 'jugador':
        return (
          <>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconPruebas} alt="Pruebas" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Postúlate a las convocatorias activas de los clubes oficiales.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconEntrenamientos} alt="Entrenamientos" className="header-dropdown-img-icon" />
              </div>
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
              <div className="header-dropdown-icon">
                <img src={iconEmpleos} alt="Empleos" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Postúlate a vacantes técnicas de clubes y academias.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconPruebas} alt="Pruebas" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Gestiona u observa las convocatorias del mercado de pases.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconEntrenamientos} alt="Entrenamientos" className="header-dropdown-img-icon" />
              </div>
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
              <div className="header-dropdown-icon">
                <img src={iconEmpleos} alt="Empleos" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Publica ofertas para reclutar staff técnico calificado.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconPruebas} alt="Pruebas" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Organiza pruebas para captar jóvenes promesas.</div>
              </div>
            </div>
            <div className="header-dropdown-item">
              <div className="header-dropdown-icon">
                <img src={iconEntrenamientos} alt="Entrenamientos" className="header-dropdown-img-icon" />
              </div>
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
        <div className="header-logo" onClick={() => props.cambiarVista('landing')} style={{ cursor: 'pointer' }}>
          <img src={logoSportlink} alt="Sportlink" className="header-logo-img" />
        </div>

        <nav className="header-nav">
          <ul className="header-nav-list">
            <li ref={explorarRef}>
              <button className="header-dropdown-toggle" onClick={toggleDropdown}>
                Explorar
                <svg
                  className={`header-arrow ${dropdownOpen ? 'up' : 'down'}`}
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
            <li>
              <button className="header-nav-link" onClick={() => props.cambiarVista('entrenadores')}>
                Entrenadores
              </button>
            </li>
            <li>
              <button className="header-nav-link" onClick={() => props.cambiarVista('jugadores')}>
                Jugadores
              </button>
            </li>
            <li>
              <button className="header-nav-link" onClick={() => props.cambiarVista('calendario')}>
                Calendario
              </button>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="header-action-btn">
            <img src={iconMensajes} alt="Mensajes" className="header-action-icon" />
          </button>
          <button className="header-action-btn">
            <img src={iconNotis} alt="Notificaciones" className="header-action-icon" />
          </button>

          <div className="header-profile-container" ref={avatarRef}>
            <button className="header-avatar-toggle" onClick={toggleAvatarDropdown}>
              <div className="header-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                {estaLogueado ? (
                  usuario.fotoperfil ? (
                    <img 
                      src={usuario.fotoperfil} 
                      alt={usuario.nombre || "Foto de perfil"} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} 
                    />
                  ) : (
                    usuario.nombre?.charAt(0).toUpperCase()
                  )
                ) : (
                  '?'
                )}
              </div>
            </button>

            {avatarDropdownOpen && (
              <div className="header-avatar-dropdown">
                {estaLogueado ? (
                  <>
                    <div className="header-user-info">
                      <span className="header-user-name">{usuario.nombre}</span>
                      <span className="header-user-role">{usuario.tipousuario}</span>
                    </div>
                    <hr className="header-divider" />
                    <button className="header-dropdown-link" onClick={() => { props.cambiarVista('perfil'); setAvatarDropdownOpen(false); }}>
                      Mi Perfil
                    </button>
                    <button className="header-dropdown-link header-dropdown-item--logout" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <>
                    <button className="header-dropdown-link" onClick={() => { props.cambiarVista('login'); setAvatarDropdownOpen(false); }}>
                      Iniciar Sesión
                    </button>
                    <button className="header-dropdown-link" onClick={() => { props.cambiarVista('registro'); setAvatarDropdownOpen(false); }}>
                      Registrarse
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;