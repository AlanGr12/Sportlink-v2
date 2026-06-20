import React from 'react';
import fallbackFutbol from '../assets/entrenador1.png';
import fallbackBasket from '../assets/entrenador2.png';
import fallbackDefault from '../assets/entrenador3.png';
import iconFecha from '../assets/fecha.png';
import iconUbicacion from '../assets/ubicacion.png';
import './DetalleEntrenamiento.css';

const DetalleEntrenamiento = ({ entrenamiento, onCerrar }) => {
  const getDeporteImagen = () => {
    // Priorizar imagen enviada por backend (puede ser `imagen` o `entrenadorFoto`)
    if (entrenamiento.imagen) return entrenamiento.imagen;
    if (entrenamiento.entrenadorFoto) return entrenamiento.entrenadorFoto;
    const t = (entrenamiento.tipo || '').toLowerCase();
    if (t.includes('futbol') || t.includes('fútbol') || t.includes('fuerza')) {
      return fallbackFutbol;
    } else if (t.includes('basket') || t.includes('basquet') || t.includes('basketball')) {
      return fallbackBasket;
    }
    return fallbackDefault;
  };

  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' hs';
    } catch {
      return fechaStr;
    }
  };

  const diasSemana = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };

  return (
    <div className="detalle-grid">
      <img 
        src={getDeporteImagen()} 
        alt={entrenamiento.titulo} 
        className="detalle-banner"
      />

      <div className="detalle-info-header">
        <span className="detalle-tipo">{entrenamiento.tipo || 'ENTRENAMIENTO'}</span>
        <h2 className="detalle-titulo">{entrenamiento.titulo}</h2>
        <p className="detalle-autor">Por {entrenamiento.entrenadorNombre || 'Entrenador Asociado'}</p>
      </div>

      <div className="detalle-seccion">
        <h4 className="detalle-seccion-titulo">Descripción y Objetivos</h4>
        <p className="detalle-descripcion">
          {entrenamiento.descripcion || 'Sin descripción detallada. Este entrenamiento está diseñado para mejorar el rendimiento físico general, la agilidad y las habilidades técnicas del deportista.'}
        </p>
      </div>

      <div className="detalle-seccion">
        <h4 className="detalle-seccion-titulo">Especificaciones Técnicas</h4>
        <div className="detalle-items-grid">
          <div className="detalle-item-caja">
            <span className="detalle-item-label">⏱ Duración</span>
            <span className="detalle-item-valor">{entrenamiento.duracionMinutos} Minutos</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label">⚡ Intensidad</span>
            <span className="detalle-item-valor capitalized">{entrenamiento.intensidad || 'Media'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconUbicacion} alt="Ubicación" className="icon-small" /> Ubicación</span>
            <span className="detalle-item-valor">{entrenamiento.ubicacion || 'Predio Deportivo'}</span>
          </div>

          <div className="detalle-item-caja">
            <span className="detalle-item-label"><img src={iconFecha} alt="Horario" className="icon-small" /> Horario</span>
            <span className="detalle-item-valor small">{formatearFecha(entrenamiento.fechaHora)}</span>
          </div>
        </div>
      </div>

      {entrenamiento.recurrente && entrenamiento.recurrente.frecuencia && (
        <div className="detalle-seccion">
          <h4 className="detalle-seccion-titulo">Recurrencia Planificada</h4>
          <p className="detalle-recurrente-text">Este entrenamiento se dicta con frecuencia <strong className="accent">{entrenamiento.recurrente.frecuencia}</strong> los siguientes días:</p>
          <div className="detalle-recurrente-list">
            {entrenamiento.recurrente.dias && entrenamiento.recurrente.dias.map((d) => (
              <span key={d} className="recurrente-pill">{diasSemana[d]}</span>
            ))}
          </div>
        </div>
      )}

      {entrenamiento.adjunto && (
        <div className="detalle-seccion">
          <h4 className="detalle-seccion-titulo">Material táctico adjunto</h4>
          <div className="adjunto-box">
            <span className="adjunto-nombre">📂 {entrenamiento.adjunto.split('/').pop()}</span>
            <a href={entrenamiento.adjunto} target="_blank" rel="noopener noreferrer" className="adjunto-descargar">Descargar</a>
          </div>
        </div>
      )}

      <div className="detalle-actions">
        <button className="btn-cancelar" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  );
};

export default DetalleEntrenamiento;
