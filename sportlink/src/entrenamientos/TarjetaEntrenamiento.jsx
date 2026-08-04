import React from 'react';
import { IconoFutbol } from '../iconos/IconoFutbol.jsx';
import { IconoPrecio } from '../iconos/IconoPrecio.jsx';
import { IconoModalidad } from '../iconos/IconoModalidad.jsx';
import { IconoFecha } from '../iconos/IconoFecha.jsx';
import { IconoUbicacion } from '../iconos/IconoUbicacion.jsx';

import fallbackFutbol from '../assets/entrenador1.png';
import fallbackBasket from '../assets/entrenador2.png';
import fallbackDefault from '../assets/entrenador3.png';
import './TarjetaEntrenamiento.css';

const TarjetaEntrenamiento = ({ entrenamiento, onVerDetalle, onEditar, onBorrar, usuarioActual }) => {

  console.log("Imagen entrenamiento:", entrenamiento.imagen);

  // URL base del bucket de entrenamientos en Supabase Storage
  const SUPABASE_STORAGE_BASE =
    'https://cczzvdaraenyqyujbsup.supabase.co/storage/v1/object/public/fotoEntrenamientos';

  // Obtener la URL completa de la imagen.
  // - Si ya es una URL absoluta (http...) → usarla directamente (backend normalizado).
  // - Si es solo un nombre de archivo → construir la URL completa (igual que el modal).
  // - Si no hay imagen → fallback por tipo de deporte.
  const getDeporteImagen = () => {
    const img = entrenamiento.imagen;

    if (img) {
      // Ya es URL completa (el backend la normalizó)
      if (img.startsWith('http')) return img;
      // Solo nombre de archivo (datos legacy en caché local)
      return `${SUPABASE_STORAGE_BASE}/${img}`;
    }

    if (entrenamiento.entrenadorFoto) return entrenamiento.entrenadorFoto;

    const t = (entrenamiento.tipo || '').toLowerCase();

    if (
      t.includes('futbol') ||
      t.includes('fútbol') ||
      t.includes('fuerza')
    ) {
      return fallbackFutbol;
    } else if (
      t.includes('basket') ||
      t.includes('basquet') ||
      t.includes('basketball')
    ) {
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

  // Solo puede editar/borrar el entrenador que creó este entrenamiento
  const creadorId =
    entrenamiento.entrenadorId ??
    entrenamiento.trainerId ??
    entrenamiento.userId ??
    entrenamiento.creadorId ??
    entrenamiento.id_entrenador ??
    null;

  const esPropietario =
    usuarioActual &&
    usuarioActual.tipousuario === 'entrenador' &&
    creadorId !== null &&
    String(creadorId) === String(usuarioActual.id);

  return (
    <div className="tarjeta-entrenamiento">

      {/* Imagen */}
      <div className="card-imagen-wrapper">
        {getDeporteImagen() ? (
          <img
            src={getDeporteImagen()}
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

      {/* Información */}
      <div className="card-prueba-info">
        <h2>
          {entrenamiento.tipo
            ? entrenamiento.tipo.toUpperCase()
            : 'ENTRENAMIENTO'}
        </h2>

        <div className="card-prueba-detalles-lista">

          <div className="card-prueba-detalle-item">
            <IconoPrecio size={16} />
            <p>
              {entrenamiento.precio
                ? `$${entrenamiento.precio}`
                : 'Precio a consultar'}
            </p>
          </div>

          <div className="card-prueba-detalle-item">
            <IconoFecha size={16} />
            <p>
              {entrenamiento.fechaentr
                ? formatearFecha(entrenamiento.fechaentr)
                : 'Fecha a confirmar'}
            </p>
          </div>

          <div className="card-prueba-detalle-item">
            <IconoModalidad size={16} />
            <p>
              {entrenamiento.cantidad ||
              entrenamiento.cantidadJugadores ||
              entrenamiento.capacidad
                ? `${entrenamiento.cantidad || entrenamiento.cantidadJugadores || entrenamiento.capacidad} cupos`
                : 'Cupos a confirmar'}
            </p>
          </div>

          <div className="card-prueba-detalle-item">
            <IconoUbicacion size={16} />
            <p>{entrenamiento.ubicacion || 'Ubicación no especificada'}</p>
          </div>

        </div>
      </div>

      {/* Botones */}
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