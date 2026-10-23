import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@supabase/supabase-js'
import api from '../axiosConfig.js'
import AvatarCuadrado from '../components/AvatarCuadrado.jsx'
import ChatInput from './ChatInput.jsx'
import { TarjetaEventoPorId } from '../components/EventoAdjunto.jsx'
import { eventoDeMensaje, puedeAdjuntarEventos } from '../utils/eventosAdjuntos.js'
import { formatearHoraMensaje, etiquetaFecha } from './utilsFecha.js'
import { ROLES, detallesContacto } from './utilsMensajes.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Columna del mensaje que referencia a cada tipo de evento adjunto
const CAMPO_EVENTO = { PRUEBA: 'idprueba', ENTRENAMIENTO: 'identrenamiento', EMPLEO: 'idempleo' }

// ── Íconos (trazo 2px, heredan color) ───────────────────────
const Ico = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
const SearchIcon = () => <Ico><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Ico>
const BackIcon = () => <Ico><path d="M19 12H5M12 5l-7 7 7 7" /></Ico>
const DotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
)
const UpIcon = () => <Ico size={18}><polyline points="18 15 12 9 6 15" /></Ico>
const DownIcon = () => <Ico size={18}><polyline points="6 9 12 15 18 9" /></Ico>

// Doble check de lectura: gris enviado, cian leído
const DoubleCheck = ({ leido }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`ms-check${leido ? ' is-leido' : ''}`} aria-label={leido ? 'Leído' : 'Enviado'}>
    <polyline points="7 12 11 16 19 8" /><polyline points="2 12 6 16 14 8" />
  </svg>
)

function buildMensajesConSeparadores(mensajes) {
  const items = []
  let ultimaFecha = null
  for (const msg of mensajes) {
    const fechaStr = etiquetaFecha(msg.createdat)
    if (fechaStr !== ultimaFecha) {
      items.push({ type: 'separator', label: fechaStr, key: `sep-${msg.createdat}` })
      ultimaFecha = fechaStr
    }
    items.push({ type: 'message', data: msg, key: msg.idmensaje })
  }
  return items
}

function destacarTexto(texto, query, idmensaje, matchActivoId) {
  if (!query || !query.trim() || typeof texto !== 'string') return texto
  const qLower = query.toLowerCase()
  const textLower = texto.toLowerCase()
  if (!textLower.includes(qLower)) return texto

  const partes = []
  let lastIndex = 0
  let pos = 0

  while ((pos = textLower.indexOf(qLower, lastIndex)) !== -1) {
    if (pos > lastIndex) {
      partes.push(texto.slice(lastIndex, pos))
    }
    const matchId = `match-${idmensaje}-${pos}`
    const esActivo = matchId === matchActivoId
    const subStr = texto.slice(pos, pos + query.length)

    partes.push(
      <mark
        key={`${idmensaje}-${pos}`}
        id={matchId}
        className={`ms-resaltado ${esActivo ? 'activo' : ''}`}
      >
        {subStr}
      </mark>
    )
    lastIndex = pos + query.length
  }

  if (lastIndex < texto.length) {
    partes.push(texto.slice(lastIndex))
  }

  return partes
}

// ── Componente principal ─────────────────────────────────────

