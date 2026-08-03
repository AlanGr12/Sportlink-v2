import React, { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import ChatInput from './ChatInput.jsx'
import { IconoMensajes } from '../iconos/IconoMensajes.jsx'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Clase del badge de rol para el header del panel
function rolBadgeClass(rol) {
  if (!rol) return 'mensajes-panel-rol-badge'
  const r = rol.toLowerCase()
  if (r === 'entrenador') return 'mensajes-panel-rol-badge entrenador'
  if (r === 'club')       return 'mensajes-panel-rol-badge club'
  if (r === 'jugador')    return 'mensajes-panel-rol-badge jugador'
  return 'mensajes-panel-rol-badge grupo'
}

// Formatea hora corta: "10:35 AM"
function formatearHora(fechaString) {
  if (!fechaString) return ''
  return new Date(fechaString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Retorna una etiqueta legible de fecha para el separador
function etiquetaFecha(fechaString) {
  const date = new Date(fechaString)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)

  const mismaFecha = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()

  if (mismaFecha(date, hoy)) return 'TODAY'
  if (mismaFecha(date, ayer)) return 'YESTERDAY'
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== hoy.getFullYear() ? 'numeric' : undefined,
  }).toUpperCase()
}

// Genera la lista de items con separadores de fecha intercalados
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

const DoubleCheck = ({ leido }) => (
  <svg 
    width="15" height="15" viewBox="0 0 24 24" 
    fill="none" 
    stroke={leido ? "var(--sportlink-cyan, #00f0ff)" : "rgba(255,255,255,0.5)"} 
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block', marginBottom: '1px' }}
  >
    <polyline points="7 12 11 16 19 8" />
    <polyline points="2 12 6 16 14 8" />
  </svg>
)

export default function PanelChat({ usuario, onlineUsers, conversacionActiva, actualizarUltimoMensaje, marcarComoLeida }) {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(false)
  const historialRef = useRef(null)
  const [typingUser, setTypingUser] = useState(null)
  const typingTimeoutRef = useRef(null)
  const canalRealtimeRef = useRef(null)
  const lastTypingSent = useRef(0)

  // Guardamos las callbacks del padre en refs para poder usarlas
  // dentro de los efectos sin necesidad de incluirlas en las dependencias
  const actualizarUltimoMensajeRef = useRef(actualizarUltimoMensaje)
  const marcarComoLeidaRef = useRef(marcarComoLeida)
  useEffect(() => { actualizarUltimoMensajeRef.current = actualizarUltimoMensaje }, [actualizarUltimoMensaje])
  useEffect(() => { marcarComoLeidaRef.current = marcarComoLeida }, [marcarComoLeida])

  // Auto-scroll al fondo
  const scrollToBottom = () => {
    if (historialRef.current) {
      historialRef.current.scrollTop = historialRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // ── EFECTO 1: Carga HTTP del historial ──
  // Depende SOLO del id primitivo. Se ejecuta exactamente una vez por conversación.
  const idActivo = conversacionActiva?.idconversacion ?? null

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
      .then(({ data }) => {
        if (activo) setMensajes(data || [])
      })
      .catch((err) => {
        console.error('Error cargando mensajes:', err)
        if (activo) setMensajes([])
      })
      .finally(() => {
        if (activo) setLoading(false)
      })

    // Marcar como leído (fire-and-forget, no altera conversacionActiva)
    api.post(`/api/conversaciones/${idActivo}/leer`)
      .then(() => { if (activo) marcarComoLeidaRef.current?.(idActivo) })
      .catch((err) => console.error('Error marcando como leído:', err))

    return () => { activo = false }
  }, [idActivo])

  // ── EFECTO 2: Suscripción Realtime (separada del HTTP) ──
  // Depende SOLO del id primitivo. Gestiona el canal sin re-disparar el fetch.
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

  // Envío con update optimista
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
        payload: {
          idusuario: usuario.idusuario || usuario.id,
          nombre: usuario.nombre || 'Usuario'
        }
      })
      lastTypingSent.current = now
    }
  }

  // Helper para los detalles del contacto activo
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

  /* ────────── RENDER: panel vacío ────────── */
  if (!conversacionActiva) {
    return (
      <main className="mensajes-panel">
        <div className="mensajes-panel-empty">
          <IconoMensajes size={56} color="rgba(255,255,255,0.15)" />
          <p>Seleccioná una conversación para chatear</p>
        </div>
      </main>
    )
  }

  const { nombre, foto, rol } = getDetallesContacto(conversacionActiva)
  const miIdUsuario = usuario?.idusuario || usuario?.id
  const items = buildMensajesConSeparadores(mensajes)
  const isOnline = conversacionActiva.tipo === 'PRIVADA' && onlineUsers && onlineUsers.has(String(conversacionActiva.otroParticipante?.idusuario))

  /* ────────── RENDER: chat activo ────────── */
  return (
    <main className="mensajes-panel">
      {/* ── Header con avatar + nombre + badge de rol ── */}
      <div className="mensajes-panel-header">
        <Avatar src={foto} nombre={nombre} size={42} />
        <div className="mensajes-panel-header-info">
          <div className="mensajes-panel-name">{nombre}</div>
          {rol && (
            <div className={rolBadgeClass(rol)}>
              {rol.toUpperCase()}
            </div>
          )}
          {isOnline && <div className="mensajes-panel-online-text">En línea</div>}
        </div>
      </div>

      {/* ── Historial de mensajes ── */}
      <div className="mensajes-historial" ref={historialRef}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
            Cargando historial...
          </div>
        )}

        {items.map((item) => {
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

      {/* ── Indicador de escribiendo ── */}
      {typingUser && (
        <div className="typing-indicator">
          {typingUser} está escribiendo<span className="typing-dots"></span>
        </div>
      )}

      {/* ── Input fijo abajo ── */}
      <ChatInput onSend={handleEnviarMensaje} onTyping={handleTyping} />
    </main>
  )
}
