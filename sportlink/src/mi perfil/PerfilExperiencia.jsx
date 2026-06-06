import React from 'react';
import './PerfilExperiencia.css';

const PerfilExperiencia = ({ perfil }) => {
  const rol = perfil?.tipousuario;

  const titulo = rol === 'jugador'
    ? 'Trayectoria como deportista'
    : rol === 'entrenador'
      ? 'Experiencia como entrenador'
      : 'Imagenes del club';

  // Si el backend no devuelve experiencias, usamos arreglos vacíos
  const experiencias = perfil?.experiencias || perfil?.trayectoria || [];

  return (
    <section className="perfil-experiencia">
      <h4>{titulo}</h4>
      {Array.isArray(experiencias) && experiencias.length > 0 ? (
        experiencias.map((experiencia, indice) => (
          <article key={indice} className="exp-card">
            {experiencia.titulo && <h3>{experiencia.titulo}</h3>}
            {experiencia.empresa && <div className="exp-sub">{experiencia.empresa}</div>}
            {experiencia.descripcion && <p>{experiencia.descripcion}</p>}
          </article>
        ))
      ) : (
        <div className="perfil-empty">Sin información de experiencia disponible.</div>
      )}
    </section>
  );
};

export default PerfilExperiencia;
