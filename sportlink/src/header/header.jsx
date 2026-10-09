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
  CHAT: { label: 'Chat', color: '#a0a0a0' },
  LIKE: { label: 'Me gusta', color: '#f472b6' },
  COMENTARIO: { label: 'Comentarios', color: '#60a5fa' },
  SEGUIDOR: { label: 'Seguidores', color: '#2DEFF2' },
  RECORDATORIO: { label: 'Recordatorio', color: '#fbbf24' },
  SISTEMA: { label: 'Sistema', color: '#9ca3af' },
};

// Íconos SVG para tipos de notificaciones y acciones
const IcoGraduationCap = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
  </svg>
);

const IcoMessageBubble = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <circle cx="9" cy="10" r="1" fill="#2DEFF2"/>
    <circle cx="12" cy="10" r="1" fill="#2DEFF2"/>
    <circle cx="15" cy="10" r="1" fill="#2DEFF2"/>
  </svg>
);

const IcoTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
    <path d="M4 22h16"/>
    <path d="M10 14.66V17c0 .55-.45 1-1 1H7"/>
    <path d="M14 14.66V17c0 .55.45 1 1 1h2"/>
    <path d="M18 4H6v7a6 6 0 0 0 12 0V4z"/>
  </svg>
);

const IcoShieldUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IcoBellNotif = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IcoGear = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const IcoTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
  </svg>
);

const IcoCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IcoInfo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

function renderTipoIcono(tipo) {
  const t = (tipo || '').toUpperCase();
  if (t === 'CURSOS' || t === 'CURSO') return <IcoGraduationCap />;
  if (t === 'MENSAJES' || t === 'CHAT') return <IcoMessageBubble />;
  if (t === 'PRUEBAS' || t === 'PRUEBA') return <IcoTrophy />;
  if (t === 'CLUBES' || t === 'CLUB' || t === 'SEGUIDOR') return <IcoShieldUser />;
  return <IcoBellNotif />;
}

function getTipoPillLabel(tipo) {
  if (!tipo) return 'SISTEMA';
  const t = tipo.toUpperCase();
  const map = {
    PRUEBA: 'PRUEBAS',
    CHAT: 'MENSAJES',
    CURSO: 'CURSOS',
    CLUB: 'CLUBES',
    SEGUIDOR: 'CLUBES',
    RECORDATORIO: 'SISTEMA'
  };
  return map[t] || t;
}

// "Hace 10 min", "Hace 1 h", "Ayer"
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
  if (d === 1) return 'Ayer';
  if (d < 30) return `Hace ${d} días`;
  return new Date(t).toLocaleDateString('es-AR');
};

