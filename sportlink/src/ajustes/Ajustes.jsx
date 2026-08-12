import React, { useState } from 'react';
import Footer from '../footer/footer.jsx';
import './ajustes.css';

// ── Íconos ────────────────────────────────────────────────────────────────────
const IconoCuenta = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconoPrivacidad = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconoNotificaciones = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconoApariencia = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);
const IconoSeguridad = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconoAyuda = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const IconoLegal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconoEmail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconoPassword = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconoSesiones = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IconoCerrarSesion = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconoEliminar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconoChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ── Secciones del sidebar ──────────────────────────────────────────────────────
const SECCIONES = [
  { id: 'cuenta',         label: 'Cuenta',          desc: 'Email, contraseña y datos de la cuenta.',    icono: <IconoCuenta /> },
  { id: 'privacidad',     label: 'Privacidad',       desc: 'Controlá tu información y contactos.',       icono: <IconoPrivacidad /> },
  { id: 'notificaciones', label: 'Notificaciones',   desc: 'Elegí qué notificaciones querés recibir.',  icono: <IconoNotificaciones /> },
  { id: 'apariencia',     label: 'Apariencia',       desc: 'Personalizá cómo se ve SportLink.',          icono: <IconoApariencia /> },
  { id: 'seguridad',      label: 'Seguridad',        desc: 'Sesiones activas y verificación.',           icono: <IconoSeguridad /> },
  { id: 'ayuda',          label: 'Ayuda',            desc: 'Centro de ayuda y soporte.',                 icono: <IconoAyuda /> },
  { id: 'legal',          label: 'Legal',            desc: 'Términos y políticas.',                      icono: <IconoLegal /> },
];

// ── Vista: Cuenta ─────────────────────────────────────────────────────────────
const SeccionCuenta = ({ usuario }) => {
  const [modalEmail, setModalEmail]       = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);

  const email     = usuario?.email || 'usuario@sportlink.com';
  const fechaPass = '12/03/2025';

  return (
    <div className="aj-content-area">
      {/* Header de la sección */}
      <div className="aj-section-hero">
        <div className="aj-section-hero-icon"><IconoCuenta /></div>
        <div>
          <h2 className="aj-section-title">Cuenta</h2>
          <p className="aj-section-subtitle">Gestioná tu información personal y la seguridad de tu cuenta.</p>
        </div>
      </div>

      {/* Información de cuenta */}
      <div className="aj-group">
        <h3 className="aj-group-label">Información de cuenta</h3>

        <div className="aj-setting-row">
          <div className="aj-setting-row-icon cyan"><IconoEmail /></div>
          <div className="aj-setting-row-info">
            <span className="aj-setting-row-title">Email</span>
            <span className="aj-setting-row-desc">{email}</span>
          </div>
          <button className="aj-action-btn" onClick={() => setModalEmail(true)}>
            Cambiar email <IconoChevron />
          </button>
        </div>

        <div className="aj-setting-row">
          <div className="aj-setting-row-icon cyan"><IconoPassword /></div>
          <div className="aj-setting-row-info">
            <span className="aj-setting-row-title">Contraseña</span>
            <span className="aj-setting-row-desc">Última actualización: {fechaPass}</span>
          </div>
          <button className="aj-action-btn" onClick={() => setModalPassword(true)}>
            Cambiar contraseña <IconoChevron />
          </button>
        </div>
      </div>

      {/* Sesión */}
      <div className="aj-group">
        <h3 className="aj-group-label">Sesión</h3>

        <div className="aj-setting-row">
          <div className="aj-setting-row-icon cyan"><IconoSesiones /></div>
          <div className="aj-setting-row-info">
            <span className="aj-setting-row-title">Sesiones activas</span>
            <span className="aj-setting-row-desc">Estás conectado en 2 dispositivos</span>
          </div>
          <button className="aj-action-btn" onClick={() => {}}>
            Ver sesiones <IconoChevron />
          </button>
        </div>

        <div className="aj-setting-row">
          <div className="aj-setting-row-icon cyan"><IconoCerrarSesion /></div>
          <div className="aj-setting-row-info">
            <span className="aj-setting-row-title">Cerrar sesión en otros dispositivos</span>
            <span className="aj-setting-row-desc">Se cerrará tu sesión en todos los dispositivos excepto este.</span>
          </div>
          <button className="aj-action-btn" onClick={() => {}}>
            Cerrar en otros dispositivos <IconoChevron />
          </button>
        </div>
      </div>

      {/* Cuenta - zona peligrosa */}
      <div className="aj-group">
        <h3 className="aj-group-label">Cuenta</h3>

        <div className="aj-setting-row danger">
          <div className="aj-setting-row-icon red"><IconoEliminar /></div>
          <div className="aj-setting-row-info">
            <span className="aj-setting-row-title">Eliminar cuenta</span>
            <span className="aj-setting-row-desc">Esta acción no se puede deshacer.</span>
          </div>
          <button className="aj-action-btn danger" onClick={() => setModalEliminar(true)}>
            Eliminar cuenta <IconoChevron />
          </button>
        </div>
      </div>

      {/* ── Modales ── */}
      {modalEmail && (
        <ModalAjuste
          titulo="Cambiar email"
          onClose={() => setModalEmail(false)}
        >
          <div className="aj-modal-field">
            <label>Email actual</label>
            <input type="email" value={email} readOnly className="aj-modal-input readonly" />
          </div>
          <div className="aj-modal-field">
            <label>Nuevo email</label>
            <input type="email" placeholder="ejemplo@correo.com" className="aj-modal-input" />
          </div>
          <div className="aj-modal-field">
            <label>Confirmá el nuevo email</label>
            <input type="email" placeholder="ejemplo@correo.com" className="aj-modal-input" />
          </div>
          <div className="aj-modal-actions">
            <button className="aj-modal-btn-cancel" onClick={() => setModalEmail(false)}>Cancelar</button>
            <button className="aj-modal-btn-confirm">Guardar cambios</button>
          </div>
        </ModalAjuste>
      )}

      {modalPassword && (
        <ModalAjuste
          titulo="Cambiar contraseña"
          onClose={() => setModalPassword(false)}
        >
          <div className="aj-modal-field">
            <label>Contraseña actual</label>
            <input type="password" placeholder="••••••••" className="aj-modal-input" />
          </div>
          <div className="aj-modal-field">
            <label>Nueva contraseña</label>
            <input type="password" placeholder="Mín. 8 caracteres" className="aj-modal-input" />
          </div>
          <div className="aj-modal-field">
            <label>Confirmá la nueva contraseña</label>
            <input type="password" placeholder="••••••••" className="aj-modal-input" />
          </div>
          <div className="aj-modal-actions">
            <button className="aj-modal-btn-cancel" onClick={() => setModalPassword(false)}>Cancelar</button>
            <button className="aj-modal-btn-confirm">Actualizar contraseña</button>
          </div>
        </ModalAjuste>
      )}

      {modalEliminar && (
        <ModalAjuste
          titulo="Eliminar cuenta"
          onClose={() => setModalEliminar(false)}
          danger
        >
          <div className="aj-modal-danger-warning">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>Esta acción es <strong>permanente e irreversible</strong>. Se eliminarán todos tus datos, publicaciones y postulaciones de SportLink.</p>
          </div>
          <div className="aj-modal-field">
            <label>Para confirmar, escribí <strong>ELIMINAR</strong></label>
            <input type="text" placeholder="ELIMINAR" className="aj-modal-input danger" />
          </div>
          <div className="aj-modal-actions">
            <button className="aj-modal-btn-cancel" onClick={() => setModalEliminar(false)}>Cancelar</button>
            <button className="aj-modal-btn-confirm danger">Sí, eliminar mi cuenta</button>
          </div>
        </ModalAjuste>
      )}
    </div>
  );
};

