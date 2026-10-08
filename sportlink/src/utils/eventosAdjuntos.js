import { useEffect, useState } from 'react'
import api from '../axiosConfig.js'

// Helpers de eventos adjuntables (prueba, entrenamiento, empleo); los componentes están en components/EventoAdjunto.jsx

export const ETIQUETAS_EVENTO = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', EMPLEO: 'Empleo' }

/** Solo clubes y entrenadores tienen eventos para adjuntar. */
export const puedeAdjuntarEventos = (usuario) => ['club', 'entrenador'].includes(usuario?.tipousuario)

/** { tipo, id } del evento adjunto a un mensaje de chat, o null. */
export function eventoDeMensaje(msg) {
  if (msg?.idprueba) return { tipo: 'PRUEBA', id: msg.idprueba }
  if (msg?.identrenamiento) return { tipo: 'ENTRENAMIENTO', id: msg.identrenamiento }
  if (msg?.idempleo) return { tipo: 'EMPLEO', id: msg.idempleo }
  return null
}

// ── Detalle con caché (los mensajes de chat solo traen el id del evento) ──
const cacheDetalles = new Map()

function obtenerEvento(tipo, id) {
  const clave = `${tipo}-${id}`
  if (!cacheDetalles.has(clave)) {
    const promesa = api.get(`/api/adjuntos/${tipo}/${id}`).then(r => r.data)
    promesa.catch(() => cacheDetalles.delete(clave)) // permitir reintento si falló
    cacheDetalles.set(clave, promesa)
  }
  return cacheDetalles.get(clave)
}

export function useEventoDetalle(tipo, id) {
  const clave = tipo && id ? `${tipo}-${id}` : null
  const [estado, setEstado] = useState({ clave: null, evento: null, error: false })

  useEffect(() => {
    if (!clave) return
    let vivo = true
    obtenerEvento(tipo, id)
      .then(evento => { if (vivo) setEstado({ clave, evento, error: false }) })
      .catch(() => { if (vivo) setEstado({ clave, evento: null, error: true }) })
    return () => { vivo = false }
  }, [clave, tipo, id])

  if (!clave) return { evento: null, error: false, cargando: false }
  if (estado.clave !== clave) return { evento: null, error: false, cargando: true }
  return { ...estado, cargando: false }
}
