import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import '../components/vinculacion.css'

const nombreCompleto = (e) => [e?.nombre, e?.apellido].filter(Boolean).join(' ').trim() || 'Entrenador'

/**
 * PerfilEntrenadoresClub — panel de gestión "Mis entrenadores" (solo el club dueño del perfil).
 *  - Vinculados: entrenadores con vinculación aceptada, con opción de desvincular, y alta por invitación.
 *  - Solicitudes: pedidos recibidos (aceptar / rechazar) e invitaciones enviadas (cancelar).
 */
export default function PerfilEntrenadoresClub() {
  const [tab, setTab] = useState('vinculados')
  const [vinculados, setVinculados] = useState([])
  const [recibidas, setRecibidas] = useState([])
  const [enviadas, setEnviadas] = useState([])
  const [todos, setTodos] = useState([])
  const [elegido, setElegido] = useState('')
  const [cargando, setCargando] = useState(true)
  const [ocupado, setOcupado] = useState(null)
  const [desvinculando, setDesvinculando] = useState(null)
  const [feedback, setFeedback] = useState(null) // { tipo: 'ok' | 'error', texto }

  const cargar = useCallback(async () => {
    try {
      const [v, p, t] = await Promise.all([
        api.get('/api/vinculaciones/mis-entrenadores'),
        api.get('/api/vinculaciones/pendientes'),
        api.get('/api/entrenadores'),
      ])
      setVinculados(Array.isArray(v.data) ? v.data : [])
      setRecibidas(p.data?.recibidas || [])
      setEnviadas(p.data?.enviadas || [])
      setTodos(Array.isArray(t.data) ? t.data : [])
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.response?.data?.error || 'No se pudieron cargar los entrenadores.' })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const ejecutar = async (clave, accion, mensajeOk) => {
    setOcupado(clave)
    setFeedback(null)
    try {
      await accion()
      setFeedback({ tipo: 'ok', texto: mensajeOk })
      setDesvinculando(null)
      await cargar()
    } catch (err) {
      setFeedback({ tipo: 'error', texto: err.response?.data?.error || 'No se pudo completar la acción.' })
    } finally {
      setOcupado(null)
    }
  }

  // Entrenadores que se pueden invitar: sin club y sin solicitud pendiente con este club
  const invitables = useMemo(() => {
    const excluidos = new Set([
      ...vinculados.map(e => Number(e.identrenador)),
      ...recibidas.map(s => Number(s.id_entrenador)),
      ...enviadas.map(s => Number(s.id_entrenador)),
    ])
    return todos.filter(e => !excluidos.has(Number(e.identrenador)) && e.tieneclub !== true)
  }, [todos, vinculados, recibidas, enviadas])

  const invitar = () => {
    if (!elegido) return
    ejecutar('invitar', () => api.post('/api/vinculaciones/invitar', { id_entrenador: Number(elegido) }), 'Invitación enviada.')
      .then(() => setElegido(''))
  }

  if (cargando) return null

  return (
    <div className="vinc-panel">
      <h3 className="vinc-panel-titulo">Mis entrenadores</h3>

      <div className="vinc-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'vinculados'}
          className={`vinc-tab ${tab === 'vinculados' ? 'vinc-tab--activa' : ''}`} onClick={() => setTab('vinculados')}>
          Vinculados
        </button>
        <button type="button" role="tab" aria-selected={tab === 'solicitudes'}
          className={`vinc-tab ${tab === 'solicitudes' ? 'vinc-tab--activa' : ''}`} onClick={() => setTab('solicitudes')}>
          Solicitudes
          {recibidas.length > 0 && <span className="vinc-contador">{recibidas.length}</span>}
        </button>
      </div>

      {feedback && <p className={`vinc-feedback vinc-feedback--${feedback.tipo}`}>{feedback.texto}</p>}

      {tab === 'vinculados' && (
        <>
          <div className="vinc-invitar">
            <select value={elegido} onChange={(e) => setElegido(e.target.value)} aria-label="Entrenador a invitar">
              <option value="">Invitar a un entrenador…</option>
              {invitables.map(e => (
                <option key={e.identrenador} value={e.identrenador}>{nombreCompleto(e)}</option>
              ))}
            </select>
            <button type="button" className="vinc-btn vinc-btn--primary" disabled={!elegido || ocupado === 'invitar'} onClick={invitar}>
              {ocupado === 'invitar' ? 'Enviando...' : 'Invitar'}
            </button>
          </div>

          {vinculados.length === 0 ? (
            <p className="vinc-vacio">Todavía no tenés entrenadores vinculados.</p>
          ) : (
            <div className="vinc-lista">
              {vinculados.map(e => (
                <div className="vinc-tarjeta" key={e.idvinculacion}>
                  <div className="vinc-tarjeta-cabecera">
                    <Avatar src={e.fotoperfil} nombre={nombreCompleto(e)} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/perfil/${e.idusuario}`} className="vinc-tarjeta-nombre">{nombreCompleto(e)}</Link>
                      <p className="vinc-tarjeta-sub">{e.deportes?.map(d => d.deporte).join(', ') || e.titulo || 'Entrenador'}</p>
                    </div>
                  </div>
                  {desvinculando === e.idvinculacion ? (
                    <div className="vinc-fila-botones">
                      <button type="button" className="vinc-btn vinc-btn--danger" disabled={ocupado === e.idvinculacion}
                        onClick={() => ejecutar(e.idvinculacion, () => api.delete(`/api/vinculaciones/${e.idvinculacion}`), 'Entrenador desvinculado.')}>
                        Confirmar
                      </button>
                      <button type="button" className="vinc-btn vinc-btn--ghost" onClick={() => setDesvinculando(null)}>Cancelar</button>
                    </div>
                  ) : (
                    <button type="button" className="vinc-btn vinc-btn--danger" onClick={() => setDesvinculando(e.idvinculacion)}>
                      Desvincular
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'solicitudes' && (
        <>
          {recibidas.length === 0 ? (
            <p className="vinc-vacio">No tenés solicitudes pendientes.</p>
          ) : (
            <div className="vinc-lista">
              {recibidas.map(s => (
                <div className="vinc-tarjeta" key={s.id}>
                  <div className="vinc-tarjeta-cabecera">
                    <Avatar src={s.entrenadores?.fotoperfil} nombre={nombreCompleto(s.entrenadores)} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/perfil/${s.entrenadores?.idusuario}`} className="vinc-tarjeta-nombre">{nombreCompleto(s.entrenadores)}</Link>
                      <p className="vinc-tarjeta-sub">Quiere unirse a tu club</p>
                    </div>
                  </div>
                  <div className="vinc-fila-botones">
                    <button type="button" className="vinc-btn vinc-btn--primary" disabled={ocupado === s.id}
                      onClick={() => ejecutar(s.id, () => api.patch(`/api/vinculaciones/${s.id}/responder`, { estado: 'ACEPTADO' }), 'Solicitud aceptada.')}>
                      Aceptar
                    </button>
                    <button type="button" className="vinc-btn vinc-btn--ghost" disabled={ocupado === s.id}
                      onClick={() => ejecutar(s.id, () => api.patch(`/api/vinculaciones/${s.id}/responder`, { estado: 'RECHAZADO' }), 'Solicitud rechazada.')}>
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {enviadas.length > 0 && (
            <>
              <h4 className="vinc-subtitulo">Invitaciones enviadas</h4>
              <div className="vinc-lista">
                {enviadas.map(s => (
                  <div className="vinc-tarjeta" key={s.id}>
                    <div className="vinc-tarjeta-cabecera">
                      <Avatar src={s.entrenadores?.fotoperfil} nombre={nombreCompleto(s.entrenadores)} size={44} />
                      <div style={{ minWidth: 0 }}>
                        <Link to={`/perfil/${s.entrenadores?.idusuario}`} className="vinc-tarjeta-nombre">{nombreCompleto(s.entrenadores)}</Link>
                        <p className="vinc-tarjeta-sub">Esperando respuesta</p>
                      </div>
                    </div>
                    <button type="button" className="vinc-btn vinc-btn--ghost" disabled={ocupado === s.id}
                      onClick={() => ejecutar(s.id, () => api.delete(`/api/vinculaciones/${s.id}`), 'Invitación cancelada.')}>
                      Cancelar invitación
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
