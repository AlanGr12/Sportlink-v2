import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

// Los mismos iconos que usa pruebas.jsx
import iconoMedalla   from '../assets/medalla.png';
import iconoUbicacion from '../assets/ubicacion.png';
import iconoFecha     from '../assets/fecha.png';
import iconoModalidad from '../assets/modalidad.png';

import '../pruebas/pruebas.css';
import '../entrenamientos/entrenamientos.css';

const formatearFecha = (fechaStr) => {
  try {
    return new Date(fechaStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  } catch {
    return 'Fecha a confirmar';
  }
};

/**
 * ModalDetallePrueba
 * Muestra el mismo popup de detalle que existe en la view de Pruebas.
 *
 * Props:
 *  - prueba        objeto Prueba (ya cargado) o null si está cargando
 *  - loading       boolean — muestra spinner mientras carga
 *  - error         string | null — mensaje de error si falló la carga
 *  - onCerrar()    callback para cerrar
 *  - usuario       objeto usuario (para mostrar botón inscribirse si aplica)
 */
export default function ModalDetallePrueba({ prueba, loading, error, onCerrar, usuario }) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCerrar]);

  // Bloquear scroll del body
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const nombreClub = prueba?.club?.nombre
    ? prueba.club.nombre.toUpperCase()
    : prueba?.descripcion
      ? 'DETALLE DE PRUEBA'
      : 'PRUEBA DEPORTIVA';

  return createPortal(
    <div
      className="modal-prueba-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div
        className="modal-prueba-contenedor"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header sticky */}
        <div className="modal-prueba-header">
          <h3 className="modal-prueba-titulo">{nombreClub}</h3>
          <button className="modal-prueba-cerrar" onClick={onCerrar}>×</button>
        </div>

        {/* Cuerpo scrollable */}
        <div className="modal-prueba-cuerpo">

          {/* Estado de carga */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-family)', fontSize: '14px' }}>
              Cargando información de la prueba…
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="form-error-banner" style={{ margin: '20px 0' }}>
              {error}
            </div>
          )}

          {/* Contenido */}
          {prueba && !loading && (
            <>
              {/* Banner imagen */}
              {prueba.imagen ? (
                <img
                  src={prueba.imagen}
                  alt={prueba.club?.nombre || 'prueba'}
                  className="modal-prueba-banner"
                />
              ) : (
                <div className="modal-prueba-banner-fallback">
                  Sin imagen disponible
                </div>
              )}

              {/* Nombre del club */}
              <h2 className="modal-prueba-club">
                {prueba.club?.nombre || 'Club Desconocido'}
              </h2>

              {/* Grilla de specs */}
              <div className="modal-prueba-specs">

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoMedalla} alt="Deporte" />
                    Deporte
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {prueba.deporte?.deporte || 'No especificado'}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoModalidad} alt="Categoría" />
                    Categoría
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {prueba.categoria || 'No especificada'}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoUbicacion} alt="Zona" />
                    Zona
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {prueba.zona || 'No especificada'}
                  </span>
                </div>

                <div className="modal-prueba-spec-item">
                  <span className="modal-prueba-spec-label">
                    <img src={iconoFecha} alt="Fecha" />
                    Fecha
                  </span>
                  <span className="modal-prueba-spec-valor">
                    {prueba.fechaprueba ? formatearFecha(prueba.fechaprueba) : 'A confirmar'}
                  </span>
                </div>

                {(prueba.horainicio || prueba.horafin) && (
                  <div className="modal-prueba-spec-item">
                    <span className="modal-prueba-spec-label">
                      <img src={iconoFecha} alt="Horario" />
                      Horario
                    </span>
                    <span className="modal-prueba-spec-valor">
                      {prueba.horainicio || ''}{prueba.horainicio && prueba.horafin ? ' - ' : ''}{prueba.horafin || ''}
                    </span>
                  </div>
                )}

                {prueba.genero && (
                  <div className="modal-prueba-spec-item">
                    <span className="modal-prueba-spec-label">
                      <img src={iconoModalidad} alt="Género" />
                      Género
                    </span>
                    <span className="modal-prueba-spec-valor">{prueba.genero}</span>
                  </div>
                )}

                {prueba.cupo && (
                  <div className="modal-prueba-spec-item">
                    <span className="modal-prueba-spec-label">
                      <img src={iconoMedalla} alt="Cupo" />
                      Cupo
                    </span>
                    <span className="modal-prueba-spec-valor">{prueba.cupo} jugadores</span>
                  </div>
                )}

              </div>

              {/* Descripción */}
              {prueba.descripcion && (
                <>
                  <p className="modal-prueba-descripcion-titulo">Descripción</p>
                  <p className="modal-prueba-descripcion-texto">
                    {prueba.descripcion}
                  </p>
                </>
              )}
            </>
          )}

          {/* Pie de acciones */}
          <div className="modal-prueba-acciones">
            <button className="btn-cancelar" onClick={onCerrar}>
              Cerrar
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
