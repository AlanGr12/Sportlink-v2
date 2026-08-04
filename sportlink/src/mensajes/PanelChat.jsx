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
    stroke={leido ? '#2DEFF2' : 'rgba(0,0,0,0.35)'}
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="7 12 11 16 19 8" />
    <polyline points="2 12 6 16 14 8" />
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

// ── Componente principal ─────────────────────────────────────

export default function PanelChat({ usuario, onlineUsers, conversacionActiva, actualizarUltimoMensaje, marcarComoLeida }) {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(false)
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
          <button className="mensajes-panel-accion-btn" title="Buscar en conversación">
            <SearchIcon />
          </button>
          <button className="mensajes-panel-accion-btn" title="Más opciones">
            <MoreIcon />
          </button>
        </div>
      </div>

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

          return (
            <div key={item.key} className={`mensaje-burbuja-container ${esPropio ? 'propio' : 'ajeno'}`}>
              <div className="mensaje-burbuja">{msg.contenido}</div>
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
    </main>
  )
}
