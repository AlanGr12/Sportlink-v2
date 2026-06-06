import React from 'react';
import './PerfilBio.css';

// - Recibe `perfil` por props y muestra `perfil.descripcion` si existe.

const PerfilBio = ({ perfil }) => {
  if (!perfil) return null;
  return (
    <section className="perfil-bio">
      <h4>Biografía</h4>
      {perfil.descripcion ? (
        <p className="perfil-bio-text">{perfil.descripcion}</p>
      ) : (
        <p className="perfil-empty">Sin biografía disponible.</p>
      )}
    </section>
  );
};

export default PerfilBio;
