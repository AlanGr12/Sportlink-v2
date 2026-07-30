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

export default function PanelChat({ usuario, conversacionActiva, actualizarUltimoMensaje }) {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(false)
  const historialRef = useRef(null)

  // Auto-scroll al fondo
  const scrollToBottom = () => {
    if (historialRef.current) {
      historialRef.current.scrollTop = historialRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  // Carga historial + suscripción Realtime
  useEffect(() => {
    let canalRealtime = null

    const fetchMensajes = async (id) => {
      setLoading(true)
      try {
        const { data } = await api.get(`/api/conversaciones/${id}/mensajes?limite=100`)
        setMensajes(data || [])
      } catch (err) {
        console.error('Error cargando mensajes:', err)
      } finally {
        setLoading(false)
      }
    }

    if (conversacionActiva) {
      const id = conversacionActiva.idconversacion
      fetchMensajes(id)

      canalRealtime = supabase
        .channel(`chat-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'mensajes', filter: `idconversacion=eq.${id}` },
          (payload) => {
            const nuevoMensaje = payload.new
            setMensajes((prev) => {
              if (prev.some((m) => m.idmensaje === nuevoMensaje.idmensaje)) return prev
              return [...prev, nuevoMensaje]
            })
            actualizarUltimoMensaje(id, nuevoMensaje)
          }
        )
        .subscribe()
    } else {
      setMensajes([])
    }

    return () => {
      if (canalRealtime) supabase.removeChannel(canalRealtime)
    }
  }, [conversacionActiva])

  // Envío con update optimista
  const handleEnviarMensaje = async (contenido) => {
    if (!conversacionActiva) return
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
              <div className="mensaje-hora">{formatearHora(msg.createdat)}</div>
            </div>
          )
        })}
      </div>

      {/* ── Input fijo abajo ── */}
      <ChatInput onSend={handleEnviarMensaje} />
    </main>
  )
}
