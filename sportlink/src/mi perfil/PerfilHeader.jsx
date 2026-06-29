import React from 'react';
import './PerfilHeader.css';

/*
  - Muestra foto o iniciales con estilo moderno y deportivo.
  - Muestra nombre completo y meta tags (ubicación con icono / tipo de usuario con icono de rol).
  - Incluye la Biografía (Bio) directamente debajo del nombre para ahorrar espacio y compactar la info.
  - Botón "Editar perfil" estilizado con efecto ciberpunk.
  - Recibe: `perfil` (objeto) desde el `MiPerfil`.
*/
const PerfilHeader = ({ perfil }) => {
  const nombre = perfil?.nombre || perfil?.email || '';
  const apellido = perfil?.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  // Mapear icono de rol
  const getRolIcon = (tipousuario) => {
    switch (tipousuario?.toLowerCase()) {
      case 'jugador':
        return (
          <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            <path d="M2 12h20" />
          </svg>
        );
      case 'entrenador':
        return (
          <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19h16M4 15h16M4 11h16M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="3" width="20" height="18" rx="2" />
          </svg>
        );
      default:
        return (
          <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M3 10h18M5 6h14M9 2v4M15 2v4" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="4" y="6" width="16" height="15" rx="1" />
          </svg>
        );
    }
  };

  return (
    <section className="perfil-header-card">
      {/* Banner de Portada Deportivo Decorativo */}
      <div className="perfil-cover-banner">
        <div className="banner-grid-overlay"></div>
        <div className="banner-glow-spot"></div>
      </div>

      <div className="perfil-header-main-content">
        <div className="perfil-header-left">
          <div className="perfil-photo-wrapper">
            {perfil?.fotoperfil ? (
              <img src={perfil.fotoperfil} alt={nombreCompleto} className="perfil-photo-img" />
            ) : (
              <div className="perfil-initials-avatar">
                {(nombre || perfil?.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="online-status-dot"></span>
          </div>

          <div className="perfil-names-block">
            <h1 className="perfil-full-name">{nombreCompleto}</h1>
            <div className="perfil-meta-badges">
              {perfil?.tipousuario && (
                <span className="perfil-meta-badge role-badge">
                  {getRolIcon(perfil.tipousuario)}
                  {perfil.tipousuario}
                </span>
              )}
              {perfil?.ubicacion && (
                <span className="perfil-meta-badge location-badge">
                  <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {perfil.ubicacion}
                </span>
              )}
            </div>
            
            {perfil?.descripcion && (
              <p className="perfil-header-bio">{perfil.descripcion}</p>
            )}
          </div>
        </div>

        <div className="perfil-header-actions-block">
          <button className="btn-editar-perfil-cyber">
            <span className="btn-bg"></span>
            <span className="btn-text">
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Editar perfil
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PerfilHeader;
