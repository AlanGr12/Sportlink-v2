import React from 'react';
import TarjetaEntrenamiento from './TarjetaEntrenamiento';
import './ListaEntrenamientos.css';

const ListaEntrenamientos = ({ 
  entrenamientos, 
  loading, 
  error, 
  onVerDetalle, 
  onEditar, 
  onBorrar, 
  usuarioActual,
  onReintentar
}) => {
  if (loading) {
    return (
      <div className="loading-box">
        <div className="spinner"></div>
        <p>Cargando entrenamientos de alto rendimiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-box">
        <p className="lista-error-title">⚠️ Ocurrió un error al cargar los entrenamientos</p>
        <p className="lista-error-message">{error}</p>
        {onReintentar && (
          <button className="btn-reintentar" onClick={onReintentar}>Reintentar</button>
        )}
      </div>
    );
  }

  if (!entrenamientos || entrenamientos.length === 0) {
    return (
      <div className="vacio-box">
        <p className="vacio-title">No se encontraron entrenamientos</p>
        <p className="vacio-message">Intenta cambiar los filtros de búsqueda o agrega uno nuevo.</p>
      </div>
    );
  }
  
  return (
    <div className="lista-entrenamientos-grid">
      {entrenamientos.map((entrenamiento) => (
        <TarjetaEntrenamiento
          key={entrenamiento.id}
          entrenamiento={entrenamiento}
          onVerDetalle={onVerDetalle}
          onEditar={onEditar}
          onBorrar={onBorrar}
          usuarioActual={usuarioActual}
        />
      ))}
    </div>
  );
};

export default ListaEntrenamientos;
