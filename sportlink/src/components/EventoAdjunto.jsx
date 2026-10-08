import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { ETIQUETAS_EVENTO, useEventoDetalle } from '../utils/eventosAdjuntos.js'
import './EventoAdjunto.css'

// Eventos adjuntables (prueba, entrenamiento, empleo) en el feed y en los mensajes.
// El backend los devuelve normalizados: { tipo, id, titulo, subtitulo, imagen, fecha, ruta, activo }

const ETIQUETAS_PLURAL = { PRUEBA: 'Pruebas', ENTRENAMIENTO: 'Entrenamientos', EMPLEO: 'Empleos' }

function formatearFecha(fecha) {
  if (!fecha) return null
  // Las columnas date llegan como 'YYYY-MM-DD': se parsean como fecha local para no correr un día
  const d = new Date(fecha.length === 10 ? `${fecha}T00:00:00` : fecha)
  if (isNaN(d)) return null
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ═══════════════════════════════════════════════════════════
// TarjetaEvento — vista del evento adjunto
// ═══════════════════════════════════════════════════════════
export function TarjetaEvento({ evento, onQuitar, sinBoton = false }) {
  const navigate = useNavigate()
  if (!evento) return null
  const fecha = formatearFecha(evento.fecha)

  return (
    <div className="evento-tarjeta" data-no-nav>
      <div className={`evento-tarjeta-imagen ${evento.tipo}`}>
        {evento.imagen
          ? <img src={evento.imagen} alt="" loading="lazy" />
          : <span>{ETIQUETAS_EVENTO[evento.tipo]?.[0]}</span>}
      </div>

      <div className="evento-tarjeta-info">
        <span className={`evento-tarjeta-chip ${evento.tipo}`}>{ETIQUETAS_EVENTO[evento.tipo]}</span>
        <strong className="evento-tarjeta-titulo" title={evento.titulo}>{evento.titulo}</strong>
        {evento.subtitulo && <span className="evento-tarjeta-sub" title={evento.subtitulo}>{evento.subtitulo}</span>}
        {fecha && <span className="evento-tarjeta-sub">{fecha}{evento.activo === false ? ' · Cerrado' : ''}</span>}
      </div>

      {onQuitar ? (
        <button type="button" className="evento-tarjeta-quitar" onClick={(e) => { e.stopPropagation(); onQuitar() }} title="Quitar evento">✕</button>
      ) : !sinBoton && evento.ruta && (
        <button type="button" className="evento-tarjeta-ver" onClick={(e) => { e.stopPropagation(); navigate(evento.ruta) }}>
          Ver
        </button>
      )}
    </div>
  )
}

/** Tarjeta a partir de { tipo, id }: busca el detalle (usado en el chat). */
export function TarjetaEventoPorId({ tipo, id }) {
  const { evento, error, cargando } = useEventoDetalle(tipo, id)
  if (cargando) return <div className="evento-tarjeta evento-tarjeta--cargando">Cargando {ETIQUETAS_EVENTO[tipo]?.toLowerCase()}…</div>
  if (error || !evento) return <div className="evento-tarjeta evento-tarjeta--cargando">Este evento ya no está disponible</div>
  return <TarjetaEvento evento={evento} />
}

// ═══════════════════════════════════════════════════════════
// SelectorEventos — modal para elegir uno de mis eventos
// ═══════════════════════════════════════════════════════════
export function SelectorEventos({ abierto, onCerrar, onElegir }) {
  const [eventos, setEventos] = useState(null)
  const [error, setError] = useState(false)
  const [filtro, setFiltro] = useState(null)

  useEffect(() => {
    if (!abierto) return
    let vivo = true
    api.get('/api/adjuntos/mios')
      .then(r => { if (vivo) { setEventos(Array.isArray(r.data) ? r.data : []); setError(false) } })
      .catch(() => { if (vivo) setError(true) })

    const onKey = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', onKey)
    return () => { vivo = false; document.removeEventListener('keydown', onKey) }
  }, [abierto, onCerrar])

  if (!abierto) return null

  const tipos = [...new Set((eventos || []).map(e => e.tipo))]
  const visibles = (eventos || []).filter(e => !filtro || e.tipo === filtro)

  return createPortal(
    <div className="evento-selector-overlay" onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onCerrar() }}>
      <div className="evento-selector" role="dialog" aria-modal="true" aria-label="Adjuntar evento" onClick={(e) => e.stopPropagation()}>
        <div className="evento-selector-header">
          <h3>Adjuntar evento</h3>
          <button type="button" className="evento-selector-cerrar" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>

        {tipos.length > 1 && (
          <div className="evento-selector-filtros">
            <button type="button" className={!filtro ? 'activo' : ''} onClick={() => setFiltro(null)}>Todos</button>
            {tipos.map(t => (
              <button type="button" key={t} className={filtro === t ? 'activo' : ''} onClick={() => setFiltro(t)}>
                {ETIQUETAS_PLURAL[t]}
              </button>
            ))}
          </div>
        )}

        <div className="evento-selector-lista">
          {error ? (
            <p className="evento-selector-vacio">No se pudieron cargar tus eventos. Intentá de nuevo.</p>
          ) : eventos === null ? (
            <p className="evento-selector-vacio">Cargando…</p>
          ) : visibles.length === 0 ? (
            <p className="evento-selector-vacio">Todavía no tenés eventos activos para compartir.</p>
          ) : visibles.map(ev => (
            <button
              type="button"
              key={`${ev.tipo}-${ev.id}`}
              className="evento-selector-item"
              onClick={() => { onElegir(ev); onCerrar() }}
            >
              <TarjetaEvento evento={ev} sinBoton />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
