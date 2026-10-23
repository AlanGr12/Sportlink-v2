import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ModalEvento.css';

const COLORES_DISPONIBLES = [
  { hex: '#ffffff', nombre: 'Blanco' },
  { hex: '#ef4444', nombre: 'Rojo' },
  { hex: '#ec4899', nombre: 'Rosa' },
  { hex: '#a855f7', nombre: 'Violeta' },
  { hex: '#10b981', nombre: 'Verde' },
  { hex: '#f97316', nombre: 'Naranja' },
  { hex: '#d946ef', nombre: 'Magenta' },
];

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

  const [nombre,            setNombre]            = useState('');
  const [fecha,             setFecha]             = useState('');
  const [hora,              setHora]              = useState('');
  const [descripcion,       setDescripcion]       = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('#ffffff');
  const [imagenFile,        setImagenFile]        = useState(null);
  const [imagenPreview,     setImagenPreview]     = useState(null);
  const [errores,           setErrores]           = useState({});
  const [guardando,         setGuardando]         = useState(false);
  const imagenRef = useRef(null);

  // ── Inicialización ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (modoEdicion && eventoEditar) {
      // Modo edición: pre-poblar campos
      setNombre(eventoEditar.nombre || '');
      setFecha(eventoEditar.fecha   || '');
      setHora(eventoEditar.hora     || '');
      setDescripcion(eventoEditar.descripcion || '');
      if (eventoEditar.color) {
        setColorSeleccionado(eventoEditar.color);
      }
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
        color:        colorSeleccionado,
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
    <div className="pr-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCerrar(); }}>
      <div className="pr-modal pr-modal--form mev" role="dialog" aria-modal="true" aria-labelledby="mev-titulo">
        <div className="pr-modal-head">
          <h2 className="pr-modal-title" id="mev-titulo">{modoEdicion ? 'Editar evento' : 'Nuevo evento'}</h2>
          <button type="button" className="pr-close" onClick={onCerrar} aria-label="Cerrar">×</button>
        </div>

        <form className="mev-form" onSubmit={handleSubmit} noValidate>
          <div className="pr-modal-body">
            <label className="mev-campo">
              <span>Nombre del evento</span>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej.: Entrenamiento con el equipo"
                autoFocus
                autoComplete="off"
                aria-invalid={!!errores.nombre}
              />
              {errores.nombre && <small className="mev-error">{errores.nombre}</small>}
            </label>

            <div className="mev-doble">
              <label className="mev-campo">
                <span>Fecha{fechaBloqueada && ' · fijada por el día elegido'}</span>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => { if (!fechaBloqueada) setFecha(e.target.value); }}
                  readOnly={fechaBloqueada}
                  disabled={fechaBloqueada}
                  aria-invalid={!!errores.fecha}
                />
                {errores.fecha && <small className="mev-error">{errores.fecha}</small>}
              </label>
              <label className="mev-campo">
                <span>Hora</span>
                <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} aria-invalid={!!errores.hora} />
                {errores.hora && <small className="mev-error">{errores.hora}</small>}
              </label>
            </div>

            <fieldset className="mev-colores">
              <legend>Color en el calendario</legend>
              <div>
                {COLORES_DISPONIBLES.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    className={`mev-color${colorSeleccionado === c.hex ? ' is-on' : ''}`}
                    style={{ '--mev-color': c.hex === '#ffffff' ? 'var(--slk-text)' : c.hex }}
                    onClick={() => setColorSeleccionado(c.hex)}
                    aria-pressed={colorSeleccionado === c.hex}
                    title={c.nombre}
                  >
                    <span className="pr-sr">{c.nombre}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mev-campo">
              <span>Descripción (opcional)</span>
              <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Notas, lugar, qué llevar…" rows={3} />
            </label>

            <div className="mev-campo">
              <span>Imagen (opcional)</span>
              {imagenPreview ? (
                <div className="mev-imagen">
                  <img src={imagenPreview} alt="Vista previa" />
                  <button type="button" className="pr-link pr-link--danger" onClick={handleQuitarImagen}>Quitar imagen</button>
                </div>
              ) : (
                <label className="mev-subir">
                  <input type="file" accept="image/*" ref={imagenRef} onChange={handleImagenChange} hidden />
                  <strong>Elegí una imagen</strong>
                  <span>PNG, JPG, WEBP o GIF</span>
                </label>
              )}
            </div>
          </div>

          <div className="pr-modal-foot">
            <button type="button" className="pr-btn pr-btn--ghost" onClick={onCerrar} disabled={guardando}>Cancelar</button>
            <button type="submit" className="pr-btn" disabled={guardando}>
              {guardando ? 'Guardando…' : modoEdicion ? 'Guardar cambios' : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
