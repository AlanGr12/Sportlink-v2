import React, { useState, useEffect, createContext, useContext } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import api from '../axiosConfig.js'
import logoSportlink from '../assets/logoSportlink.png'
import './admin.css'

// Contexto global para Toasts en el Admin
const AdminToastContext = createContext(null)

export const useAdminToast = () => useContext(AdminToastContext)

export default function AdminLayout({ usuario, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [colapsada, setColapsada] = useState(false)
  const [pendientesCount, setPendientesCount] = useState(0)
  const [toasts, setToasts] = useState([])
  const [busquedaGlobal, setBusquedaGlobal] = useState('')

  const mostrarToast = (mensaje, tipo = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, mensaje, tipo }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }

  // Cargar contador de clubes pendientes para el badge del sidebar
  useEffect(() => {
    let cancelado = false
    const cargarContador = async () => {
      try {
        const { data } = await api.get('/api/admin/kpis')
        if (!cancelado && data?.clubes?.pendientes !== undefined) {
          setPendientesCount(data.clubes.pendientes)
        }
      } catch (err) {
        console.error('Error cargando contador pendientes:', err)
      }
    }

    cargarContador()
    const timer = setInterval(cargarContador, 60000)
    return () => { cancelado = true; clearInterval(timer) }
  }, [location.pathname])

  const titulos = {
    '/admin': 'Dashboard & Analíticas',
    '/admin/clubes': 'Aprobación y Moderación de Clubes',
    '/admin/usuarios': 'Gestión de Usuarios Registrados',
    '/admin/eventos': 'Auditoría de Pruebas y Entrenamientos',
    '/admin/publicaciones': 'Moderación de Publicaciones'
  }

  const tituloActual = titulos[location.pathname] || 'Consola de Administración'

  return (
    <AdminToastContext.Provider value={{ mostrarToast, actualizarPendientes: setPendientesCount }}>
      <div className="admin-root">
        <div className="admin-shell">
          {/* ── Sidebar Izquierdo ──────────────────────────────────── */}
          <aside className={`admin-sidebar ${colapsada ? 'colapsada' : ''}`}>
            <div className="admin-sidebar-header">
              <Link to="/admin" className="admin-brand">
                <img src={logoSportlink} alt="SportLink" className="admin-brand-logo" />
                {!colapsada && (
                  <div className="admin-brand-info">
                    <span className="admin-brand-title">SportLink</span>
                    <span className="admin-badge-console">ADMIN CONSOLE</span>
                  </div>
                )}
              </Link>
              <button
                type="button"
                className="admin-collapse-toggle"
                onClick={() => setColapsada(v => !v)}
                title={colapsada ? 'Expandir barra' : 'Colapsar barra'}
                aria-label="Toggle Sidebar"
              >
                {colapsada ? '›' : '‹'}
              </button>
            </div>

            <nav className="admin-sidebar-nav">
              <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'activo' : ''}`} title="Dashboard / Métricas">
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </span>
                {!colapsada && <span className="admin-nav-label">Dashboard</span>}
              </NavLink>

              <NavLink to="/admin/clubes" className={({ isActive }) => `admin-nav-item ${isActive ? 'activo' : ''}`} title="Aprobación de Clubes">
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M9 8h1" />
                    <path d="M9 12h1" />
                    <path d="M9 16h1" />
                    <path d="M14 8h1" />
                    <path d="M14 12h1" />
                    <path d="M14 16h1" />
                    <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                  </svg>
                </span>
                {!colapsada && <span className="admin-nav-label">Aprobación de Clubes</span>}
                {pendientesCount > 0 && (
                  <span className="admin-nav-badge" title={`${pendientesCount} clubes pendientes`}>
                    {pendientesCount}
                  </span>
                )}
              </NavLink>

              <NavLink to="/admin/usuarios" className={({ isActive }) => `admin-nav-item ${isActive ? 'activo' : ''}`} title="Usuarios Registrados">
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                {!colapsada && <span className="admin-nav-label">Usuarios</span>}
              </NavLink>

              <NavLink to="/admin/eventos" className={({ isActive }) => `admin-nav-item ${isActive ? 'activo' : ''}`} title="Pruebas y Entrenamientos">
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                    <path d="M2 12h20" />
                  </svg>
                </span>
                {!colapsada && <span className="admin-nav-label">Pruebas / Actividades</span>}
              </NavLink>

              <NavLink to="/admin/publicaciones" className={({ isActive }) => `admin-nav-item ${isActive ? 'activo' : ''}`} title="Publicaciones">
                <span className="admin-nav-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </span>
                {!colapsada && <span className="admin-nav-label">Publicaciones</span>}
              </NavLink>
            </nav>

            <div className="admin-sidebar-footer">
              <Link to="/" className="admin-footer-btn" title="Volver a la App Principal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                {!colapsada && <span>Volver a la App</span>}
              </Link>

              <button
                type="button"
                className="admin-footer-btn danger"
                onClick={onLogout}
                title="Cerrar sesión"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {!colapsada && <span>Cerrar Sesión</span>}
              </button>
            </div>
          </aside>

          {/* ── Main Area ─────────────────────────────────────────── */}
          <div className="admin-main">
            <header className="admin-header">
              <div className="admin-header-left">
                <h2 className="admin-header-title">{tituloActual}</h2>
                <div className="admin-system-status">
                  <span className="admin-status-dot" />
                  <span>Sistema Operativo</span>
                </div>
              </div>

              <div className="admin-header-right">
                <div className="admin-search-bar">
                  <svg className="admin-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="admin-search-input"
                    placeholder="Búsqueda rápida..."
                    value={busquedaGlobal}
                    onChange={(e) => setBusquedaGlobal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && busquedaGlobal.trim()) {
                        navigate(`/admin/usuarios?search=${encodeURIComponent(busquedaGlobal.trim())}`)
                      }
                    }}
                  />
                </div>

                <div className="admin-user-pill">
                  <Avatar src={usuario?.fotoperfil} nombre={usuario?.nombre || usuario?.email || 'Admin'} size={32} />
                  <div className="admin-user-meta">
                    <span className="admin-user-name">{usuario?.nombre || usuario?.email || 'Administrador'}</span>
                    <span className="admin-user-role">SUPER ADMIN</span>
                  </div>
                </div>
              </div>
            </header>

            <main className="admin-content">
              <Outlet />
            </main>
          </div>
        </div>

        {/* ── Toasts de Feedback Inmediato ───────────────────────── */}
        <div className="admin-toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`admin-toast ${t.tipo}`}>
              <span>{t.mensaje}</span>
            </div>
          ))}
        </div>
      </div>
    </AdminToastContext.Provider>
  )
}
