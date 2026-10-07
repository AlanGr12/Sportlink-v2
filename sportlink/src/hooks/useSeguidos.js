import { useEffect, useState } from 'react'
import api from '../axiosConfig.js'

/**
 * useSeguidos — devuelve un Set con los idusuario de las cuentas (clubes/entrenadores)
 * que sigue el usuario de la sesión. Sirve para ordenar listados dejando primero
 * lo publicado por cuentas seguidas.
 */
export default function useSeguidos(usuario) {
  const [ids, setIds] = useState(() => new Set())
  const idusuario = usuario?.idusuario

  useEffect(() => {
    if (!idusuario) return
    let vivo = true
    api.get('/api/seguidores/mis-seguidos')
      .then((res) => {
        if (vivo) setIds(new Set((res.data || []).map(Number)))
      })
      .catch(() => {})
    return () => { vivo = false }
  }, [idusuario])

  return ids
}
