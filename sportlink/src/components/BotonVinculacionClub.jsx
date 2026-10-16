import { useCallback, useEffect, useState } from 'react'
import api from '../axiosConfig.js'
import './vinculacion.css'

/**
 * BotonVinculacionClub — acciones del entrenador sobre el perfil de un club.
 * No renderiza nada si quien mira no es un entrenador.
 *
 * Estados: sin relación → "Solicitar unirme" · solicitud enviada → "Solicitud pendiente" ·
 * invitación recibida → Aceptar / Rechazar · vinculado → badge + "Desvincularme".
 *
 * Props:
 *  - idclub: id del club del perfil que se está viendo
 *  - usuario: usuario de la sesión
 */
export default function BotonVinculacionClub({ idclub, usuario }) {
  const [estado, setEstado] = useState(null) // { estado, id, origen, tieneOtroClub }
  const [cargando, setCargando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState('')

  const esEntrenador = String(usuario?.tipousuario || '').toLowerCase() === 'entrenador'

  const cargar = useCallback(async () => {
    try {
      const res = await api.get(`/api/vinculaciones/estado/${idclub}`)
      setEstado(res.data)
    } catch {
      setEstado(null)
    }
  }, [idclub])

  useEffect(() => {
    if (esEntrenador && idclub) cargar()
  }, [esEntrenador, idclub, cargar])

  if (!esEntrenador || !idclub || !estado) return null

  const ejecutar = async (accion) => {
    setCargando(true)
    setError('')
    try {
      await accion()
      setConfirmando(false)
      await cargar()
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar la acción. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const solicitar = () => ejecutar(() => api.post('/api/vinculaciones/solicitar', { id_club: idclub }))
  const responder = (nuevo) => ejecutar(() => api.patch(`/api/vinculaciones/${estado.id}/responder`, { estado: nuevo }))
  const quitar = () => ejecutar(() => api.delete(`/api/vinculaciones/${estado.id}`))

  let contenido
  if (estado.estado === 'ACEPTADO') {
    contenido = (
      <>
        <div className="vinc-badge">✓ Pertenecés a este club</div>
        {confirmando ? (
          <>
            <p className="vinc-nota">¿Seguro que querés desvincularte de este club?</p>
            <div className="vinc-fila-botones">
              <button type="button" className="vinc-btn vinc-btn--danger" disabled={cargando} onClick={quitar}>
                {cargando ? 'Procesando...' : 'Sí, desvincularme'}
              </button>
              <button type="button" className="vinc-btn vinc-btn--ghost" disabled={cargando} onClick={() => setConfirmando(false)}>
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <button type="button" className="vinc-link" onClick={() => setConfirmando(true)}>Desvincularme</button>
        )}
      </>
    )
  } else if (estado.estado === 'PENDIENTE' && estado.origen === 'CLUB') {
    contenido = (
      <>
        <p className="vinc-nota">Este club te invitó a formar parte.</p>
        <div className="vinc-fila-botones">
          <button type="button" className="vinc-btn vinc-btn--primary" disabled={cargando} onClick={() => responder('ACEPTADO')}>
            Aceptar
          </button>
          <button type="button" className="vinc-btn vinc-btn--ghost" disabled={cargando} onClick={() => responder('RECHAZADO')}>
            Rechazar
          </button>
        </div>
      </>
    )
  } else if (estado.estado === 'PENDIENTE') {
    contenido = (
      <>
        <button type="button" className="vinc-btn" disabled>Solicitud pendiente</button>
        <button type="button" className="vinc-link" disabled={cargando} onClick={quitar}>Cancelar solicitud</button>
      </>
    )
  } else if (estado.tieneOtroClub) {
    contenido = <p className="vinc-nota">Ya pertenecés a otro club. Desvinculate para poder unirte a este.</p>
  } else {
    contenido = (
      <button type="button" className="vinc-btn vinc-btn--primary" disabled={cargando} onClick={solicitar}>
        {cargando ? 'Enviando...' : 'Solicitar unirme al club'}
      </button>
    )
  }

  return (
    <div className="vinc-box">
      {contenido}
      {error && <p className="vinc-error">{error}</p>}
    </div>
  )
}
