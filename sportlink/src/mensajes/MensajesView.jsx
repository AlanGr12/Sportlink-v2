import React, { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../axiosConfig.js'
import SidebarConversaciones from './SidebarConversaciones.jsx'
import PanelChat from './PanelChat.jsx'
import './mensajes.css'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function MensajesView({ usuario }) {
  const location = useLocation()

  const [conversaciones, setConversaciones] = useState([])
  const [conversacionActiva, setConversacionActiva] = useState(null)
  const [loading, setLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  // Suscripción a canal de presencia global
  useEffect(() => {
    if (!usuario) return

    const miId = String(usuario.idusuario || usuario.id)
    const presenceChannel = supabase.channel('global-presence', {
      config: {
        presence: { key: miId }
      }
    })

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const onlineIds = new Set(Object.keys(state))
        setOnlineUsers(onlineIds)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ idusuario: miId, online_at: new Date() })
        }
      })

    return () => {
      supabase.removeChannel(presenceChannel)
    }
  }, [usuario])

  // Cargar lista de conversaciones inicial
  useEffect(() => {
    const fetchConversaciones = async () => {
      try {
        const { data } = await api.get('/api/conversaciones')
        const lista = data || []
        setConversaciones(lista)

        // Si llegamos con una conversación inicial vía router state (ej: desde botón "Contactar"),
        // la abrimos directamente. Buscamos en la lista para tener los datos completos
        // (con ultimoMensaje, otroParticipante, etc.) si ya existe.
        const estadoInicial = location.state?.conversacionInicial
        if (estadoInicial) {
          const enLista = lista.find(c => c.idconversacion === estadoInicial.idconversacion)
          setConversacionActiva(enLista || estadoInicial)
          // Limpiar el state del router para que recargas no re-abran la misma
          window.history.replaceState({}, '', '/mensajes')
        }
      } catch (err) {
        console.error('Error cargando conversaciones:', err)
      } finally {
        setLoading(false)
      }
    }

    if (usuario) {
      fetchConversaciones()
    }
  }, [usuario]) // Solo al montar (no al cambiar location para evitar re-fetches)

  // Actualizar último mensaje de una conversación en la sidebar
  const actualizarUltimoMensaje = useCallback((idconversacion, mensaje) => {
    setConversaciones((prev) =>
      prev
        .map((c) => {
          if (c.idconversacion === idconversacion) {
            const actualFecha = c.ultimoMensaje?.createdat ? new Date(c.ultimoMensaje.createdat).getTime() : 0
            const msgFecha = mensaje.createdat ? new Date(mensaje.createdat).getTime() : 0

            if (!c.ultimoMensaje || c.ultimoMensaje.idmensaje === mensaje.idmensaje || msgFecha >= actualFecha) {
              return { ...c, ultimoMensaje: mensaje, updatedat: mensaje.createdat || c.updatedat }
            }
          }
          return c
        })
        .sort((a, b) => new Date(b.updatedat) - new Date(a.updatedat))
    )
  }, [])

  // Marcar una conversación como leída localmente (solo actualiza la lista del sidebar)
  // IMPORTANTE: NO llamar a setConversacionActiva aquí porque crea un nuevo objeto
  // y eso re-dispara el useEffect de PanelChat causando un bucle infinito.
  const marcarComoLeida = useCallback((idconversacion) => {
    setConversaciones((prev) =>
      prev.map((c) => {
        if (c.idconversacion === idconversacion) {
          return { ...c, noleidos: 0 }
        }
        return c
      })
    )
  }, [])

  return (
    <div className="mensajes-container">
      <SidebarConversaciones
        usuario={usuario}
        onlineUsers={onlineUsers}
        conversaciones={conversaciones}
        conversacionActiva={conversacionActiva}
        setConversacionActiva={setConversacionActiva}
        loading={loading}
      />
      <PanelChat
        usuario={usuario}
        onlineUsers={onlineUsers}
        conversacionActiva={conversacionActiva}
        actualizarUltimoMensaje={actualizarUltimoMensaje}
        marcarComoLeida={marcarComoLeida}
      />
    </div>
  )
}
