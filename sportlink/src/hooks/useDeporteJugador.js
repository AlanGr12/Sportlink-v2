import { useEffect, useState } from 'react'
import api from '../axiosConfig.js'

/**
 * useDeporteJugador — nombre del deporte del jugador ("Fútbol", "Basket"…), o null.
 * Se lee del perfil del jugador (GET /api/jugadores/:id) y no de los resultados de un
 * listado: así se conoce aunque todavía no haya pruebas/entrenamientos de su deporte.
 */
export default function useDeporteJugador(idJugador) {
  const [dato, setDato] = useState({ id: null, deporte: null })
  const id = Number(idJugador) || null

  useEffect(() => {
    if (!id) return
    let vivo = true
    api.get(`/api/jugadores/${id}`)
      .then((res) => {
        if (vivo) setDato({ id, deporte: res.data?.deportes?.deporte || res.data?.deporte?.deporte || null })
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [id])

  // Si cambia el jugador (o deja de haber uno) no se devuelve el deporte del anterior
  return id && dato.id === id ? dato.deporte : null
}
