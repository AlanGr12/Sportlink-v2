import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../axiosConfig.js';
import './PerfilResenas.css';

/**
 * ModalCalificar:
 * Modal emergente centrado para calificar a un Club o Entrenador.
 * Soporta autoría tanto de Jugadores como de Entrenadores (cuando califican a un Club).
 * 
 * Payload para POST /api/resenias:
 * {
 *   "idjugador": Number || null,
 *   "identrenador_autor": Number || null,
 *   "idusuario": Number,
 *   "idclub": Number || null,
 *   "identrenador": Number || null,
 *   "idprueba": Number || null,
 *   "identrenamiento": Number || null,
 *   "estrellitas": Number, // Entero 1 a 5
 *   "textoopinion": String,
 *   "rolAutor": "JUGADOR" | "ENTRENADOR"
 * }
 */
export default function ModalCalificar({
  abierto,
  onClose,
  nombreEntidad = 'Perfil',
  tipoEntidad = 'entrenador',
  idEntidad,
  idJugadorSesion,
  idEntrenadorSesion,
  usuarioEnSesion,
  eventosPasados = [],
  onExito,
}) {
  const [estrellitas, setEstrellitas] = useState(0);
  const [hoverEstrellas, setHoverEstrellas] = useState(0);
  const [textoopinion, setTextoopinion] = useState('');
  // Valor por defecto para evento: "" (representa "- Sin asociar a evento en particular -")
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorAlerta, setErrorAlerta] = useState('');

  // Bloquear scroll de la página mientras el modal está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
      setEstrellitas(0);
      setHoverEstrellas(0);
      setTextoopinion('');
      setEventoSeleccionado('');
      setErrorAlerta('');
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [abierto]);

  if (!abierto) return null;

  // Leyendas según cantidad de estrellas
  const captionsEstrellas = [
    'Selecciona una calificación',
    '1 estrella - Muy deficiente',
    '2 estrellas - Regular',
    '3 estrellas - Bueno',
    '4 estrellas - Muy bueno',
    '5 estrellas - Excelente',
  ];

  const handleCerrar = () => {
    if (!cargando) {
      setErrorAlerta('');
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones estrictas
    if (estrellitas < 1 || estrellitas > 5) {
      setErrorAlerta('Por favor selecciona una puntuación de 1 a 5 estrellas.');
      return;
    }

    const opinionLimpia = textoopinion.trim();
    if (opinionLimpia.length < 10) {
      setErrorAlerta('La opinión debe contener al menos 10 caracteres.');
      return;
    }

    // Identificar autor (jugador o entrenador)
    const rolSesion = usuarioEnSesion?.tipousuario?.toLowerCase() || '';
    const esEntrenadorSesion = rolSesion === 'entrenador';
    const idSesion =
      usuarioEnSesion?.idusuario ||
      usuarioEnSesion?.idUsuario ||
      usuarioEnSesion?.id;

    const idAutorJugador = !esEntrenadorSesion ? (idJugadorSesion || idSesion) : null;
    const idAutorEntrenador = esEntrenadorSesion ? (idEntrenadorSesion || idSesion) : null;

    if (!idAutorJugador && !idAutorEntrenador && !idSesion) {
      setErrorAlerta('No se pudo identificar tu sesión de usuario.');
      return;
    }

    // Desglose del evento seleccionado: si la opción elegida es "- Sin asociar a evento en particular -" (o vacía),
    // envía explícitamente idprueba: null e identrenamiento: null
    let idprueba = null;
    let identrenamiento = null;

    if (eventoSeleccionado && typeof eventoSeleccionado === 'string' && eventoSeleccionado.trim() !== '') {
      try {
        const parsed = JSON.parse(eventoSeleccionado);
        idprueba = parsed.idprueba ? Number(parsed.idprueba) : null;
        identrenamiento = parsed.identrenamiento ? Number(parsed.identrenamiento) : null;
      } catch {
        idprueba = null;
        identrenamiento = null;
      }
    }

    // Payload con soporte para autor Jugador o Entrenador y campos nulos explícitos
    const payload = {
      idjugador: idAutorJugador ? Number(idAutorJugador) : null,
      identrenador_autor: idAutorEntrenador ? Number(idAutorEntrenador) : null,
      idusuario: idSesion ? Number(idSesion) : null,
      idclub: tipoEntidad === 'club' ? Number(idEntidad) : null,
      identrenador: tipoEntidad === 'entrenador' ? Number(idEntidad) : null,
      idprueba: idprueba,
      identrenamiento: identrenamiento,
      estrellitas: Number(estrellitas),
      textoopinion: opinionLimpia,
      rolAutor: esEntrenadorSesion ? 'ENTRENADOR' : 'JUGADOR',
    };

    console.log('[SportLink] Enviando POST /api/resenias con payload:', payload);

    setCargando(true);
    setErrorAlerta('');

    try {
      const res = await api.post('/api/resenias', payload);

      if (res.status === 200 || res.status === 201) {
        if (typeof onExito === 'function') {
          onExito(res.data);
        }
        handleCerrar();
      }
    } catch (err) {
      console.error('Error al publicar la reseña:', err);
      const status = err.response?.status;
      const data = err.response?.data;
      const backendMsg = data?.mensaje || data?.error || data?.message;

      if (status === 409) {
        setErrorAlerta(backendMsg || 'Ya has registrado una reseña previa para este perfil.');
      } else if (status === 403) {
        setErrorAlerta(backendMsg || 'No tienes permisos para calificar este perfil.');
      } else {
        setErrorAlerta(
          backendMsg || 'Ocurrió un error al enviar tu reseña. Por favor intenta de nuevo en unos momentos.'
        );
      }
    } finally {
      setCargando(false);
    }
  };

  // La única validación bloqueante para habilitar el botón "Publicar Reseña" debe ser:
  // estrellitas >= 1 y textoopinion.trim().length >= 10. El evento es estrictamente opcional.
  const botonDeshabilitado =
    cargando ||
    estrellitas < 1 ||
    textoopinion.trim().length < 10;

  return createPortal(
    <div className="modal-calificar-overlay" onClick={handleCerrar} role="dialog" aria-modal="true">
      <div className="modal-calificar-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-calificar-header">
          <div className="modal-calificar-header-text">
            <span className="modal-calificar-tag">NUEVA EVALUACIÓN</span>
            <h3 className="modal-calificar-titulo">Calificar a {nombreEntidad}</h3>
          </div>
          <button
            type="button"
            className="modal-calificar-btn-close"
            onClick={handleCerrar}
            disabled={cargando}
            aria-label="Cerrar modal"
          >
            ×
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="modal-calificar-form">
          {/* Alerta de error visible sin colapsar la vista */}
          {errorAlerta && (
            <div className="modal-calificar-alerta-error" role="alert">
              <svg className="alerta-error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="alerta-error-texto">{errorAlerta}</div>
            </div>
          )}

          {/* Selector interactivo de 1 a 5 estrellas */}
          <div className="modal-calificar-field field-centrado">
            <label className="modal-calificar-label">
              Calificación general <span className="req">*</span>
            </label>
            <div
              className="star-selector-stars-interactive"
              onMouseLeave={() => setHoverEstrellas(0)}
              role="radiogroup"
              aria-label="Calificación de 1 a 5 estrellas"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const activa = (hoverEstrellas || estrellitas) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn-select ${activa ? 'activa' : 'inactiva'}`}
                    onClick={() => setEstrellitas(star)}
                    onMouseEnter={() => setHoverEstrellas(star)}
                    aria-label={`${star} estrella${star > 1 ? 's' : ''}`}
                    role="radio"
                    aria-checked={estrellitas === star}
                  >
                    <svg viewBox="0 0 24 24">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                );
              })}
            </div>
            <div className="star-feedback-caption">
              {captionsEstrellas[hoverEstrellas || estrellitas]}
            </div>
          </div>

          {/* Asociación de Evento (Dropdown puramente opcional si hay eventosPasados) */}
          {Array.isArray(eventosPasados) && eventosPasados.length > 0 && (
            <div className="modal-calificar-field">
              <label htmlFor="select-evento-asociado" className="modal-calificar-label">
                Evento relacionado <span className="modal-calificar-opcional">(Opcional)</span>
              </label>
              <select
                id="select-evento-asociado"
                className="modal-calificar-select"
                value={eventoSeleccionado || ''}
                onChange={(e) => setEventoSeleccionado(e.target.value)}
              >
                <option value="">- Sin asociar a evento en particular -</option>
                {eventosPasados.map((ev, idx) => {
                  const idprueba = ev.idprueba ?? ev.id_prueba ?? (ev.tipo === 'prueba' ? ev.id : null);
                  const identrenamiento = ev.identrenamiento ?? ev.id_entrenamiento ?? (ev.tipo === 'entrenamiento' ? ev.id : null);
                  const valueObj = JSON.stringify({ idprueba, identrenamiento });
                  const tipoLabel = idprueba ? 'Prueba' : identrenamiento ? 'Entrenamiento' : 'Evento';
                  const nombreEv = ev.titulo || ev.nombre || ev.deporte || `Evento #${idx + 1}`;
                  const fechaStr = ev.fecha ? ` (${new Date(ev.fecha).toLocaleDateString()})` : '';

                  return (
                    <option key={idx} value={valueObj}>
                      {tipoLabel}: {nombreEv}{fechaStr}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Área de Opinión: <textarea> para textoopinion */}
          <div className="modal-calificar-field">
            <div className="modal-calificar-label-row">
              <label htmlFor="textarea-textoopinion" className="modal-calificar-label">
                Tu Opinión <span className="req">*</span>
              </label>
              <span className={`modal-calificar-charcount ${textoopinion.trim().length < 10 ? 'insuficiente' : ''}`}>
                {textoopinion.length} / 500 {textoopinion.trim().length < 10 && '(mínimo 10 caracteres)'}
              </span>
            </div>
            <textarea
              id="textarea-textoopinion"
              className="modal-calificar-textarea"
              value={textoopinion}
              onChange={(e) => setTextoopinion(e.target.value)}
              placeholder="Contá tu experiencia sobre la prueba/entrenamiento, el trato y las instalaciones..."
              maxLength={500}
              rows={4}
              required
            />
          </div>

          {/* Acciones */}
          <div className="modal-calificar-actions">
            <button
              type="button"
              className="btn-modal-calificar-cancelar"
              onClick={handleCerrar}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-modal-calificar-publicar"
              disabled={botonDeshabilitado}
            >
              {cargando ? 'Publicando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
