import React from 'react';
import './PerfilSidebar.css';

/*
  Tarjeta lateral "PERFIL":
  - Ubicada en la columna lateral derecha de la pantalla de perfil.
  - Para Clubes y Entrenadores, muestra el valor dinámico RATING (ej: 4.9 ★)
    calculado a partir del promedio devuelto por el backend (GET /api/resenias/:tipo/:id).
  - Para Jugadores, muestra los campos deportivos específicos sin incluir el rating de reseñas.
*/
const PerfilSidebar = ({ perfil, ratingPromedio, totalResenas }) => {
  if (!perfil) return null;

  const rol = perfil?.tipousuario?.toLowerCase();
  const esClubOEntrenador = rol === 'entrenador' || rol === 'club';

  // Helper para renderizar iconos de atributos
  const getFieldIcon = (key) => {
    switch (key) {
      case 'rating':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="#2DEFF2" stroke="#2DEFF2" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'deporte':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
          </svg>
        );
      case 'ubicacion':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        );
      case 'edad':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        );
      case 'altura':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        );
      case 'posicion':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12h20M12 2v20" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        );
      case 'experiencia':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="7" />
            <path d="M5.21 14A10 10 0 0 0 12 22a10 10 0 0 0 6.79-8" />
          </svg>
        );
      case 'categoria':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a4 4 0 0 1 4 4v5a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
          </svg>
        );
      case 'genero':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        );
      case 'titulo':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
          </svg>
        );
      default:
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
    }
  };

  // Extraer deporte legible
  const deporteStr = perfil.deporte?.deporte || 
    (Array.isArray(perfil.deportes) ? perfil.deportes.map(d => d.deporte || d).join(', ') : perfil.deporte) || null;

  // Rating formateado dinámicamente
  const tieneRatingCalculado = ratingPromedio !== undefined && ratingPromedio !== null;
  const ratingValor = tieneRatingCalculado && Number(ratingPromedio) > 0
    ? `${Number(ratingPromedio).toFixed(1)} `
    : '— ';

  // Configuración de campos dinámicos
  const items = [];

  // Métrica RATING en tarjeta PERFIL (SOLO para Clubes y Entrenadores)
  if (esClubOEntrenador) {
    items.push({
      key: 'rating',
      label: 'Rating',
      value: (
        <span style={{ color: '#fbbf24', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {tieneRatingCalculado && Number(ratingPromedio) > 0
            ? ratingValor
            : <span style={{ color: '#2DEFF2' }}>—</span>}
          <span style={{ color: '#2DEFF2' }}>★</span>
          {totalResenas !== undefined && totalResenas > 0 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              ({totalResenas})
            </span>
          )}
        </span>
      ),
    });
  }

  if (deporteStr) {
    items.push({ key: 'deporte', label: 'Deporte', value: deporteStr });
  }

  if (perfil.ubicacion) {
    items.push({ key: 'ubicacion', label: 'Ubicación', value: perfil.ubicacion });
  }

  if (perfil.titulo) {
    items.push({ key: 'titulo', label: 'Título', value: perfil.titulo });
  }

  if (perfil.experiencia) {
    items.push({ key: 'experiencia', label: 'Experiencia', value: perfil.experiencia });
  }

  if (perfil.posicion) {
    items.push({ key: 'posicion', label: 'Posición', value: perfil.posicion });
  }

  if (perfil.categoria) {
    items.push({ key: 'categoria', label: 'Categoría', value: perfil.categoria });
  }

  if (perfil.edad) {
    items.push({ key: 'edad', label: 'Edad', value: `${perfil.edad} años` });
  }

  if (perfil.altura) {
    items.push({ key: 'altura', label: 'Altura', value: perfil.altura });
  }

  if (perfil.genero) {
    items.push({ key: 'genero', label: 'Género', value: perfil.genero });
  }

  if (items.length === 0) return null;

  return (
    <div className="perfil-sidebar-card">
      <div className="sidebar-card-header">
        <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>PERFIL</h3>
      </div>
      <div className="sidebar-card-body">
        {items.map((item) => (
          <div key={item.key} className="perfil-info-row perfil-stat-row">
            <div className="perfil-info-label perfil-stat-label">
              {getFieldIcon(item.key)}
              <span>{item.label}</span>
            </div>
            <div className="perfil-info-value perfil-stat-value">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerfilSidebar;
