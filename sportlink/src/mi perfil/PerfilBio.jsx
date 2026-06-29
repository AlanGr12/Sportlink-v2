import React from 'react';
import './PerfilBio.css';

// - Recibe `perfil` por props y muestra `perfil.descripcion` si existe.
// - Con estilo moderno, cabecera de sección y acentos deportivos.

const PerfilBio = ({ perfil }) => {
  if (!perfil) return null;

  return (
    <section className="perfil-bio-card">
      <div className="card-section-header">
        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M3 20h3.5a2.5 2.5 0 0 0 2.5-2.5V4m0 0a2.5 2.5 0 0 1 2.5-2.5H21v16H8.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>Biografía</h2>
      </div>

      <div className="perfil-bio-content">
        {perfil.descripcion ? (
          <p className="perfil-bio-text">{perfil.descripcion}</p>
        ) : (
          <div className="perfil-empty-container">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="perfil-empty">Sin biografía disponible.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PerfilBio;
