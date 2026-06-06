import React from 'react';
import './PerfilResenas.css';

/*
  Componente de reseñas.
  - Si el backend no devuelve reseñas, muestra el texto "Sin reseñas disponibles".
  - Preparado para integrar reseñas reales en el futuro.
*/
const PerfilResenas = ({ perfil }) => {
  const resenas = perfil?.resenas || [];
  return (
    <section className="perfil-resenas">
      <h4>Reseñas</h4>
      {Array.isArray(resenas) && resenas.length > 0 ? (
        resenas.map((resena, indice) => (
          <article key={indice} className="resena-card">
            <div className="resena-text">{resena.texto}</div>
            <div className="resena-meta">{resena.autor || 'Anónimo'}</div>
          </article>
        ))
      ) : (
        <div className="perfil-empty">Sin reseñas disponibles</div>
      )}
    </section>
  );
};

export default PerfilResenas;
