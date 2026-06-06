import React from 'react';
import './PerfilSidebar.css';

/*
  Sidebar derecho que muestra datos cuantitativos o de perfil breve.
  - No asume que existan todos los campos; renderiza sólo los presentes en `perfil`.
  - `campos` es la lista de claves que intentamos mostrar si existen.
*/
const PerfilSidebar = ({ perfil }) => {
  const campos = [
    { key: 'edad', label: 'Edad' },
    { key: 'altura', label: 'Altura' },
    { key: 'posicion', label: 'Posición' },
    { key: 'experiencia', label: 'Experiencia' },
    { key: 'categoria', label: 'Categoría' },
    { key: 'genero', label: 'Género' },
    { key: 'rating', label: 'Rating' },
    { key: 'pruebas', label: 'Pruebas asistidas' },
  ];

  return (
    <div className="perfil-sidebar">
      <div className="perfil-card">
        <h3>Perfil</h3>
        <div className="perfil-card-body">
          {campos.map(c => (
            // Renderizamos la fila sólo si el campo existe en el objeto `perfil`.
            perfil && perfil[c.key] ? (
              <div key={c.key} className="perfil-row">
                <div className="perfil-row-key">{c.label}</div>
                <div className="perfil-row-val">{perfil[c.key]}</div>
              </div>
            ) : null
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerfilSidebar;
