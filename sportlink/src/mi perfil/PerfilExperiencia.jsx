import React from 'react';
import './PerfilExperiencia.css';

const PerfilExperiencia = ({ perfil }) => {
  const rol = perfil?.tipousuario;

  const titulo = rol === 'jugador'
    ? 'Trayectoria como deportista'
    : rol === 'entrenador'
      ? 'Experiencia como entrenador'
      : 'Imágenes del club';

  // Si el backend no devuelve experiencias, usamos arreglos vacíos
  const experiencias = perfil?.experiencias || perfil?.trayectoria || [];

  // Mapear icono de sección según rol
  const getSeccionIcon = () => {
    if (rol === 'jugador') {
      return (
        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="7" />
          <path d="M5.21 14A10 10 0 0 0 12 22a10 10 0 0 0 6.79-8" />
        </svg>
      );
    }
    return (
      <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    );
  };

  return (
    <section className="perfil-experiencia-card">
      <div className="card-section-header">
        {getSeccionIcon()}
        <h2>{titulo}</h2>
      </div>

      <div className="perfil-experiencia-content">
        {Array.isArray(experiencias) && experiencias.length > 0 ? (
          <div className="experience-timeline">
            {experiencias.map((experiencia, indice) => (
              <article key={indice} className="exp-timeline-item">
                <div className="timeline-node">
                  <div className="timeline-node-dot"></div>
                  <div className="timeline-node-line"></div>
                </div>
                <div className="exp-card-body">
                  <div className="exp-header-info">
                    {experiencia.titulo && <h3 className="exp-item-title">{experiencia.titulo}</h3>}
                    {experiencia.empresa && <span className="exp-item-org">{experiencia.empresa}</span>}
                  </div>
                  {experiencia.descripcion && <p className="exp-item-desc">{experiencia.descripcion}</p>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="perfil-empty-container">
            <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="perfil-empty">Sin trayectoria o experiencia disponible.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PerfilExperiencia;
