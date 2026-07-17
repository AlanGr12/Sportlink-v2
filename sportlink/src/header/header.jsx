import React, { useState, useEffect, useRef } from 'react';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png';
import { IconoMensajes } from '../iconos/IconoMensajes.jsx';
import { IconoNotificaciones } from '../iconos/IconoNotificaciones.jsx';

// NUEVAS IMPORTACIONES DE ICONOS EN CODIGO PARA EL DROPDOWN
import { IconoCandado } from '../iconos/IconoCandado.jsx';
import { IconoEmpleos } from '../iconos/IconoEmpleos.jsx';
import { IconoEntrenamientos } from '../iconos/IconoEntrenamientos.jsx';
import { IconoMedalla } from '../iconos/IconoMedalla.jsx';

const Header = (props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);

  const explorarRef = useRef(null);
  const avatarRef = useRef(null);
  const notificacionesRef = useRef(null);

  const usuario = props.usuario || null;
  const estaLogueado = !!usuario;
  const userRole = usuario?.tipousuario || null;

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    setAvatarDropdownOpen(false);
    setNotificacionesOpen(false);
  };

  const toggleAvatarDropdown = (e) => {
    e && e.stopPropagation();
    setAvatarDropdownOpen(!avatarDropdownOpen);
    setDropdownOpen(false);
    setNotificacionesOpen(false);
  };

  const toggleNotificaciones = (e) => {
    e && e.stopPropagation();
    setNotificacionesOpen(!notificacionesOpen);
    setDropdownOpen(false);
    setAvatarDropdownOpen(false);
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
      if (notificacionesRef.current && !notificacionesRef.current.contains(event.target)) {
        setNotificacionesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderDropdownItems = () => {
    if (!estaLogueado) {
      return (
        <>
          <div 
            className="header-dropdown-item" 
            onClick={() => { props.cambiarVista('pruebas'); setDropdownOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="header-dropdown-icon">
              <IconoMedalla size={22} color="currentColor" className="header-dropdown-img-icon" />
            </div>
            <div>
              <div className="header-dropdown-title">Pruebas deportivas</div>
              <div className="header-dropdown-desc">Los jugadores pueden acceder a las pruebas publicadas <br />por los clubes asociados.</div>
            </div>
          </div>
          <div 
            className="header-dropdown-item"
            onClick={() => { props.cambiarVista('entrenamientos'); setDropdownOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            <div className="header-dropdown-icon">
              <IconoEntrenamientos size={22} color="currentColor" className="header-dropdown-img-icon" />
            </div>
            <div>
              <div className="header-dropdown-title">Entrenamientos</div>
              <div className="header-dropdown-desc">Los jugadores pueden acceder a entrenamientos <br />publicados por entrenadores.</div>
            </div>
          </div>
        </>
      );
    }

    switch (userRole) {
      case 'jugador':
        return (
          <>
            <div 
              className="header-dropdown-item" 
              onClick={() => { props.cambiarVista('pruebas'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoMedalla size={22} color="currentColor" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Postúlate a las convocatorias activas de los clubes oficiales.</div>
              </div>
            </div>
            <div 
              className="header-dropdown-item"
              onClick={() => { props.cambiarVista('entrenamientos'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoEntrenamientos size={22} color="currentColor" className="header-dropdown-img-icon" />
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
            <div 
              className="header-dropdown-item"
              onClick={() => { props.cambiarVista('empleos'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoEmpleos size={22} color="currentColor" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Postúlate a vacantes técnicas de clubes y academias.</div>
              </div>
            </div>
            <div 
              className="header-dropdown-item" 
              onClick={() => { props.cambiarVista('pruebas'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoMedalla size={22} color="currentColor" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Gestiona u observa las convocatorias del mercado de pases.</div>
              </div>
            </div>
            <div 
              className="header-dropdown-item"
              onClick={() => { props.cambiarVista('entrenamientos'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoEntrenamientos size={22} color="currentColor" className="header-dropdown-img-icon" />
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
            <div 
              className="header-dropdown-item"
              onClick={() => { props.cambiarVista('empleos'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoEmpleos size={22} color="currentColor" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Empleos</div>
                <div className="header-dropdown-desc">Publica ofertas para reclutar staff técnico calificado.</div>
              </div>
            </div>
            <div 
              className="header-dropdown-item" 
              onClick={() => { props.cambiarVista('pruebas'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoMedalla size={22} color="currentColor" className="header-dropdown-img-icon" />
              </div>
              <div>
                <div className="header-dropdown-title">Pruebas deportivas</div>
                <div className="header-dropdown-desc">Organiza pruebas para captar jóvenes promesas.</div>
              </div>
            </div>
            <div 
              className="header-dropdown-item"
              onClick={() => { props.cambiarVista('entrenamientos'); setDropdownOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <div className="header-dropdown-icon">
                <IconoEntrenamientos size={22} color="currentColor" className="header-dropdown-img-icon" />
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
              <button className="header-nav-link" onClick={() => props.cambiarVista('clubes')}>
                Clubes
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
  {estaLogueado ? (
    <>
      <div className="header-icons-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button className="header-action-btn" onClick={() => props.cambiarVista('mensajes')}>
          <IconoMensajes size={22} color="#ffffff" className="header-svg-icon" />
        </button>
        
        <div className="header-notifications-container" ref={notificacionesRef}>
          <button className="header-action-btn" onClick={toggleNotificaciones}>
            <IconoNotificaciones size={22} color="#ffffff" className="header-svg-icon" />
          </button>

          {notificacionesOpen && (
            <div className="header-notifications-dropdown">
              <div className="header-notifications-header">
                <h4 className="header-notifications-title">Notificaciones</h4>
              </div>
              <div className="header-notifications-empty">
                <div className="header-notifications-empty-icon">
                  <IconoNotificaciones size={24} color="rgba(255, 255, 255, 0.4)" />
                </div>
                <p className="header-notifications-empty-text">No tienes notificaciones pendientes</p>
                <p className="header-notifications-empty-subtext">Te avisaremos cuando recibas una actualización de tus preferencias.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-profile-container" ref={avatarRef}>
        <button className="header-avatar-toggle" onClick={toggleAvatarDropdown}>
          <div className="header-avatar" style={{ overflow: 'hidden', padding: 0 }}>
            {usuario.fotoperfil ? (
              <img 
                src={usuario.fotoperfil} 
                alt={usuario.nombre || "Foto de perfil"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%', display: 'block' }} 
              />
            ) : (
              usuario.nombre?.charAt(0).toUpperCase()
            )}
          </div>
        </button>

        {avatarDropdownOpen && (
          <div className="header-avatar-dropdown">
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
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="header-auth-buttons">
      <button className="header-auth-btn" onClick={() => props.cambiarVista('login')}>
        Iniciar Sesión
      </button>
      <button className="header-auth-btn header-auth-btn-register" onClick={() => props.cambiarVista('registro')}>
        Registrarse
      </button>
    </div>
  )}
</div>
      </div>
    </header>
  );
};

export default Header;