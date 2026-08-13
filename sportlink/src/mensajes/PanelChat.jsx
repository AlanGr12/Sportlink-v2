import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import ChatInput from './ChatInput.jsx'
import { IconoMensajes } from '../iconos/IconoMensajes.jsx'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Iconos SVG ──────────────────────────────────────────────

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.2H6.6a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.8 9.91a16 16 0 0 0 6.29 6.29l1.06-1.06a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
)

const EmptyMessageIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const ThreeDotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
  </svg>
)

const ProhibitedIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
    <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
)

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}>
    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

// ── Helpers ─────────────────────────────────────────────────

function rolBadgeClass(rol) {
  if (!rol) return 'mensajes-panel-rol-badge'
  const r = rol.toLowerCase()
  if (r === 'entrenador') return 'mensajes-panel-rol-badge entrenador'
  if (r === 'club')       return 'mensajes-panel-rol-badge club'
  if (r === 'jugador')    return 'mensajes-panel-rol-badge jugador'
  return 'mensajes-panel-rol-badge grupo'
}

function formatearHora(fechaString) {
  if (!fechaString) return ''
  return new Date(fechaString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function etiquetaFecha(fechaString) {
  const date = new Date(fechaString)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  const mismaFecha = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()

  if (mismaFecha(date, hoy)) return 'HOY'
  if (mismaFecha(date, ayer)) return 'AYER'
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== hoy.getFullYear() ? 'numeric' : undefined,
  }).toUpperCase()
}

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

// Doble check de lectura
const DoubleCheck = ({ leido }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24"
    fill="none"
    stroke={leido ? '#2DEFF2' : '#ffffff'}
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="7 12 11 16 19 8" />
    <polyline points="2 12 6 16 14 8" />
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
)

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

