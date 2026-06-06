import React from 'react';
import './PerfilContacto.css';

const PerfilContacto = ({ perfil }) => {
  const tieneContacto = perfil?.email || perfil?.telefono || perfil?.instagram ||  perfil?.direccion;
  if (!tieneContacto) return null;

  return (
    <div className="perfil-contacto">
      <h5>Contacto</h5>
      <div className="contact-body">
        {perfil.email && <div className="contact-row"><strong>Email:</strong> <span>{perfil.email}</span></div>}
        {perfil.telefono && <div className="contact-row"><strong>Tel:</strong> <span>{perfil.telefono}</span></div>}
        {perfil.instagram && <div className="contact-row"><strong>IG:</strong> <span>{perfil.instagram}</span></div>}
        {perfil.direccion && <div className="contact-row"><strong>Dirección:</strong> <span>{perfil.direccion}</span></div>}
      </div>
    </div>
  );
};

export default PerfilContacto;
