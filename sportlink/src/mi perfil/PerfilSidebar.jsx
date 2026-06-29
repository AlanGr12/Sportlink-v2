import React from 'react';
import './PerfilSidebar.css';

/*
  Sidebar derecho que muestra datos cuantitativos o de perfil breve estilo Ficha Técnica.
  - No asume que existan todos los campos; renderiza sólo los presentes en `perfil`.
*/
const PerfilSidebar = ({ perfil }) => {
  const campos = [
    { key: 'edad', label: 'Edad', unit: ' años' },
    { key: 'altura', label: 'Altura', unit: '' },
    { key: 'posicion', label: 'Posición', unit: '' },
    { key: 'experiencia', label: 'Experiencia', unit: '' },
    { key: 'categoria', label: 'Categoría', unit: '' },
    { key: 'genero', label: 'Género', unit: '' },
    { key: 'rating', label: 'Rating', unit: '' },
    { key: 'pruebas', label: 'Pruebas asistidas', unit: '' },
  ];

  // Helper para renderizar iconos de atributos
  const getFieldIcon = (key) => {
    switch (key) {
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
      case 'rating':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      case 'pruebas':
        return (
          <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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

  // Comprobar si hay algún campo con valor para mostrar
  const tieneCampos = campos.some(c => perfil && perfil[c.key]);

  if (!tieneCampos) return null;

  return (
    <div className="perfil-sidebar-card">
      <div className="sidebar-card-header">
        <svg className="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Ficha Técnica</h3>
      </div>
      <div className="sidebar-card-body">
        {campos.map(c => {
          const val = perfil && perfil[c.key];
          if (!val) return null;

          return (
            <div key={c.key} className="perfil-stat-row">
              <div className="perfil-stat-label">
                {getFieldIcon(c.key)}
                <span>{c.label}</span>
              </div>
              <div className="perfil-stat-value">
                {val}
                {c.key === 'edad' && c.unit}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerfilSidebar;
