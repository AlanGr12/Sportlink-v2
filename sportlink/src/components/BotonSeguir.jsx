import { useEffect, useState } from 'react'
import api from '../axiosConfig.js'

const TIPOS_SEGUIBLES = ['club', 'entrenador']

/**
 * BotonSeguir — seguir / dejar de seguir a un club o entrenador.
 * No renderiza nada si el destino es un deportista, es la propia cuenta o no hay sesión.
 *
 * Props:
 *  - idusuario, tipousuario: cuenta destino
 *  - usuario: usuario de la sesión
 *  - siguiendoInicial: (opcional) si el padre ya conoce el estado, evita una consulta extra
 *  - onCambio(estado): recibe { seguidores, seguidos, siguiendo } del destino tras cada cambio
 */
export default function BotonSeguir({ idusuario, tipousuario, usuario, siguiendoInicial, onCambio, variante }) {
  const [siguiendo, setSiguiendo] = useState(siguiendoInicial ?? false)
  const [cargando, setCargando] = useState(false)
  const [hover, setHover] = useState(false)
  const [error, setError] = useState('')

  const puedeSeguir =
    !!usuario?.idusuario &&
    !!idusuario &&
    Number(idusuario) !== Number(usuario.idusuario) &&
    TIPOS_SEGUIBLES.includes(String(tipousuario || '').toLowerCase())

  useEffect(() => {
    if (siguiendoInicial !== undefined) {
      setSiguiendo(siguiendoInicial)
      return
    }
    if (!puedeSeguir) return
    let vivo = true
    api.get(`/api/seguidores/${idusuario}`)
      .then((res) => { if (vivo) setSiguiendo(res.data?.siguiendo === true) })
      .catch(() => {})
    return () => { vivo = false }
  }, [idusuario, puedeSeguir, siguiendoInicial])

  if (!puedeSeguir) return null

  const alternar = async (e) => {
    e.stopPropagation()
    setCargando(true)
    setError('')
    try {
      const { data } = siguiendo
        ? await api.delete(`/api/seguidores/${idusuario}`)
        : await api.post(`/api/seguidores/${idusuario}`)
      setSiguiendo(data.siguiendo === true)
      if (onCambio) onCambio(data)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar la acción.')
    } finally {
      setCargando(false)
    }
  }

  const esPerfil = variante === 'perfil'

  const estilo = siguiendo
    ? { background: 'transparent', color: hover ? '#ef4444' : '#d4d4d8', border: `1px solid ${hover ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.25)'}` }
    : { background: '#2DEFF2', color: '#090a0c', border: '1px solid #2DEFF2' }

  if (esPerfil) {
    // Mismo molde que los demás botones del perfil (clase profile-btn-edit)
    const estiloPerfil = siguiendo
      ? (hover ? { color: '#ef4444', borderColor: 'rgba(239,68,68,0.6)' } : {})
      : { color: '#2DEFF2', borderColor: 'rgba(45,239,242,0.55)' }
    return (
      <>
        <button
          type="button"
          className="profile-btn-edit"
          onClick={alternar}
          disabled={cargando}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ ...estiloPerfil, opacity: cargando ? 0.7 : 1, cursor: cargando ? 'wait' : 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {siguiendo
              ? <polyline points="20 6 9 17 4 12" />
              : <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></>}
          </svg>
          {siguiendo ? (hover ? 'DEJAR DE SEGUIR' : 'SIGUIENDO') : 'SEGUIR'}
        </button>
        {error && <span style={{ color: '#ef4444', fontSize: 11 }}>{error}</span>}
      </>
    )
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <button
        type="button"
        onClick={alternar}
        disabled={cargando}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...estilo, padding: '7px 16px', borderRadius: 8, fontWeight: 700, fontSize: 12,
          letterSpacing: '0.5px', cursor: cargando ? 'wait' : 'pointer', opacity: cargando ? 0.7 : 1,
          fontFamily: 'Space Grotesk, sans-serif', minWidth: 120,
        }}
      >
        {siguiendo ? (hover ? 'DEJAR DE SEGUIR' : 'SIGUIENDO') : 'SEGUIR'}
      </button>
      {error && <span style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{error}</span>}
    </span>
  )
}
