import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { tiempoRelativo } from '../utils/dateUtils.js'
import '../pruebas/PruebasView.css'
import './NotificacionesView.css'

// Avisa al header que cambió algo, para que actualice el contador de la campana
const avisarHeader = () => window.dispatchEvent(new Event('slk-notificaciones'))

const ETIQUETAS = {
  PRUEBA: 'Pruebas',
  ENTRENAMIENTO: 'Entrenamientos',
  EMPLEO: 'Empleos',
  LISTA_ESPERA: 'Lista de espera',
  CHAT: 'Mensajes',
  LIKE: 'Me gusta',
  COMENTARIO: 'Comentarios',
  SEGUIDOR: 'Seguidores',
  RECORDATORIO: 'Recordatorios',
  SISTEMA: 'Sistema',
}
const etiqueta = (tipo) => {
  const t = (tipo || 'SISTEMA').toUpperCase()
  return ETIQUETAS[t] || t.charAt(0) + t.slice(1).toLowerCase()
}

const Ico = ({ children }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
)
function IconoTipo({ tipo }) {
  const t = (tipo || '').toUpperCase()
  if (t === 'CHAT') return <Ico><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Ico>
  if (t === 'PRUEBA') return <Ico><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3a3 3 0 0 1-3 4M7 5H4a3 3 0 0 0 3 4" /></Ico>
  if (t === 'SEGUIDOR') return <Ico><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" /></Ico>
  if (t === 'LIKE') return <Ico><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></Ico>
  if (t === 'ENTRENAMIENTO' || t === 'RECORDATORIO') return <Ico><rect x="3" y="4" width="18" height="18" /><path d="M16 2v4M8 2v4M3 10h18" /></Ico>
  return <Ico><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></Ico>
}

export default function NotificacionesView() {
  const navigate = useNavigate()
  const [lista, setLista] = useState(null)
  const [error, setError] = useState(false)
  const [filtro, setFiltro] = useState('todas') // 'todas' | 'noleidas' | TIPO

  useEffect(() => {
    let vivo = true
    api.get('/api/notificaciones')
      .then(({ data }) => { if (vivo) setLista(Array.isArray(data) ? data : []) })
      .catch(() => { if (vivo) { setLista([]); setError(true) } })
    return () => { vivo = false }
  }, [])

  const noLeidas = (lista || []).filter((n) => !n.leido).length
  const tipos = [...new Set((lista || []).map((n) => (n.tipo || 'SISTEMA').toUpperCase()))]
  const visibles = (lista || []).filter((n) => {
    if (filtro === 'todas') return true
    if (filtro === 'noleidas') return !n.leido
    return (n.tipo || 'SISTEMA').toUpperCase() === filtro
  })

  const marcarLeida = async (id) => {
    setLista((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)))
    try { await api.patch(`/api/notificaciones/${id}/leer`); avisarHeader() } catch { /* queda marcada localmente */ }
  }

  const marcarTodas = async () => {
    setLista((prev) => prev.map((n) => ({ ...n, leido: true })))
    try { await api.patch('/api/notificaciones/leer-todas'); avisarHeader() } catch { /* queda marcada localmente */ }
  }

  const eliminar = async (id) => {
    const antes = lista
    setLista((prev) => prev.filter((n) => n.id !== id))
    try { await api.delete(`/api/notificaciones/${id}`); avisarHeader() } catch { setLista(antes) }
  }

  const abrir = (n) => {
    if (!n.leido) marcarLeida(n.id)
    if (n.enlace) navigate(n.enlace)
  }

  return (
    <div className="pr ntf">
      <div className="pr-wrap ntf-layout">
        <aside className="ntf-lado">
          <h1 className="pr-display ntf-titulo">Notificaciones</h1>
          <p className="ntf-resumen">
            {lista === null ? 'Cargando…' : noLeidas > 0 ? `${noLeidas} sin leer de ${lista.length}` : 'Estás al día.'}
          </p>

          <div className="ntf-filtros" role="group" aria-label="Filtrar">
            <button type="button" className={`pr-chip${filtro === 'todas' ? ' is-on' : ''}`} aria-pressed={filtro === 'todas'} onClick={() => setFiltro('todas')}>Todas</button>
            <button type="button" className={`pr-chip${filtro === 'noleidas' ? ' is-on' : ''}`} aria-pressed={filtro === 'noleidas'} onClick={() => setFiltro('noleidas')}>
              Sin leer{noLeidas > 0 && ` · ${noLeidas}`}
            </button>
            {tipos.length > 1 && tipos.map((t) => (
              <button key={t} type="button" className={`pr-chip${filtro === t ? ' is-on' : ''}`} aria-pressed={filtro === t} onClick={() => setFiltro(t)}>
                {etiqueta(t)}
              </button>
            ))}
          </div>

          {noLeidas > 0 && (
            <button type="button" className="pr-btn pr-btn--ink ntf-todas" onClick={marcarTodas}>Marcar todas como leídas</button>
          )}
        </aside>

        {/* Única zona con scroll: la lista */}
        <section className="ntf-lista" aria-label="Lista de notificaciones" aria-busy={lista === null}>
          {lista === null ? (
            [0, 1, 2, 3].map((i) => <div key={i} className="ntf-item ntf-item--skeleton" />)
          ) : error ? (
            <div className="pr-empty ntf-vacio">
              <h2 className="pr-display pr-empty-title">No pudimos cargar tus notificaciones</h2>
              <button type="button" className="pr-btn pr-btn--ink" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : visibles.length === 0 ? (
            <div className="pr-empty ntf-vacio">
              <h2 className="pr-display pr-empty-title">{filtro === 'todas' ? 'No tenés notificaciones' : 'Nada por acá'}</h2>
              <p>{filtro === 'todas' ? 'Cuando te inscribas a pruebas, te escriban o te sigan, lo vas a ver acá.' : 'Probá con otro filtro.'}</p>
            </div>
          ) : (
            <ul>
              {visibles.map((n) => (
                <li key={n.id} className={`ntf-item${n.leido ? '' : ' is-nueva'}`}>
                  <button type="button" className="ntf-item-abrir" onClick={() => abrir(n)} aria-label={`${n.titulo}${n.leido ? '' : ', sin leer'}`}>
                    <span className="ntf-icono">
                      {n.imagen ? <img src={n.imagen} alt="" /> : <IconoTipo tipo={n.tipo} />}
                    </span>
                    <span className="ntf-item-txt">
                      <span className="ntf-item-meta">
                        <span className="ntf-pill">{etiqueta(n.tipo)}</span>
                        <time>{tiempoRelativo(n.fecha_creacion || n.createdat)}</time>
                      </span>
                      <strong>{n.titulo}</strong>
                      {(n.mensaje || n.descripcion) && <span className="ntf-item-desc">{n.mensaje || n.descripcion}</span>}
                    </span>
                  </button>
                  <div className="ntf-item-acciones">
                    {!n.leido && <button type="button" className="pr-link" onClick={() => marcarLeida(n.id)}>Marcar como leída</button>}
                    <button type="button" className="pr-link pr-link--danger" onClick={() => eliminar(n.id)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
