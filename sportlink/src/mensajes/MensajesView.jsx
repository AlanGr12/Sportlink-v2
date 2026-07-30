import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../axiosConfig.js'
import SidebarConversaciones from './SidebarConversaciones.jsx'
import PanelChat from './PanelChat.jsx'
import './mensajes.css'

export default function MensajesView({ usuario }) {
  const location = useLocation()

  const [conversaciones, setConversaciones] = useState([])
  const [conversacionActiva, setConversacionActiva] = useState(null)
  const [loading, setLoading] = useState(true)

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
  const actualizarUltimoMensaje = (idconversacion, mensaje) => {
    setConversaciones((prev) =>
      prev
        .map((c) => {
          if (c.idconversacion === idconversacion) {
            return { ...c, ultimoMensaje: mensaje, updatedat: mensaje.createdat }
          }
          return c
        })
        .sort((a, b) => new Date(b.updatedat) - new Date(a.updatedat))
    )
  }

  return (
    <div className="mensajes-container">
      <SidebarConversaciones
        conversaciones={conversaciones}
        conversacionActiva={conversacionActiva}
        setConversacionActiva={setConversacionActiva}
        loading={loading}
      />
      <PanelChat
        usuario={usuario}
        conversacionActiva={conversacionActiva}
        actualizarUltimoMensaje={actualizarUltimoMensaje}
      />
    </div>
  )
}