// Skeleton del historial
function HistorialSkeleton() {
  return (
    <div className="mensajes-historial-loading">
      <div className="mensajes-historial-loading-ajeno" style={{ width: '45%', height: 44 }} />
      <div className="mensajes-historial-loading-propio" style={{ width: '52%', height: 36 }} />
      <div className="mensajes-historial-loading-ajeno" style={{ width: '38%', height: 52 }} />
      <div className="mensajes-historial-loading-propio" style={{ width: '60%', height: 36 }} />
      <div className="mensajes-historial-loading-ajeno" style={{ width: '48%', height: 44 }} />
    </div>
  )
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
        className={`mensaje-search-highlight ${esActivo ? 'activo' : ''}`}
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

export default function PanelChat({ usuario, onlineUsers, conversacionActiva, actualizarUltimoMensaje, marcarComoLeida }) {
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
  const handleEnviarMensaje = async (contenido) => {
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
      tipomensaje: 'TEXTO',
      createdat: new Date().toISOString(),
    }
    setMensajes((prev) => [...prev, mensajeOptimista])
    actualizarUltimoMensaje(id, mensajeOptimista)

    try {
      const { data: mensajeReal } = await api.post(`/api/conversaciones/${id}/mensajes`, { contenido })
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

  const getDetallesContacto = (c) => {
    if (c.tipo === 'PRIVADA') {
      return {
        nombre: c.otroParticipante?.nombre || 'Usuario Desconocido',
        foto: c.otroParticipante?.fotoperfil || null,
        rol: c.otroParticipante?.tipousuario || '',
      }
    }
    return { nombre: c.nombre || 'Grupo', foto: c.foto || null, rol: 'grupo' }
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

  /* ── Panel vacío ── */
  if (!conversacionActiva) {
    return (
      <main className="mensajes-panel">
        <div className="mensajes-panel-empty">
          <div className="mensajes-panel-empty-icon">
            <EmptyMessageIcon />
          </div>
          <h3>Tus mensajes</h3>
          <p>Seleccioná una conversación de la lista para comenzar a chatear</p>
        </div>
      </main>
    )
  }

  const { nombre, foto, rol } = getDetallesContacto(conversacionActiva)
  const miIdUsuario = usuario?.idusuario || usuario?.id

  const items = buildMensajesConSeparadores(mensajes)
  const isOnline = conversacionActiva.tipo === 'PRIVADA' &&
    onlineUsers && onlineUsers.has(String(conversacionActiva.otroParticipante?.idusuario))

  /* ── Chat activo ── */
  return (
    <main className="mensajes-panel">
      {/* Header */}
      <div className="mensajes-panel-header">
        <div className="mensajes-panel-header-avatar">
          <Avatar src={foto} nombre={nombre} size={44} />
          {isOnline && <div className="mensajes-panel-header-online" />}
        </div>

        <div className="mensajes-panel-header-info">
          <div className="mensajes-panel-name">{nombre}</div>
          <div className="mensajes-panel-status">
            {rol && (
              <span className={rolBadgeClass(rol)}>{rol.toUpperCase()}</span>
            )}
            {isOnline
              ? <span className="mensajes-panel-online-text">● En línea</span>
              : <span className="mensajes-panel-offline-text">Desconectado</span>
            }
          </div>
        </div>

        <div className="mensajes-panel-acciones">
          <button className="mensajes-panel-accion-btn" title="Llamada">
            <PhoneIcon />
          </button>
          <button
            className={`mensajes-panel-accion-btn ${mostrarBusqueda ? 'activo' : ''}`}
            title="Buscar en conversación"
            onClick={() => {
              setMostrarBusqueda((prev) => !prev)
              if (mostrarBusqueda) setBusquedaTexto('')
            }}
          >
            <SearchIcon />
          </button>
          <button className="mensajes-panel-accion-btn" title="Más opciones">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* Barra de búsqueda estilo VS Code */}
      {mostrarBusqueda && (
        <div className="mensajes-chat-search-bar">
          <div className="mensajes-chat-search-input-wrapper">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar en el chat (Enter siguiente, Shift+Enter anterior)..."
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />

            {busquedaTexto.trim() && (
              <div className="mensajes-search-nav-btns">
                <span className="mensajes-search-count">
                  {coincidencias.length > 0
                    ? `${coincidenciaIndex + 1} de ${coincidencias.length}`
                    : 'Sin resultados'}
                </span>
                <button
                  type="button"
                  className="mensajes-search-nav-btn"
                  title="Anterior coincidencia (Shift+Enter)"
                  disabled={coincidencias.length === 0}
                  onClick={anteriorCoincidencia}
                >
                  <ChevronUpIcon />
                </button>
                <button
                  type="button"
                  className="mensajes-search-nav-btn"
                  title="Siguiente coincidencia (Enter)"
                  disabled={coincidencias.length === 0}
                  onClick={siguienteCoincidencia}
                >
                  <ChevronDownIcon />
                </button>
              </div>
            )}
          </div>
          <button
            className="mensajes-chat-search-close"
            onClick={() => {
              setMostrarBusqueda(false)
              setBusquedaTexto('')
            }}
            title="Cerrar búsqueda (Esc)"
          >
            ✕
          </button>
        </div>
      )}

      {/* Historial */}
      <div className="mensajes-historial" ref={historialRef}>
        {loading && <HistorialSkeleton />}

        {!loading && items.map((item) => {
          if (item.type === 'separator') {
            return (
              <div key={item.key} className="mensaje-fecha-sep">
                {item.label}
              </div>
            )
          }

          const msg = item.data
          const esPropio = Number(msg.idusuarioemisor) === Number(miIdUsuario)
          const isEliminado = msg.tipomensaje === 'ELIMINADO' || msg.eliminado
          const isEditado = msg.tipomensaje === 'EDITADO' || msg.editado

          return (
            <div 
              key={item.key} 
              className={`mensaje-burbuja-container ${esPropio ? 'propio' : 'ajeno'}`}
            >
              <div className="mensaje-burbuja-row">
                <div className={`mensaje-burbuja ${isEliminado ? 'eliminado' : ''}`}>
                  {isEliminado ? (
                    <div className="mensaje-eliminado-content">
                      <ProhibitedIcon /> <i>Mensaje eliminado</i>
                    </div>
                  ) : editandoMsgId === msg.idmensaje ? (
                    <div className="mensaje-editar-wrapper">
                      <input 
                        type="text" 
                        value={editTexto} 
                        onChange={(e) => setEditTexto(e.target.value)} 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') guardarEdicion(msg)
                          else if (e.key === 'Escape') setEditandoMsgId(null)
                        }}
                        autoFocus
                      />
                      <button className="btn-guardar-edicion" title="Guardar cambios" onClick={() => guardarEdicion(msg)}><CheckIcon /></button>
                      <button className="btn-cancelar-edicion" title="Cancelar edición" onClick={() => setEditandoMsgId(null)}>✕</button>
                    </div>
                  ) : (
                    <div className="mensaje-contenido-wrapper">
                      <span className="mensaje-texto">
                        {destacarTexto(msg.contenido, mostrarBusqueda ? busquedaTexto : '', msg.idmensaje, matchActivoId)}
                      </span>
                      {isEditado && <span className="mensaje-editado-tag"> (editado)</span>}
                    </div>
                  )}
                </div>

                {/* Opciones fuera de la burbuja a la derecha */}
                {esPropio && !isEliminado && editandoMsgId !== msg.idmensaje && (
                  <div className="mensaje-opciones-externas">
                    <button className="mensaje-trigger-btn white" title="Opciones" onClick={(e) => { e.stopPropagation(); setDropdownMsgId(dropdownMsgId === msg.idmensaje ? null : msg.idmensaje); }}>
                       <ThreeDotsIcon />
                    </button>
                    {dropdownMsgId === msg.idmensaje && (
                      <div className="mensaje-dropdown outside">
                        <button onClick={(e) => { e.stopPropagation(); setEditandoMsgId(msg.idmensaje); setEditTexto(msg.contenido); setDropdownMsgId(null); }}>
                          <PencilIcon /> Editar
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setMsgAEliminar(msg); setDropdownMsgId(null); }} className="danger">
                          <TrashIcon /> Borrar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mensaje-hora">
                {formatearHora(msg.createdat)}
                {esPropio && <DoubleCheck leido={msg.leido} />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Indicador de typing con animación de puntos */}
      {typingUser && (
        <div className="typing-indicator">
          <div className="typing-bubbles">
            <span /><span /><span />
          </div>
          <span>{typingUser} está escribiendo</span>
        </div>
      )}

      {/* Input */}
      <ChatInput onSend={handleEnviarMensaje} onTyping={handleTyping} />

      {/* Modal Confirmar Eliminar */}
      {msgAEliminar && (
        <div className="mensaje-modal-overlay" onClick={() => setMsgAEliminar(null)}>
          <div className="mensaje-modal-card" onClick={e => e.stopPropagation()}>
            <h4>¿Eliminar mensaje?</h4>
            <p>¿Estás seguro que querés eliminar este mensaje?</p>
            <div className="mensaje-modal-actions">
              <button onClick={() => setMsgAEliminar(null)}>Cancelar</button>
              <button className="danger" onClick={handleConfirmarEliminar}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
