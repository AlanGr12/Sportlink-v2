import React from 'react';
import './PerfilResenas.css';

/*
  Componente de reseñas con diseño moderno de recomendaciones deportivas.
  - Si el backend no devuelve reseñas, muestra un contenedor de estado vacío elegante.
  - Preparado para integrar reseñas reales en el futuro.
*/
const PerfilResenas = ({ perfil }) => {
  const resenas = perfil?.resenas || [];

  return (
    <section className="perfil-resenas-card">
      <div className="card-section-header">
        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2>Reseñas y Recomendaciones</h2>
      </div>

      <div className="perfil-resenas-content">
        {Array.isArray(resenas) && resenas.length > 0 ? (
          <div className="resenas-grid-list">
            {resenas.map((resena, indice) => (
              <article key={indice} className="resena-card-item">
                {/* Icono decorativo de comillas dobles */}
                <div className="quote-mark-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                <p className="resena-body-text">{resena.texto}</p>
                
                <div className="resena-author-meta">
                  <span className="author-avatar-stub">
                    {(resena.autor || 'A').charAt(0).toUpperCase()}
                  </span>
                  <div className="author-details-block">
                    <span className="author-name">{resena.autor || 'Anónimo'}</span>
                    <span className="author-subtitle">Recomendación de Sportlink</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="perfil-empty-container">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="perfil-empty">Sin reseñas o recomendaciones disponibles aún.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PerfilResenas;
