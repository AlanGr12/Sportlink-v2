import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ModalEvento.css';

/**
 * ModalEvento — popup para crear o editar un evento personalizado.
 *
 * Props:
 *  - onGuardar(payload)   callback con el objeto evento a guardar/editar
 *  - onCerrar()           callback para cerrar el modal
 *  - fechaInicial         objeto { anio, mes, dia } (mes 0-indexed)
 *  - fechaBloqueada       si true el campo fecha queda fijo/disabled
 *  - eventoEditar         objeto evento existente para modo edición (opcional)
 */
export default function ModalEvento({
  onGuardar,
  onCerrar,
  fechaInicial,
  fechaBloqueada = false,
  eventoEditar   = null,
}) {
  const modoEdicion = !!eventoEditar;

  const [nombre,       setNombre]       = useState('');
  const [fecha,        setFecha]        = useState('');
  const [hora,         setHora]         = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [imagenFile,   setImagenFile]   = useState(null);
  const [imagenPreview,setImagenPreview]= useState(null);
  const [errores,      setErrores]      = useState({});
  const [guardando,    setGuardando]    = useState(false);
  const imagenRef = useRef(null);

  // ── Inicialización ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoEdicion && eventoEditar) {
      // Modo edición: pre-poblar campos
      setNombre(eventoEditar.nombre || '');
      setFecha(eventoEditar.fecha   || '');
      setHora(eventoEditar.hora     || '');
      setDescripcion(eventoEditar.descripcion || '');
      if (eventoEditar.imagenPreview) {
        setImagenPreview(eventoEditar.imagenPreview);
      }
    } else {
      // Modo creación: fecha inicial si viene del día seleccionado
      if (fechaInicial) {
        const { anio, mes, dia } = fechaInicial;
        const pad = (n) => String(n).padStart(2, '0');
        setFecha(`${anio}-${pad(mes + 1)}-${pad(dia)}`);
      }
      // Hora por defecto: hora actual + 1
      const ahora = new Date();
      ahora.setHours(ahora.getHours() + 1, 0, 0, 0);
      const pad = (n) => String(n).padStart(2, '0');
      setHora(`${pad(ahora.getHours())}:${pad(ahora.getMinutes())}`);
    }
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  // ── Cerrar con Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCerrar]);

  // ── Imagen ──────────────────────────────────────────────────────────────────
  const handleImagenChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagenPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleQuitarImagen = () => {
    setImagenFile(null);
    setImagenPreview(null);
    if (imagenRef.current) imagenRef.current.value = '';
  };

  // ── Validación ──────────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!nombre.trim() || nombre.trim().length < 2) {
      e.nombre = 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!fecha) e.fecha = 'La fecha es requerida.';
    if (!hora)  e.hora  = 'La hora es requerida.';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setGuardando(true);
    try {
      await onGuardar({
        // En modo edición, el id viene del evento existente
        id:           modoEdicion ? eventoEditar.id : undefined,
        nombre:       nombre.trim(),
        fecha,
        hora,
        descripcion:  descripcion.trim() || null,
        imagenPreview: imagenPreview || null,
        imagenNombre:  imagenFile?.name || null,
      });
      // onGuardar llama cerrarModal() internamente si tiene éxito,
      // lo que desmonta el componente. setGuardando(false) sólo
      // se alcanza si onGuardar lanzó una excepción, en cuyo caso
      // el modal sigue montado y el reset es necesario.
    } catch {
      setGuardando(false);
    }
  };


  return createPortal(
    <div
      className="mev-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}
    >
      <div className="mev-contenedor" role="dialog" aria-modal="true" aria-labelledby="mev-titulo">

        {/* ── Header ── */}
        <div className="mev-header">
          <div className="mev-header-left">
            <span className="mev-header-dot" />
            <h2 className="mev-titulo" id="mev-titulo">
              {modoEdicion ? 'EDITAR EVENTO' : 'NUEVO EVENTO'}
            </h2>
          </div>
          <button className="mev-btn-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Formulario ── */}
        <form className="mev-form" onSubmit={handleSubmit} noValidate>

          {/* Nombre */}
          <div className="mev-grupo">
            <label className="mev-label" htmlFor="mev-nombre">
              Nombre del evento <span className="mev-req">*</span>
            </label>
            <div className="mev-nombre-row">
              <span className="mev-color-dot" />
              <input
                id="mev-nombre"
                type="text"
                className={`mev-input mev-nombre-input${errores.nombre ? ' mev-input--error' : ''}`}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej. Entrenamiento táctico"
                autoFocus
                autoComplete="off"
              />
            </div>
            {errores.nombre && <span className="mev-error">{errores.nombre}</span>}
          </div>

          {/* Fecha + Hora */}
          <div className="mev-fila-doble">
            <div className="mev-grupo">
              <label className="mev-label" htmlFor="mev-fecha">
                Fecha <span className="mev-req">*</span>
                {fechaBloqueada && <span className="mev-bloqueado-badge">Fijada</span>}
              </label>
              <input
                id="mev-fecha"
                type="date"
                className={`mev-input${errores.fecha ? ' mev-input--error' : ''}${fechaBloqueada ? ' mev-input--disabled' : ''}`}
                value={fecha}
                onChange={(e) => { if (!fechaBloqueada) setFecha(e.target.value); }}
                readOnly={fechaBloqueada}
                disabled={fechaBloqueada}
              />
              {errores.fecha && <span className="mev-error">{errores.fecha}</span>}
            </div>

            <div className="mev-grupo">
              <label className="mev-label" htmlFor="mev-hora">
                Hora <span className="mev-req">*</span>
              </label>
              <input
                id="mev-hora"
                type="time"
                className={`mev-input${errores.hora ? ' mev-input--error' : ''}`}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
              {errores.hora && <span className="mev-error">{errores.hora}</span>}
            </div>
          </div>

          {/* Descripción */}
          <div className="mev-grupo">
            <label className="mev-label" htmlFor="mev-desc">
              Descripción <span className="mev-opcional">(Opcional)</span>
            </label>
            <textarea
              id="mev-desc"
              className="mev-textarea"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del evento, notas, lugar…"
              rows={3}
            />
          </div>

          {/* Imagen */}
          <div className="mev-grupo">
            <label className="mev-label">
              Imagen <span className="mev-opcional">(Opcional)</span>
            </label>
            {imagenPreview ? (
              <div className="mev-imagen-preview-wrap">
                <img src={imagenPreview} alt="Vista previa" className="mev-imagen-preview" />
                <div className="mev-imagen-info">
                  <span className="mev-imagen-nombre">📷 {imagenFile?.name || 'imagen'}</span>
                  <button type="button" className="mev-btn-quitar-imagen" onClick={handleQuitarImagen}>
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <label className="mev-upload-box" htmlFor="mev-imagen">
                <input
                  id="mev-imagen"
                  type="file"
                  accept="image/*"
                  ref={imagenRef}
                  onChange={handleImagenChange}
                  style={{ display: 'none' }}
                />
                <div className="mev-upload-icon">🖼️</div>
                <div className="mev-upload-text">Haz clic para subir una imagen del evento</div>
                <div className="mev-upload-hint">PNG, JPG, WEBP, GIF</div>
              </label>
            )}
          </div>

          {/* Acciones */}
          <div className="mev-acciones">
            <button type="button" className="mev-btn-cancelar" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="mev-btn-guardar" disabled={guardando}>
              <span className="mev-btn-guardar-dot" />
              {guardando ? 'Guardando…' : modoEdicion ? 'Actualizar evento' : 'Guardar evento'}
            </button>
          </div>

        </form>
      </div>
    </div>,
    document.body
  );
}