const Header = ({ usuario, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [mostrarOpcionesNotif, setMostrarOpcionesNotif] = useState(false);
  const [unreadMensajes, setUnreadMensajes] = useState(0);
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadNotificaciones, setUnreadNotificaciones] = useState(0);
  const [notificacionesLoading, setNotificacionesLoading] = useState(false);
  const [eliminandoIds, setEliminandoIds] = useState(new Set());

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
    setMostrarOpcionesNotif(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen((v) => !v);
    setAvatarDropdownOpen(false);
    setNotificacionesOpen(false);
    setMostrarOpcionesNotif(false);
  };

  const toggleAvatarDropdown = (e) => {
    e && e.stopPropagation();
    setAvatarDropdownOpen((v) => !v);
    setDropdownOpen(false);
    setNotificacionesOpen(false);
    setMostrarOpcionesNotif(false);
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
      setNotificaciones([]);
      setUnreadNotificaciones(0);
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
    setMostrarOpcionesNotif(false);
    if (abrir) fetchNotificaciones();
  };

  const handleClickNotificacion = async (notif) => {
    if (!notif.leido) {
      handleMarcarComoLeida(notif.id);
    }
    if (notif.enlace) ir(notif.enlace);
  };

  const handleMarcarComoLeida = async (id) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)));
    setUnreadNotificaciones((c) => Math.max(0, c - 1));

    try {
      await api.patch(`/api/notificaciones/${id}/leer`);
    } catch (err) {
      console.error('Error marking notification read', err);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })));
    setUnreadNotificaciones(0);
    try {
      await api.patch('/api/notificaciones/leer-todas');
    } catch (err) {
      console.error('Error marking all notifications as read', err);
    }
  };

  const handleEliminarNotificacion = (e, id) => {
    e && e.stopPropagation();
    setEliminandoIds((prev) => new Set(prev).add(id));

    setTimeout(async () => {
      setNotificaciones((prev) => prev.filter((n) => n.id !== id));
      setEliminandoIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      setUnreadNotificaciones((c) => {
        const target = notificaciones.find((n) => n.id === id);
        return target && !target.leido ? Math.max(0, c - 1) : c;
      });

      try {
        await api.delete(`/api/notificaciones/${id}`);
      } catch (err) {
        console.error('Error deleting notification', err);
      }
    }, 350);
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

const IcoInfo = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

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

    const itemSobreNosotros = (
      <ItemDropdown
        ruta="/info"
        icono={<IcoInfo />}
        titulo="Sobre nosotros"
        desc="Conocé la plataforma, nuestra visión y el ecosistema deportivo."
      />
    );

    if (!estaLogueado) {
      return (
        <>
          {itemSobreNosotros}
          <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Los jugadores pueden acceder a las pruebas publicadas por los clubes asociados." />
          <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Los jugadores pueden acceder a entrenamientos publicados por entrenadores." />
        </>
      );
    }

    switch (userRole) {
      case 'jugador':
        return (
          <>
            {itemSobreNosotros}
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Postúlate a las convocatorias activas de los clubes oficiales." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Encuentra rutinas enfocadas en el alto rendimiento profesional." />
          </>
        );
      case 'entrenador':
        return (
          <>
            {itemSobreNosotros}
            <ItemDropdown ruta="/empleos" icono={<IconoEmpleos size={22} color="currentColor" />} titulo="Empleos" desc="Postúlate a vacantes técnicas de clubes y academias." />
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Gestiona u observa las convocatorias del mercado de pases." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Diseña y planifica sesiones tácticas avanzadas." />
          </>
        );
      case 'club':
        return (
          <>
            {itemSobreNosotros}
            <ItemDropdown ruta="/empleos" icono={<IconoEmpleos size={22} color="currentColor" />} titulo="Empleos" desc="Publica ofertas para reclutar staff técnico calificado." />
            <ItemDropdown ruta="/pruebas" icono={<IconoMedalla size={22} color="currentColor" />} titulo="Pruebas deportivas" desc="Organiza pruebas para captar jóvenes promesas." />
            <ItemDropdown ruta="/entrenamientos" icono={<IconoEntrenamientos size={22} color="currentColor" />} titulo="Entrenamientos" desc="Supervisa los planes físicos y técnicos de tus planteles." />
          </>
        );
      default:
        return itemSobreNosotros;
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
                      {/* Popover Header */}
                      <div className="header-notifications-header">
                        <div className="header-notifications-header-left">
                          <div className="header-notifications-header-icon">
                            <IconoNotificaciones size={22} color="#ffffff" />
                          </div>
                          <div className="header-notifications-header-titles">
                            <h4 className="header-notifications-title">Notificaciones</h4>
                            <p className="header-notifications-subtitle">Mantente al día con las últimas novedades.</p>
                          </div>
                        </div>

                        <div className="header-notifications-header-actions">
                          <button
                            type="button"
                            className="header-notifications-gear-btn"
                            onClick={() => setMostrarOpcionesNotif((v) => !v)}
                            title="Opciones de notificaciones"
                          >
                            <IcoGear />
                          </button>

                          {mostrarOpcionesNotif && (
                            <div className="header-notifications-options-menu">
                              <button
                                type="button"
                                className="header-notifications-option-item"
                                onClick={() => { handleMarcarTodasLeidas(); setMostrarOpcionesNotif(false); }}
                              >
                                <IcoCheck />
                                Marcar todas como leídas
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Popover Body */}
                      {notificaciones.length === 0 ? (
                        <div className="header-notifications-empty">
                          <div className="header-notifications-empty-icon">
                            <IcoBellNotif />
                          </div>
                          <h5 className="header-notifications-empty-text">
                            {notificacionesLoading ? 'Cargando notificaciones...' : 'Sin notificaciones pendientes'}
                          </h5>
                          {!notificacionesLoading && (
                            <p className="header-notifications-empty-subtext">
                              Estás al día con todas tus novedades y actividades en SportLink.
                            </p>
                          )}
                        </div>
                      ) : (
                        <ul className="header-notifications-list">
                          {notificaciones.map((n) => {
                            const isDeleting = eliminandoIds.has(n.id);
                            return (
                              <li
                                key={n.id}
                                className={`header-notification-item${n.leido ? ' leido' : ' noleido'}${isDeleting ? ' header-notification-item--deleting' : ''}`}
                                onClick={() => handleClickNotificacion(n)}
                              >
                                {/* Thumbnail col */}
                                <div className="header-noti-thumb-col">
                                  {n.imagen ? (
                                    <img src={n.imagen} alt="" className="header-noti-thumb-img" />
                                  ) : (
                                    <div className={`header-noti-thumb-icon-box ${n.tipo}`}>
                                      {renderTipoIcono(n.tipo)}
                                    </div>
                                  )}
                                </div>

                                {/* Info col */}
                                <div className="header-noti-content-col">
                                  <div className="header-noti-top-row">
                                    <span className={`header-noti-pill ${n.tipo}`}>{getTipoPillLabel(n.tipo)}</span>
                                    <div className="header-noti-time-row">
                                      <span className="header-noti-time">{tiempoRelativo(n.fecha_creacion || n.createdat)}</span>
                                      {!n.leido && <span className="header-noti-unread-dot" title="No leída" />}
                                    </div>
                                  </div>

                                  <h5 className="header-noti-item-title">{n.titulo}</h5>
                                  <p className="header-noti-item-desc">{n.mensaje || n.descripcion}</p>
                                </div>

                                {/* Action buttons */}
                                <div className="header-noti-item-actions">
                                  {!n.leido && (
                                    <button
                                      type="button"
                                      className="header-noti-action-btn check"
                                      title="Marcar como leída"
                                      onClick={(e) => { e.stopPropagation(); handleMarcarComoLeida(n.id); }}
                                    >
                                      <IcoCheck />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="header-noti-action-btn delete"
                                    title="Eliminar notificación"
                                    onClick={(e) => handleEliminarNotificacion(e, n.id)}
                                  >
                                    <IcoTrash />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      {/* Popover Footer */}
                      <div className="header-notifications-footer">
                        <button
                          type="button"
                          className="header-notifications-ver-todas"
                          onClick={() => ir('/feed')}
                        >
                          Ver todas las notificaciones
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </div>
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

                    {usuario.es_admin && (
                      <button
                        className="header-dropdown-link"
                        onClick={() => ir('/admin')}
                        type="button"
                        style={{ color: '#2DEFF2', fontWeight: 600 }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="dropdown-link-icon">
                          <rect x="3" y="3" width="7" height="7" />
                          <rect x="14" y="3" width="7" height="7" />
                          <rect x="14" y="14" width="7" height="7" />
                          <rect x="3" y="14" width="7" height="7" />
                        </svg>
                        Consola Admin
                      </button>
                    )}

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