export default function PanelChat({ usuario, onlineUsers, conversacionActiva, actualizarUltimoMensaje, marcarComoLeida, onVolver }) {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(false)
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false)
  const [busquedaTexto, setBusquedaTexto] = useState('')
  const [coincidenciaIndex, setCoincidenciaIndex] = useState(0)

  const [dropdownMsgId, setDropdownMsgId] = useState(null)
  const [editandoMsgId, setEditandoMsgId] = useState(null)
  const [editTexto, setEditTexto] = useState('')
  const [msgAEliminar, setMsgAEliminar] = useState(null)

  const historialRef = useRef(null)
  const [typingUser, setTypingUser] = useState(null)
  const typingTimeoutRef = useRef(null)
  const canalRealtimeRef = useRef(null)
  const lastTypingSent = useRef(0)

  // Refs estables para las callbacks del padre
  const actualizarUltimoMensajeRef = useRef(actualizarUltimoMensaje)
  const marcarComoLeidaRef = useRef(marcarComoLeida)
  useEffect(() => { actualizarUltimoMensajeRef.current = actualizarUltimoMensaje }, [actualizarUltimoMensaje])
  useEffect(() => { marcarComoLeidaRef.current = marcarComoLeida }, [marcarComoLeida])

  const scrollToBottom = () => {
    if (historialRef.current) {
      historialRef.current.scrollTop = historialRef.current.scrollHeight
    }
  }

  useEffect(() => { scrollToBottom() }, [mensajes])

  // Las tarjetas de evento cargan después y agrandan el historial:
  // si estabas abajo de todo, se sigue mostrando el último mensaje
  const pegadoAbajo = useRef(true)
  useEffect(() => {
    const el = historialRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const alScroll = () => { pegadoAbajo.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }
    const obs = new ResizeObserver(() => { if (pegadoAbajo.current) el.scrollTop = el.scrollHeight })
    Array.from(el.children).forEach((c) => obs.observe(c))
    el.addEventListener('scroll', alScroll)
    return () => { obs.disconnect(); el.removeEventListener('scroll', alScroll) }
  }, [mensajes, loading])

  const idActivo = conversacionActiva?.idconversacion ?? null

  // ── Efecto 1: Carga HTTP del historial ──
  useEffect(() => {
    setMensajes([])
    setTypingUser(null)
    setMostrarBusqueda(false)
    setBusquedaTexto('')
    setCoincidenciaIndex(0)
    setDropdownMsgId(null)
    setEditandoMsgId(null)
    setMsgAEliminar(null)
    clearTimeout(typingTimeoutRef.current)

    if (!idActivo) {
      setLoading(false)
      return
    }

    let activo = true
    setLoading(true)

    api.get(`/api/conversaciones/${idActivo}/mensajes?limite=100`)
      .then(({ data }) => { if (activo) setMensajes(data || []) })
      .catch((err) => {
        console.error('Error cargando mensajes:', err)
        if (activo) setMensajes([])
      })
      .finally(() => { if (activo) setLoading(false) })

    api.post(`/api/conversaciones/${idActivo}/leer`)
      .then(() => { if (activo) marcarComoLeidaRef.current?.(idActivo) })
      .catch((err) => console.error('Error marcando como leído:', err))

    return () => { activo = false }
  }, [idActivo])

  // ── Listener para cerrar el dropdown al hacer click fuera ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.mensaje-opciones-externas')) {
        setDropdownMsgId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // ── Efecto 2: Suscripción Realtime ──
  useEffect(() => {
    if (!idActivo) {
      if (canalRealtimeRef.current) {
        supabase.removeChannel(canalRealtimeRef.current)
        canalRealtimeRef.current = null
      }
      return
    }

    const miId = String(usuario?.idusuario || usuario?.id)

    const canal = supabase
      .channel(`chat-${idActivo}`, { config: { broadcast: { self: false } } })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `idconversacion=eq.${idActivo}` },
        (payload) => {
          const nuevoMensaje = payload.new
          setMensajes((prev) => {
            if (prev.some((m) => m.idmensaje === nuevoMensaje.idmensaje)) return prev
            return [...prev, nuevoMensaje]
          })
          actualizarUltimoMensajeRef.current?.(idActivo, nuevoMensaje)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mensajes', filter: `idconversacion=eq.${idActivo}` },
        (payload) => {
          const msgActualizado = payload.new
          setMensajes((prev) =>
            prev.map((m) => (m.idmensaje === msgActualizado.idmensaje ? { ...m, ...msgActualizado } : m))
          )
          actualizarUltimoMensajeRef.current?.(idActivo, msgActualizado)
        }
      )
      .on('broadcast', { event: 'mensaje_update' }, (payload) => {
        const msgActualizado = payload.payload
        if (msgActualizado && Number(msgActualizado.idconversacion) === Number(idActivo)) {
          setMensajes((prev) =>
            prev.map((m) => (m.idmensaje === msgActualizado.idmensaje ? { ...m, ...msgActualizado } : m))
          )
          actualizarUltimoMensajeRef.current?.(idActivo, msgActualizado)
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (String(payload.payload.idusuario) !== miId) {
          setTypingUser(payload.payload.nombre)
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2500)
        }
      })
      .subscribe()

    canalRealtimeRef.current = canal

    return () => {
      clearTimeout(typingTimeoutRef.current)
      supabase.removeChannel(canal)
      canalRealtimeRef.current = null
    }
  }, [idActivo])

  // ── Envío optimista ──
  // evento (opcional): { tipo, id } de una prueba, entrenamiento o empleo propio
  const handleEnviarMensaje = async (contenido, evento = null) => {
    if (!conversacionActiva) return
    setTypingUser(null)
    clearTimeout(typingTimeoutRef.current)
    const id = conversacionActiva.idconversacion
    const tempId = -Date.now()
    const mensajeOptimista = {
      idmensaje: tempId,
      idconversacion: id,
      idusuarioemisor: usuario.idusuario || usuario.id,
      contenido,
      tipomensaje: evento ? 'EVENTO' : 'TEXTO',
      ...(evento && { [CAMPO_EVENTO[evento.tipo]]: evento.id }),
      createdat: new Date().toISOString(),
    }
    setMensajes((prev) => [...prev, mensajeOptimista])
    actualizarUltimoMensaje(id, mensajeOptimista)

    try {
      const { data: mensajeReal } = await api.post(`/api/conversaciones/${id}/mensajes`, evento
        ? { contenido, tipomensaje: 'EVENTO', evento: { tipo: evento.tipo, id: evento.id } }
        : { contenido })
      setMensajes((prev) => prev.map((m) => (m.idmensaje === tempId ? mensajeReal : m)))
      actualizarUltimoMensaje(id, mensajeReal)
    } catch (err) {
      console.error('Error enviando mensaje:', err)
      setMensajes((prev) => prev.filter((m) => m.idmensaje !== tempId))
    }
  }

  const handleTyping = () => {
    if (!canalRealtimeRef.current || !conversacionActiva) return
    const now = Date.now()
    if (now - lastTypingSent.current > 1500) {
      canalRealtimeRef.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { idusuario: usuario.idusuario || usuario.id, nombre: usuario.nombre || 'Usuario' }
      })
      lastTypingSent.current = now
    }
  }


  // Obtener todas las coincidencias de búsqueda en la lista de mensajes
  const coincidencias = React.useMemo(() => {
    if (!mostrarBusqueda || !busquedaTexto.trim()) return []
    const matches = []
    const query = busquedaTexto.toLowerCase()

    mensajes.forEach((msg) => {
      const text = (msg.contenido || '').toLowerCase()
      if (!text) return
      let pos = 0
      while ((pos = text.indexOf(query, pos)) !== -1) {
        matches.push({
          idmensaje: msg.idmensaje,
          posicion: pos,
          matchId: `match-${msg.idmensaje}-${pos}`
        })
        pos += query.length
      }
    })
    return matches
  }, [mensajes, mostrarBusqueda, busquedaTexto])

  // Al cambiar la búsqueda, volvemos a la primera coincidencia
  useEffect(() => {
    setCoincidenciaIndex(0)
  }, [busquedaTexto])

  const matchActivo = coincidencias[coincidenciaIndex] || null
  const matchActivoId = matchActivo?.matchId || null

  // Hacer scroll automático hasta la coincidencia enfocada
  useEffect(() => {
    if (!mostrarBusqueda || !matchActivoId) return
    const el = document.getElementById(matchActivoId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [coincidenciaIndex, matchActivoId, mostrarBusqueda])

  const siguienteCoincidencia = () => {
    if (coincidencias.length === 0) return
    setCoincidenciaIndex((prev) => (prev < coincidencias.length - 1 ? prev + 1 : 0))
  }

  const anteriorCoincidencia = () => {
    if (coincidencias.length === 0) return
    setCoincidenciaIndex((prev) => (prev > 0 ? prev - 1 : coincidencias.length - 1))
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        anteriorCoincidencia()
      } else {
        siguienteCoincidencia()
      }
    } else if (e.key === 'Escape') {
      setMostrarBusqueda(false)
      setBusquedaTexto('')
    }
  }

  const guardarEdicion = async (msg) => {
    if (editTexto !== msg.contenido && editTexto.trim() !== '') {
      const nuevoTexto = editTexto.trim()
      try {
        const { data: msgEditado } = await api.put(
          `/api/conversaciones/${idActivo}/mensajes/${msg.idmensaje}`,
          { contenido: nuevoTexto }
        )
        const itemActualizado = msgEditado || { ...msg, contenido: nuevoTexto, tipomensaje: 'EDITADO' }
        setMensajes((prev) =>
          prev.map((m) => (m.idmensaje === msg.idmensaje ? itemActualizado : m))
        )
        actualizarUltimoMensajeRef.current?.(idActivo, itemActualizado)

        canalRealtimeRef.current?.send({
          type: 'broadcast',
          event: 'mensaje_update',
          payload: itemActualizado
        })
      } catch (err) {
        console.error('Error editando mensaje:', err)
      }
    }
    setEditandoMsgId(null)
  }

  const handleConfirmarEliminar = async () => {
    if (!msgAEliminar) return
    const msg = msgAEliminar
    setMsgAEliminar(null)
    try {
      const { data } = await api.delete(`/api/conversaciones/${idActivo}/mensajes/${msg.idmensaje}`)
      const itemEliminado = data?.mensaje || { ...msg, tipomensaje: 'ELIMINADO', contenido: '' }
      setMensajes((prev) =>
        prev.map((m) => (m.idmensaje === msg.idmensaje ? itemEliminado : m))
      )
      actualizarUltimoMensajeRef.current?.(idActivo, {
        ...itemEliminado,
        contenido: 'Mensaje eliminado'
      })

      canalRealtimeRef.current?.send({
        type: 'broadcast',
        event: 'mensaje_update',
        payload: itemEliminado
      })
    } catch (e) {
      console.error('Error eliminando mensaje:', e)
    }
  }

  /* ── Sin conversación elegida ── */
  if (!conversacionActiva) {
    return (
      <main className="ms-panel ms-panel--vacio">
        <div className="ms-vacio">
          <h2 className="pr-display ms-vacio-titulo">Elegí una charla</h2>
          <p>Abrí una conversación de la lista para leerla y responder.</p>
        </div>
      </main>
    )
  }

  const { nombre, foto, rol } = detallesContacto(conversacionActiva)
  const rolTexto = ROLES[rol?.toLowerCase()]
  const esPrivada = conversacionActiva.tipo === 'PRIVADA'
  const miIdUsuario = usuario?.idusuario || usuario?.id
  const items = buildMensajesConSeparadores(mensajes)
  const isOnline = esPrivada && onlineUsers && onlineUsers.has(String(conversacionActiva.otroParticipante?.idusuario))
  const cerrarBusqueda = () => { setMostrarBusqueda(false); setBusquedaTexto('') }

  return (
    <main className="ms-panel">
      <header className="ms-panel-head">
        <button type="button" className="ms-icono ms-volver" onClick={onVolver} aria-label="Volver a la lista">
          <BackIcon />
        </button>
        <span className="ms-avatar">
          <AvatarCuadrado src={foto} nombre={nombre} size={44} />
          {isOnline && <i className="ms-online" />}
        </span>
        <div className="ms-panel-id">
          <h2>{nombre}</h2>
          <p>
            {rolTexto}
            {rolTexto && esPrivada && ' · '}
            {esPrivada && (isOnline ? <span className="ms-en-linea">En línea</span> : 'Desconectado')}
          </p>
        </div>
        <button
          type="button"
          className={`ms-icono${mostrarBusqueda ? ' is-on' : ''}`}
          aria-label="Buscar en la conversación"
          aria-pressed={mostrarBusqueda}
          onClick={() => (mostrarBusqueda ? cerrarBusqueda() : setMostrarBusqueda(true))}
        >
          <SearchIcon />
        </button>
      </header>

      {mostrarBusqueda && (
        <div className="ms-buscar">
          <label className="pr-search ms-buscar-campo">
            <span className="pr-sr">Buscar en el chat</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              type="text"
              placeholder="Buscar en el chat"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
          </label>
          {busquedaTexto.trim() && (
            <span className="ms-buscar-cuenta" aria-live="polite">
              {coincidencias.length > 0 ? `${coincidenciaIndex + 1} de ${coincidencias.length}` : 'Sin resultados'}
            </span>
          )}
          <button type="button" className="ms-icono" aria-label="Anterior (Shift+Enter)" disabled={coincidencias.length === 0} onClick={anteriorCoincidencia}><UpIcon /></button>
          <button type="button" className="ms-icono" aria-label="Siguiente (Enter)" disabled={coincidencias.length === 0} onClick={siguienteCoincidencia}><DownIcon /></button>
          <button type="button" className="pr-close" aria-label="Cerrar búsqueda (Esc)" onClick={cerrarBusqueda}>×</button>
        </div>
      )}

      <div className="ms-historial" ref={historialRef}>
        {loading && (
          <div className="ms-historial-carga" aria-label="Cargando mensajes">
            {[45, 52, 38, 60, 48].map((w, i) => <i key={i} className={i % 2 ? 'is-propio' : ''} style={{ width: `${w}%` }} />)}
          </div>
        )}

        {!loading && items.length === 0 && (
          <p className="ms-historial-vacio">Todavía no hay mensajes. Escribí el primero.</p>
        )}

        {!loading && items.map((item) => {
          if (item.type === 'separator') {
            return <div key={item.key} className="ms-fecha"><span>{item.label}</span></div>
          }

          const msg = item.data
          const esPropio = Number(msg.idusuarioemisor) === Number(miIdUsuario)
          const isEliminado = msg.tipomensaje === 'ELIMINADO' || msg.eliminado
          const isEditado = msg.tipomensaje === 'EDITADO' || msg.editado
          const eventoAdjunto = eventoDeMensaje(msg)
          const editando = editandoMsgId === msg.idmensaje

          return (
            <div key={item.key} className={`ms-msg ${esPropio ? 'is-propio' : 'is-ajeno'}`}>
              <div className="ms-msg-fila">
                {esPropio && !isEliminado && !editando && (
                  <div className="ms-msg-opciones mensaje-opciones-externas">
                    <button
                      type="button"
                      className="ms-icono ms-icono--sm"
                      aria-label="Opciones del mensaje"
                      aria-expanded={dropdownMsgId === msg.idmensaje}
                      onClick={(e) => { e.stopPropagation(); setDropdownMsgId(dropdownMsgId === msg.idmensaje ? null : msg.idmensaje) }}
                    >
                      <DotsIcon />
                    </button>
                    {dropdownMsgId === msg.idmensaje && (
                      <div className="ms-menu" role="menu">
                        <button type="button" role="menuitem" onClick={(e) => { e.stopPropagation(); setEditandoMsgId(msg.idmensaje); setEditTexto(msg.contenido); setDropdownMsgId(null) }}>
                          Editar
                        </button>
                        <button type="button" role="menuitem" className="is-peligro" onClick={(e) => { e.stopPropagation(); setMsgAEliminar(msg); setDropdownMsgId(null) }}>
                          Borrar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className={`ms-burbuja${isEliminado ? ' is-eliminado' : ''}${editando ? ' is-editando' : ''}`}>
                  {isEliminado ? (
                    <span>Mensaje eliminado</span>
                  ) : editando ? (
                    <div className="ms-editar">
                      <label className="pr-sr" htmlFor={`editar-${msg.idmensaje}`}>Editar mensaje</label>
                      <input
                        id={`editar-${msg.idmensaje}`}
                        type="text"
                        value={editTexto}
                        onChange={(e) => setEditTexto(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarEdicion(msg)
                          else if (e.key === 'Escape') setEditandoMsgId(null)
                        }}
                        autoFocus
                      />
                      <div className="ms-editar-acciones">
                        <button type="button" className="pr-link" onClick={() => setEditandoMsgId(null)}>Cancelar</button>
                        <button type="button" className="pr-btn pr-btn--sm" onClick={() => guardarEdicion(msg)}>Guardar</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {eventoAdjunto && <TarjetaEventoPorId tipo={eventoAdjunto.tipo} id={eventoAdjunto.id} />}
                      {(msg.contenido || !eventoAdjunto) && (
                        <p className="ms-texto">
                          {destacarTexto(msg.contenido, mostrarBusqueda ? busquedaTexto : '', msg.idmensaje, matchActivoId)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div className="ms-hora">
                {isEditado && !isEliminado && <span>Editado ·</span>}
                <time>{formatearHoraMensaje(msg.createdat)}</time>
                {esPropio && <DoubleCheck leido={msg.leido} />}
              </div>
            </div>
          )
        })}
      </div>

      {typingUser && (
        <div className="ms-escribiendo" aria-live="polite">
          <span className="ms-puntos" aria-hidden="true"><i /><i /><i /></span>
          {typingUser} está escribiendo
        </div>
      )}

      <ChatInput onSend={handleEnviarMensaje} onTyping={handleTyping} puedeAdjuntarEvento={puedeAdjuntarEventos(usuario)} />

      {msgAEliminar && createPortal(
        <div className="pr-overlay" onClick={() => setMsgAEliminar(null)}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="ms-borrar-titulo" onClick={(e) => e.stopPropagation()}>
            <div className="pr-modal-head ms-modal-head">
              <h2 id="ms-borrar-titulo" className="pr-modal-title">¿Borrar el mensaje?</h2>
              <button type="button" className="pr-close" onClick={() => setMsgAEliminar(null)} aria-label="Cerrar">×</button>
            </div>
            <div className="pr-modal-body"><p className="pr-muted">Va a quedar como “Mensaje eliminado” en la conversación.</p></div>
            <div className="pr-modal-foot">
              <button type="button" className="pr-btn pr-btn--ghost" onClick={() => setMsgAEliminar(null)}>Cancelar</button>
              <button type="button" className="pr-btn pr-btn--danger" onClick={handleConfirmarEliminar}>Borrar</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </main>
  )
}
