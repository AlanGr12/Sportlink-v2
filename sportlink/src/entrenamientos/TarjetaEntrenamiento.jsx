import React from 'react';
import iconFutbol from '../assets/futbol.png';
import iconPrecio from '../assets/precio.png';
import iconModalidad from '../assets/modalidad.png';
import iconFecha from '../assets/fecha.png';
import iconUbicacion from '../assets/ubicacion.png';

import fallbackFutbol from '../assets/entrenador1.png';
import fallbackBasket from '../assets/entrenador2.png';
import fallbackDefault from '../assets/entrenador3.png';
import './TarjetaEntrenamiento.css';

const TarjetaEntrenamiento = ({ entrenamiento, onVerDetalle, onEditar, onBorrar, usuarioActual }) => {

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
  }
  
  console.log(entrenamiento);
  ;

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

  // Solo puede editar/borrar el entrenador que CREÓ este entrenamiento específico.
  // Se cubren los distintos nombres de campo que puede traer el backend.
  const creadorId =
    entrenamiento.entrenadorId ??
    entrenamiento.trainerId     ??
    entrenamiento.userId        ??
    entrenamiento.creadorId     ??
    entrenamiento.id_entrenador ??
    null;
  const esPropietario =
    usuarioActual &&
    usuarioActual.tipousuario === 'entrenador' &&
    creadorId !== null &&
    String(creadorId) === String(usuarioActual.id);

  return (
    <div className="tarjeta-entrenamiento">

      {/* ── Imagen (mitad superior, altura fija 200px — clon de pruebas.jsx) ── */}
      <div className="card-imagen-wrapper">
        {entrenamiento.imagen ? (
          <img
  src={`https://cczzvdaraenyqyujbsup.supabase.co/storage/v1/object/public/fotoEntrenamientos/${entrenamiento.imagen}`}
  alt={entrenamiento.titulo}
/>
        ) : (
          <div className="sin-imagen">SIN FOTO</div>
        )}
        <div className="card-imagen-overlay" aria-hidden="true" />
        <h3 className="tarjeta-nombre-entrenador">
          {entrenamiento.entrenadores?.nombre}
        </h3>
      </div>

      {/* ── Info (flex-grow:1 → queda dentro del fondo) ── */}
      <div className="card-prueba-info">
        <h2>
          {entrenamiento.tipo
            ? entrenamiento.tipo.toUpperCase()
            : 'ENTRENAMIENTO'
            }
        </h2>

        <div className="card-prueba-detalles-lista">
          {/* Precio — icono: precio.png */}
          <div className="card-prueba-detalle-item">
            <img src={iconPrecio} alt="Precio" className="card-icon-asset" />
            <p>{entrenamiento.precio ? `$${entrenamiento.precio}` : 'Precio a consultar'}</p>
          </div>

          {/* Fecha */}
          <div className="card-prueba-detalle-item">
            <img src={iconFecha} alt="Fecha" className="card-icon-asset" />
            <p>{entrenamiento.fechaentr ? formatearFecha(entrenamiento.fechaentr) : 'Fecha a confirmar'}</p>
          </div>

          {/* Cantidad / Cupos — icono: modalidad.png (mismo que sidebar Modalidad) */}
          <div className="card-prueba-detalle-item">
            <img src={iconModalidad} alt="Cantidad" className="card-icon-asset" />
            <p>{entrenamiento.cantidad || entrenamiento.cantidadJugadores || entrenamiento.capacidad
              ? `${entrenamiento.cantidad || entrenamiento.cantidadJugadores || entrenamiento.capacidad} cupos`
              : 'Cupos a confirmar'}</p>
          </div>

          {/* Ubicación */}
          <div className="card-prueba-detalle-item">
            <img src={iconUbicacion} alt="Ubicación" className="card-icon-asset" />
            <p>{entrenamiento.ubicacion || 'Ubicación no especificada'}</p>
          </div>
        </div>
      </div>

      {/* ── Pie: botón + acciones admin, siempre dentro de la card ── */}
      <div className="card-prueba-pie">
        <button
          className="btn-mas-info"
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalle(entrenamiento);
          }}
        >
          MÁS INFORMACIÓN
        </button>

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
  );
};

export default TarjetaEntrenamiento;
