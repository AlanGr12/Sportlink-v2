import React from 'react';
import './PerfilPublicaciones.css';

const PerfilPublicaciones = () => {
  return (
    <section className="perfil-publicaciones-card">
      <div className="card-section-header">
        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <h2>Publicaciones</h2>
      </div>

      <div className="publicaciones-empty-feed">
        <div className="feed-scanner-glow"></div>
        <div className="feed-empty-art">
          <svg className="feed-icon-big" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <div className="empty-feed-radar">
            <span className="radar-circle rc1"></span>
            <span className="radar-circle rc2"></span>
          </div>
        </div>
        
        <h3>Sin actividad reciente</h3>
        <p>Tu canal de entrenamiento, fichajes y victorias estará disponible muy pronto. ¡Prepárate para compartir tus próximos logros con la comunidad!</p>
        
        <div className="feed-future-badges">
          <span className="future-badge">Fotos</span>
          <span className="future-badge">Vídeos</span>
          <span className="future-badge">Logros</span>
        </div>
      </div>
    </section>
  );
};

export default PerfilPublicaciones;