// ── Vista: Próximamente ────────────────────────────────────────────────────────
const SeccionProximamente = ({ seccion }) => (
  <div className="aj-content-area">
    <div className="aj-section-hero">
      <div className="aj-section-hero-icon">{seccion.icono}</div>
      <div>
        <h2 className="aj-section-title">{seccion.label}</h2>
        <p className="aj-section-subtitle">{seccion.desc}</p>
      </div>
    </div>
    <div className="aj-coming-soon">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
      <h4>Próximamente</h4>
      <p>Esta sección está en desarrollo. Estará disponible en una próxima actualización de SportLink.</p>
    </div>
  </div>
);

// ── Modal genérico ─────────────────────────────────────────────────────────────
const ModalAjuste = ({ titulo, onClose, danger, children }) => (
  <div className="aj-modal-overlay" onClick={onClose}>
    <div
      className={`aj-modal-card ${danger ? 'danger' : ''}`}
      onClick={e => e.stopPropagation()}
    >
      <div className="aj-modal-header">
        <h3>{titulo}</h3>
        <button className="aj-modal-close" onClick={onClose}>×</button>
      </div>
      <div className="aj-modal-body">{children}</div>
    </div>
  </div>
);

// ── Componente principal ───────────────────────────────────────────────────────
const Ajustes = ({ usuario }) => {
  const [seccionActiva, setSeccionActiva] = useState('cuenta');

  const seccionData = SECCIONES.find(s => s.id === seccionActiva);

  const renderContenido = () => {
    if (seccionActiva === 'cuenta') {
      return <SeccionCuenta usuario={usuario} />;
    }
    return <SeccionProximamente seccion={seccionData} />;
  };

  return (
    <>
      <div className="aj-root">
        <div className="aj-container">

          {/* Page Header */}
          <div className="aj-page-header">
            <h1 className="aj-page-title">Ajustes</h1>
            <p className="aj-page-subtitle">Gestioná tu cuenta, privacidad y preferencias.</p>
          </div>

          {/* Main Layout */}
          <div className="aj-layout">

            {/* Sidebar */}
            <aside className="aj-sidebar">
              <nav className="aj-sidebar-nav">
                {SECCIONES.map(sec => (
                  <button
                    key={sec.id}
                    className={`aj-sidebar-item ${seccionActiva === sec.id ? 'active' : ''}`}
                    onClick={() => setSeccionActiva(sec.id)}
                  >
                    <div className="aj-sidebar-item-icon">{sec.icono}</div>
                    <div className="aj-sidebar-item-text">
                      <span className="aj-sidebar-item-label">{sec.label}</span>
                      <span className="aj-sidebar-item-desc">{sec.desc}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <main className="aj-main">
              {renderContenido()}
            </main>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Ajustes;
