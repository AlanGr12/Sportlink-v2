import React, { useState } from 'react';
import iconFutbol from '../assets/futbol.png';
import iconBasquet from '../assets/basquet.png';
import iconEntrenamientos from '../assets/entrenamientos.png';
import iconFecha from '../assets/fecha.png';
import iconUbicacion from '../assets/ubicacion.png';

import fallbackFutbol from '../assets/entrenador1.png';
import fallbackBasket from '../assets/entrenador2.png';
import fallbackDefault from '../assets/entrenador3.png';
import './TarjetaEntrenamiento.css';

const TarjetaEntrenamiento = ({ entrenamiento, onVerDetalle, onEditar, onBorrar, usuarioActual }) => {
  const [expandido, setExpandido] = useState(false);

  // Obtener la imagen: priorizar imagen proveniente del backend (URL o campo), sino fallback por tipo
  const getDeporteImagen = () => {
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
      });
    } catch {
      return fechaStr;
    }
  };

  // Mapear días de recurrencia a nombres en español
  const diasSemana = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo'
  };

  // Solo permitir acciones de edición/borrado si el usuario es entrenador
  const esPropietario = usuarioActual && usuarioActual.tipousuario === 'entrenador';

  return (
    <div className="tarjeta-entrenamiento">
      {/* Banner / Foto de Perfil */}
      <div className="tarjeta-banner-container">
        <img 
          src={getDeporteImagen()} 
          alt={entrenamiento.titulo} 
          className="tarjeta-banner-img" 
        />
        <div className="tarjeta-banner-overlay" />
        <h3 className="tarjeta-nombre-entrenador">
          {entrenamiento.entrenadorNombre || 'Entrenador Sportlink'}
        </h3>
      </div>

      {/* Contenido */}
      <div className="tarjeta-contenido">
        <div className="tarjeta-tipoDeporte-container">
          <span className="tarjeta-tipo-deporte">
            {entrenamiento.tipo || 'ENTRENAMIENTO'}
          </span>
          <span className="tarjeta-intensidad">{entrenamiento.intensidad || 'media'}</span>
        </div>

        <div className="tarjeta-detalles-lista">
          {/* Título de entrenamiento */}
          <div className="tarjeta-detalle-item destacado">
            <span className="tarjeta-titulo-texto">{entrenamiento.titulo}</span>
          </div>

          {/* Duración */}
          <div className="tarjeta-detalle-item">
            <span className="tarjeta-detalle-label"><span className="accent">⏱</span> Duración:</span>
            <span className="tarjeta-detalle-valor-resaltado">{entrenamiento.duracionMinutos} Minutos</span>
          </div>

          {/* Ubicación */}
          <div className="tarjeta-detalle-item">
            <span className="tarjeta-detalle-label"><img src={iconUbicacion} alt="Ubicación" className="icon-small" /> Ubicación:</span>
            <span className="valor-derecha">{entrenamiento.ubicacion || 'Cancha Principal'}</span>
          </div>

          {/* Horarios */}
          <div className="tarjeta-detalle-item">
            <span className="tarjeta-detalle-label"><img src={iconFecha} alt="Horario" className="icon-small" /> Horarios:</span>
            {entrenamiento.recurrente && entrenamiento.recurrente.frecuencia ? (
              <>
                <span className="tarjeta-detalle-valor-resaltado pequeno">Recurrente ({entrenamiento.recurrente.frecuencia})</span>
                <button className="tarjeta-detalle-ver-mas" onClick={() => setExpandido(!expandido)}>{expandido ? 'Ver menos' : 'Ver más'}</button>
              </>
            ) : (
              <span className="valor-derecha">{formatearFecha(entrenamiento.fechaHora)}</span>
            )}
          </div>

          {/* Desplegable de Horarios Recurrentes */}
          {expandido && entrenamiento.recurrente && entrenamiento.recurrente.dias && (
            <div className="tarjeta-horarios-expandido">
              {entrenamiento.recurrente.dias.map((diaNum) => (
                <div className="horario-fila" key={diaNum}>
                  <span className="horario-dia">{diasSemana[diaNum] || 'Día'}:</span>
                  <span className="horario-horas">
                    {new Date(entrenamiento.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Acción */}
        <button 
          className="btn-mas-informacion"
          onClick={() => onVerDetalle(entrenamiento)}
        >
          Más Información
        </button>

        {/* Pie de Tarjeta (Reseñas + Acciones Admin) */}
        <div className="tarjeta-pie">
          <div className="pie-row">
            <div className="rating-estrellas">
              <span className="estrella-icono">★</span>
              <span className="estrella-icono">★</span>
              <span className="estrella-icono">★</span>
              <span className="estrella-icono">★</span>
              <span className="estrella-icono faded">★</span>
              <span className="rating-texto">({entrenamiento.ratingTotal || 15})</span>
            </div>
            <span className="ver-resenas-link">Ver reseñas ›</span>
          </div>

          {/* Botones de edición/borrado para el propietario/entrenador */}
          {esPropietario && (
            <div className="tarjeta-acciones-admin">
              <button 
                className="btn-accion-icono edit" 
                title="Editar Entrenamiento"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditar(entrenamiento);
                }}
              >
                ✏️
              </button>
              <button 
                className="btn-accion-icono delete" 
                title="Eliminar Entrenamiento"
                onClick={(e) => {
                  e.stopPropagation();
                  onBorrar(entrenamiento.id);
                }}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TarjetaEntrenamiento;
