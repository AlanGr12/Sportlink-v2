import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import api from '../axiosConfig.js';
import './header.css';
import logoSportlink from '../assets/logoSportlink.png';
import { IconoMensajes } from '../iconos/IconoMensajes.jsx';
import { IconoNotificaciones } from '../iconos/IconoNotificaciones.jsx';
import { IconoCandado } from '../iconos/IconoCandado.jsx';
import { IconoEmpleos } from '../iconos/IconoEmpleos.jsx';
import { IconoEntrenamientos } from '../iconos/IconoEntrenamientos.jsx';
import { IconoMedalla } from '../iconos/IconoMedalla.jsx';

const TIPOS_NOTIF = {
  LISTA_ESPERA: { label: 'Lista de espera', color: '#f59e0b' },
  PRUEBA: { label: 'Prueba', color: '#2DEFF2' },
  ENTRENAMIENTO: { label: 'Entrenamiento', color: '#34d399' },
  EMPLEO: { label: 'Empleo', color: '#a78bfa' },
  CHAT: { label: 'Chat', color: '#60a5fa' },
  SISTEMA: { label: 'Sistema', color: '#9ca3af' },
};

// "Hace 10 min", "Hace 3 h", "Hace 2 días"
const tiempoRelativo = (fechaStr) => {
  const t = new Date(fechaStr).getTime();
  if (isNaN(t)) return '';
  const seg = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (seg < 60) return 'Hace un momento';
  const min = Math.floor(seg / 60);
  if (min < 60) return `Hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 30) return `Hace ${d} ${d === 1 ? 'día' : 'días'}`;
  return new Date(t).toLocaleDateString('es-AR');
};

const Header = ({ usuario, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [unreadMensajes, setUnreadMensajes] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadNotificaciones, setUnreadNotificaciones] = useState(0);
  const [notificacionesLoading, setNotificacionesLoading] = useState(false);

  const explorarRef = useRef(null);
  const avatarRef = useRef(null);
  const notificacionesRef = useRef(null);

  const estaLogueado = !!usuario;
  const userRole = usuario?.tipousuario || null;

  // Helper: ir a una ruta y cerrar todos los dropdowns
  const ir = (ruta) => {
    navigate(ruta);
    setDropdownOpen(false);
    setAvatarDropdownOpen(false);
    setNotificacionesOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen((v) => !v);
    setAvatarDropdownOpen(false);
    setNotificacionesOpen(false);
  };

  const toggleAvatarDropdown = (e) => {
    e && e.stopPropagation();
    setAvatarDropdownOpen((v) => !v);
    setDropdownOpen(false);
    setNotificacionesOpen(false);
  };

  const fetchContadorNotificaciones = async () => {
    try {
      const { data } = await api.get('/api/notificaciones/no-leidas/count');
      setUnreadNotificaciones(Number(data?.count) || 0);
    } catch (err) {
      console.error('Error fetching unread notifications count', err);
    }
  };

  const fetchNotificaciones = async () => {
    setNotificacionesLoading(true);
    try {
      const { data } = await api.get('/api/notificaciones');
      const lista = Array.isArray(data) ? data : [];
      setNotificaciones(lista);
      setUnreadNotificaciones(lista.filter((n) => !n.leido).length);
    } catch (err) {
      console.error('Error fetching notifications', err);
    } finally {
      setNotificacionesLoading(false);
    }
  };

  const toggleNotificaciones = (e) => {
    e && e.stopPropagation();
    const abrir = !notificacionesOpen;
    setNotificacionesOpen(abrir);
    setDropdownOpen(false);
    setAvatarDropdownOpen(false);
    if (abrir) fetchNotificaciones();
  };

  const handleClickNotificacion = async (notif) => {
    if (!notif.leido) {
      // Actualización optimista
      setNotificaciones((prev) => prev.map((n) => (n.id === notif.id ? { ...n, leido: true } : n)));
      setUnreadNotificaciones((c) => Math.max(0, c - 1));
      try {
        await api.patch(`/api/notificaciones/${notif.id}/leer`);
      } catch (err) {
        console.error('Error marking notification as read', err);
        fetchNotificaciones();
      }
    }
    if (notif.enlace) ir(notif.enlace);
  };

  const handleMarcarTodasLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    setUnreadNotificaciones(0);
    try {
      await api.patch('/api/notificaciones/leer-todas');
    } catch (err) {
      console.error('Error marking all notifications as read', err);
      fetchNotificaciones();
    }
  };

  const handleLogout = () => {
    setAvatarDropdownOpen(false);
    if (onLogout) onLogout();
    navigate('/');
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

  useEffect(() => {
    if (estaLogueado) {
      const fetchUnread = async () => {
        try {
          const { data } = await api.get('/api/conversaciones');
          const total = data.reduce((acc, c) => acc + (c.noleidos || 0), 0);
          setUnreadMensajes(total);
        } catch (err) {
          console.error("Error fetching unread messages", err);
        }
      };
      fetchUnread();
    }
  }, [estaLogueado, location.pathname]);

  // Contador de notificaciones no leídas: al montar, al navegar y cada 60 s
  useEffect(() => {
    if (!estaLogueado) {
      setNotificaciones([]);
      setUnreadNotificaciones(0);
      return;
    }
    fetchContadorNotificaciones();
    const intervalo = setInterval(fetchContadorNotificaciones, 60000);
    return () => clearInterval(intervalo);
  }, [estaLogueado, location.pathname]);

  // Elementos del dropdown "Explorar" según rol
  const renderDropdownItems = () => {
    const ItemDropdown = ({ ruta, icono, titulo, desc }) => (
      <div
        className="header-dropdown-item"
        onClick={() => ir(ruta)}
        style={{ cursor: 'pointer' }}
      >
        <div className="header-dropdown-icon">{icono}</div>
        <div>
          <div className="header-dropdown-title">{titulo}</div>
          <div className="header-dropdown-desc">{desc}</div>
        </div>
      </div>
    );

    if (!estaLogueado) {
      return (
        <>
          <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Los jugadores pueden acceder a las pruebas publicadas por los clubes asociados." />
          <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Los jugadores pueden acceder a entrenamientos publicados por entrenadores." />
        </>
      );
    }

    switch (userRole) {
      case 'jugador':
        return (
          <>
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Postúlate a las convocatorias activas de los clubes oficiales." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Encuentra rutinas enfocadas en el alto rendimiento profesional." />
          </>
        );
      case 'entrenador':
        return (
          <>
            <ItemDropdown ruta="/empleos" icono={<IconoEmpleos size={22} color="currentColor" />} titulo="Empleos" desc="Postúlate a vacantes técnicas de clubes y academias." />
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Gestiona u observa las convocatorias del mercado de pases." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Diseña y planifica sesiones tácticas avanzadas." />
          </>
        );
      case 'club':
        return (
          <>
            <ItemDropdown ruta="/empleos" icono={<IconoEmpleos size={22} color="currentColor" />} titulo="Empleos" desc="Publica ofertas para reclutar staff técnico calificado." />
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Organiza pruebas para captar jóvenes promesas." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Supervisa los planes físicos y técnicos de tus planteles." />
          </>
        );
      default:
        return null;
    }
  };

  // Helper: clase activa para links de la nav
  const navLinkClass = (ruta) => {
    const activo = location.pathname === ruta || location.pathname.startsWith(ruta + '/');
    return `header-nav-link${activo ? ' header-nav-link--active' : ''}`;
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => ir('/')} style={{ cursor: 'pointer' }}>
          <img src={logoSportlink} alt="Sportlink" className="header-logo-img" />
        </div>

        {/* Nav principal */}
        <nav className="header-nav">
          <ul className="header-nav-list">
            {/* Explorar dropdown */}
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
              <button className={navLinkClass('/feed')} onClick={() => ir('/feed')}>
                Feed
              </button>
            </li>
            <li>
              <button className={navLinkClass('/entrenadores')} onClick={() => ir('/entrenadores')}>
                Entrenadores
              </button>
            </li>
            <li>
              <button className={navLinkClass('/clubes')} onClick={() => ir('/clubes')}>
                Clubes
              </button>
            </li>
            <li>
              <button className={navLinkClass('/calendario')} onClick={() => ir('/calendario')}>
                Calendario
              </button>
            </li>
          </ul>
        </nav>

        {/* Acciones derecha */}
        <div className="header-actions">
          {estaLogueado ? (
            <>
              <div className="header-icons-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {/* Mensajes */}
                <button className={`header-action-btn ${location.pathname.startsWith('/mensajes') ? 'active' : ''}`} onClick={() => ir('/mensajes')} style={{ position: 'relative' }}>
                  <IconoMensajes size={22} color="#ffffff" className="header-svg-icon" />
                  {unreadMensajes > 0 && (
                    <span style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '2px',
                      backgroundColor: '#2DEFF2',
                      color: '#000',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: '15px',
                      height: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid #0A0B0C',
                      zIndex: 2
                    }}>
                      {unreadMensajes > 9 ? '+9' : unreadMensajes}
                    </span>
                  )}
                </button>

                {/* Notificaciones */}
                <div className="header-notifications-container" ref={notificacionesRef}>
                  <button className="header-action-btn" onClick={toggleNotificaciones} style={{ position: 'relative' }}>
                    <IconoNotificaciones size={22} color="#ffffff" className="header-svg-icon" />
                    {unreadNotificaciones > 0 && (
                      <span className="header-notifications-badge">
                        {unreadNotificaciones > 9 ? '9+' : unreadNotificaciones}
                      </span>
                    )}
                  </button>

                  {notificacionesOpen && (
                    <div className="header-notifications-dropdown">
                      <div className="header-notifications-header">
                        <h4 className="header-notifications-title">Notificaciones</h4>
                        {unreadNotificaciones > 0 && (
                          <button
                            type="button"
                            className="header-notifications-markall"
                            onClick={handleMarcarTodasLeidas}
                          >
                            Marcar todas como leídas
                          </button>
                        )}
                      </div>

                      {notificaciones.length === 0 ? (
                        <div className="header-notifications-empty">
                          <div className="header-notifications-empty-icon">
                            <IconoNotificaciones size={24} color="rgba(255, 255, 255, 0.4)" />
                          </div>
                          <p className="header-notifications-empty-text">
                            {notificacionesLoading ? 'Cargando...' : 'No tienes notificaciones pendientes'}
                          </p>
                          {!notificacionesLoading && (
                            <p className="header-notifications-empty-subtext">Te avisaremos cuando recibas una actualización de tus preferencias.</p>
                          )}
                        </div>
                      ) : (
                        <ul className="header-notifications-list">
                          {notificaciones.map((n) => {
                            const tipo = TIPOS_NOTIF[n.tipo] || TIPOS_NOTIF.SISTEMA;
                            return (
                              <li
                                key={n.id}
                                className={`header-notification-item${n.leido ? '' : ' header-notification-item--unread'}`}
                                onClick={() => handleClickNotificacion(n)}
                              >
                                <span className="header-notification-dot" aria-hidden="true" />
                                <div className="header-notification-body">
                                  <div className="header-notification-top">
                                    <span className="header-notification-tag" style={{ color: tipo.color, borderColor: tipo.color }}>
                                      {tipo.label}
                                    </span>
                                    <span className="header-notification-time">{tiempoRelativo(n.fecha_creacion)}</span>
                                  </div>
                                  <div className="header-notification-title">{n.titulo}</div>
                                  <div className="header-notification-message">{n.mensaje}</div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Avatar / perfil */}
              <div className="header-profile-container" ref={avatarRef}>
                <button className="header-avatar-toggle" onClick={toggleAvatarDropdown} style={{border: 'none', background: 'transparent', padding: 0}}>
                  <Avatar src={usuario.fotoperfil} nombre={usuario.nombre || usuario.email} size={40} />
                </button>

                {avatarDropdownOpen && (
                  <div className="header-avatar-dropdown">
                    <div className="header-user-info-box">
                      <div className="header-user-avatar-preview" style={{border: 'none', background: 'transparent'}}>
                        <Avatar src={usuario.fotoperfil} nombre={usuario.nombre || usuario.email} size={48} />
                      </div>
                      <div className="header-user-info-text">
                        <span className="header-user-fullname">
                          {usuario.nombre} {usuario.apellido || ''}
                        </span>
                        {usuario.email && (
                          <span className="header-user-email">{usuario.email}</span>
                        )}
                        <span className="header-user-role-badge">
                          {usuario.tipousuario?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <hr className="header-divider" />

                    <button
                      className="header-dropdown-link"
                      onClick={() => ir('/perfil')}
                      type="button"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-link-icon">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Mi Perfil
                    </button>

                    <button
                      className="header-dropdown-link"
                      onClick={() => ir('/ajustes')}
                      type="button"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-link-icon">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Ajustes
                    </button>

                    <hr className="header-divider" />

                    <button
                      className="header-dropdown-link header-dropdown-item--logout"
                      onClick={handleLogout}
                      type="button"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-link-icon">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header-auth-buttons">
              <button className="header-auth-btn" onClick={() => ir('/login')}>
                Iniciar Sesión
              </button>
              <button className="header-auth-btn header-auth-btn-register" onClick={() => ir('/registro')}>
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