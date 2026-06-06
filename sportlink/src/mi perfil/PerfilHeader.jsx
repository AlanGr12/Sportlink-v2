import React from 'react';
import './PerfilHeader.css';

/*
  - Muestra foto o iniciales.
  - Muestra nombre completo y meta tags (ubicación / tipo de usuario).
  - Botón "Editar perfil" preparado visualmente (sin lógica de edición aún).
  - Recibe: `perfil` (objeto) desde el `MiPerfil`.
*/
const PerfilHeader = ({ perfil }) => {
  const nombre = perfil?.nombre || perfil?.email || '';
  const apellido = perfil?.apellido || '';
  const nombreCompleto = `${nombre} ${apellido}`.trim();

  return (
    <section className="perfil-header">
      <div className="perfil-header-left">
        <div className="perfil-photo">
          {perfil?.fotoperfil ? (
            <img src={perfil.fotoperfil} alt={nombreCompleto} />
          ) : (
            <div className="perfil-initials">{(nombre || perfil?.email || 'U').charAt(0).toUpperCase()}</div>
          )}
        </div>
        <div className="perfil-names">
          <h1>{nombreCompleto}</h1>
          <div className="perfil-meta">
            {/* Mostrar condicionalmente los badges/meta si existen */}
            {perfil?.ubicacion && <span className="perfil-meta-item">{perfil.ubicacion}</span>}
            {perfil?.tipousuario && <span className="perfil-meta-item">{perfil.tipousuario}</span>}
          </div>
        </div>
      </div>

      <div className="perfil-header-actions">
        <button className="btn-editar">Editar perfil</button>
      </div>
    </section>
  );
};

export default PerfilHeader;
