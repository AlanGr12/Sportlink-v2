import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import Footer from '../footer/footer.jsx'
import CarruselChips from '../components/CarruselChips.jsx'
import useSeguidos from '../hooks/useSeguidos.js'
import { iniciales, fechaLarga, precio } from '../utils/formato.js'
import { formatearUbicacionCorta } from '../utils/mapUtils.js'
import { haPasadoFecha } from '../utils/dateUtils.js'
import '../pruebas/PruebasView.css'
import '../mostrarClubes/ClubesView.css'


// Lista de deportes para el filtro (misma que PaginaEntrenamientos)
const DEPORTES = ['Fútbol', 'Basket', 'Tenis', 'Voley', 'Pádel', 'Rugby', 'Hockey', 'Natación', 'Atletismo', 'Ciclismo', 'Boxeo', 'Artes Marciales', 'Handball', 'Béisbol', 'Golf']

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
)

const nombreCompleto = (e) => [e.nombre, e.apellido].filter(Boolean).join(' ')
const notaTexto = (n) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })


function EntrenadoresView({ usuario }) {
  const navigate = useNavigate()
  const [entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Datos reales extra: entrenamientos publicados y reseñas por entrenador
  const [entrenamientosPorCoach, setEntrenamientosPorCoach] = useState({})
  const [resenias, setResenias] = useState({}) // identrenador → { promedio, total }

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')

  // Seguir
  const seguidosIniciales = useSeguidos(usuario)
  const [cambiosSeguir, setCambiosSeguir] = useState({}) // idusuario → true/false tras seguir/dejar
  const [siguiendoCargando, setSiguiendoCargando] = useState(null)
  const seguidos = useMemo(() => {
    const set = new Set(seguidosIniciales)
    Object.entries(cambiosSeguir).forEach(([id, sigue]) => (sigue ? set.add(Number(id)) : set.delete(Number(id))))
    return set
  }, [seguidosIniciales, cambiosSeguir])

  // Detalle y contacto
  const [seleccionado, setSeleccionado] = useState(null)
  const [popupContacto, setPopupContacto] = useState(null)
  const [mensajeContacto, setMensajeContacto] = useState('')
  const [enviandoContacto, setEnviandoContacto] = useState(false)
  const [errorContacto, setErrorContacto] = useState('')
  const [toastContacto, setToastContacto] = useState(null)


  useEffect(() => {
    async function obtenerEntrenadores() {
      try {
        const response = await api.get('/api/entrenadores')
        const lista = Array.isArray(response.data) ? response.data : []
        setEntrenadores(lista)

        // Reseñas en segundo plano (si falla alguna, esa tarjeta no muestra nota)
        Promise.allSettled(lista.map((e) => api.get(`/api/resenias/entrenador/${e.identrenador}`)))
          .then((resultados) => {
            const mapa = {}
            resultados.forEach((r, i) => {
              const d = r.status === 'fulfilled' ? r.value.data : null
              if (d && Number(d.totalResenias) > 0) {
                mapa[lista[i].identrenador] = { promedio: Number(d.promedio), total: Number(d.totalResenias) }
              }
            })
            setResenias(mapa)
          })
      } catch (err) {
        console.error(err)
        setError('No pudimos cargar los entrenadores. Probá de nuevo en un rato.')
      } finally {
        setLoading(false)
      }
    }
    obtenerEntrenadores()

    api.get('/api/entrenamientos', { params: { limit: 200 } })
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : (res.data?.items || [])
        const mapa = {}
        items
          .filter((e) => !haPasadoFecha(e.fechaentr, e.horafin))
          .forEach((e) => {
            const id = Number(e.identrenador)
            if (!id) return
            ;(mapa[id] ||= []).push(e)
          })
        setEntrenamientosPorCoach(mapa)
      })
      .catch(() => {})
  }, [])

  // Bloquea el scroll de fondo y cierra con Escape mientras hay un modal abierto
  useEffect(() => {
    if (!seleccionado && !popupContacto) return
    const overflowOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (e) => {
      if (e.key !== 'Escape') return
      if (popupContacto) setPopupContacto(null)
      else setSeleccionado(null)
    }
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = overflowOriginal
      window.removeEventListener('keydown', alPresionar)
    }
  }, [seleccionado, popupContacto])


  const conDeportes = entrenadores.filter((e) => e.deportes && e.deportes.length > 0)

  const deportesPresentes = useMemo(() => {
    const set = new Set()
    entrenadores.forEach((e) => (e.deportes || []).forEach((d) => d?.deporte && set.add(d.deporte)))
    return [...set].sort()
  }, [entrenadores])

  const texto = busqueda.trim().toLowerCase()
  const entrenadoresFiltrados = conDeportes
    .filter((e) => {
      const coincideBusqueda = !texto ||
        nombreCompleto(e).toLowerCase().includes(texto) ||
        e.titulo?.toLowerCase().includes(texto) ||
        e.ubicacion?.toLowerCase().includes(texto) ||
        e.deportes?.some((d) => d.deporte?.toLowerCase().includes(texto))
      const coincideDeporte = !filtroDeporte || e.deportes?.some((d) => d.deporte === filtroDeporte)
      const coincideUbicacion = !filtroUbicacion || e.ubicacion?.toLowerCase().includes(filtroUbicacion.trim().toLowerCase())
      return coincideBusqueda && coincideDeporte && coincideUbicacion
    })
    // Seguidos primero, después los que tienen entrenamientos publicados, después por nota
    .sort((a, b) =>
      (Number(seguidos.has(Number(b.idusuario))) - Number(seguidos.has(Number(a.idusuario)))) ||
      ((entrenamientosPorCoach[b.identrenador]?.length || 0) - (entrenamientosPorCoach[a.identrenador]?.length || 0)) ||
      ((resenias[b.identrenador]?.promedio || 0) - (resenias[a.identrenador]?.promedio || 0))
    )

  const hayFiltros = !!(busqueda || filtroDeporte || filtroUbicacion)

  const restablecerFiltros = () => {
    setBusqueda('')
    setFiltroDeporte('')
    setFiltroUbicacion('')
  }

  const puedeSeguir = (e) => !!usuario?.idusuario && Number(e.idusuario) !== Number(usuario.idusuario)

  const alternarSeguir = async (e) => {
    if (!usuario) { navigate('/login'); return }
    const id = Number(e.idusuario)
    const sigue = seguidos.has(id)
    setSiguiendoCargando(id)
    try {
      const { data } = sigue
        ? await api.delete(`/api/seguidores/${id}`)
        : await api.post(`/api/seguidores/${id}`)
      const ahora = typeof data?.siguiendo === 'boolean' ? data.siguiendo : !sigue
      setCambiosSeguir((prev) => ({ ...prev, [id]: ahora }))
    } catch (err) {
      console.error('No se pudo actualizar el seguimiento:', err)
    } finally {
      setSiguiendoCargando(null)
    }
  }

  // Botón Contactar: abre el popup para escribir el mensaje inicial
  const handleContactar = (entrenador) => {
    if (!usuario) {
      navigate('/login')
      return
    }
    setMensajeContacto('')
    setErrorContacto('')
    setToastContacto(null)
    setPopupContacto({ entrenador })
  }

  const handleEnviarContacto = async () => {
    if (!mensajeContacto.trim() || !popupContacto) return
    setEnviandoContacto(true)
    setErrorContacto('')
    try {
      // 1. Crear o recuperar la conversación privada
      const { data: conversacion } = await api.post('/api/conversaciones/privada', {
        idusuarioReceptor: popupContacto.entrenador.idusuario
      })
      // 2. Enviar el primer mensaje
      await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, {
        contenido: mensajeContacto.trim()
      })
      const nombre = nombreCompleto(popupContacto.entrenador)
      setPopupContacto(null)
      setMensajeContacto('')
      setToastContacto({ nombre, conversacion })
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      setErrorContacto('No se pudo enviar el mensaje. Probá de nuevo.')
    } finally {
      setEnviandoContacto(false)
    }
  }

  const renderAvatar = (e, grande = false) => (
    <span className={`pr-avatar${grande ? ' pr-avatar--lg' : ''}`} aria-hidden="true">
      {e.fotoperfil ? <img src={e.fotoperfil} alt="" /> : iniciales(nombreCompleto(e))}
    </span>
  )

  const renderBotonSeguir = (e) => {
    if (!puedeSeguir(e)) return null
    const sigue = seguidos.has(Number(e.idusuario))
    return (
      <button
        className={`pr-btn pr-btn--ghost cl-follow${sigue ? ' is-on' : ''}`}
        onClick={() => alternarSeguir(e)}
        disabled={siguiendoCargando === Number(e.idusuario)}
        aria-pressed={sigue}
      >
        {sigue ? 'Siguiendo' : 'Seguir'}
      </button>
    )
  }

  const subtitulo = (e) =>
    e.titulo || formatearUbicacionCorta(e.ubicacion) || 'Entrenador'

  const entrenamientosDelSeleccionado = seleccionado ? (entrenamientosPorCoach[seleccionado.identrenador] || []) : []
  const reseniaSeleccionado = seleccionado ? resenias[seleccionado.identrenador] : null


  return (
    <div className="pr">
      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid">
          <div>
            <h1 className="pr-display pr-title">Entrenadores</h1>
            <p className="pr-lead">
              Profesionales de cada disciplina, con sus entrenamientos publicados y las reseñas
              de sus alumnos. Seguilos o escribiles directo.
            </p>
          </div>
          <div className="pr-head-side">
            <label className="pr-search">
              <span className="pr-sr">Buscar entrenadores</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre, especialidad o zona"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      {/* ── Filtros ── */}
      <section className="pr-filters" aria-label="Filtros">
        <div className="pr-wrap">
          <CarruselChips ariaLabel="Deporte" deps={[entrenadores.length]}>
            <button className={`pr-chip${filtroDeporte === '' ? ' is-on' : ''}`} aria-pressed={filtroDeporte === ''} onClick={() => setFiltroDeporte('')}>
              Todos
            </button>
            {(deportesPresentes.length ? deportesPresentes : DEPORTES).map((d) => (
              <button key={d} className={`pr-chip${filtroDeporte === d ? ' is-on' : ''}`} aria-pressed={filtroDeporte === d} onClick={() => setFiltroDeporte(d)}>
                {d}
              </button>
            ))}
          </CarruselChips>

          <div className="pr-fields">
            <label className="pr-field">
              <span>Ubicación</span>
              <input type="text" placeholder="Ej. Palermo" value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} />
            </label>
            {hayFiltros && (
              <button className="pr-link pr-clear" onClick={restablecerFiltros}>Limpiar filtros</button>
            )}
          </div>
        </div>
      </section>

      {/* ── Resultados ── */}
      <section className="pr-results">
        <div className="pr-wrap">
          {!loading && !error && entrenadoresFiltrados.length > 0 && (
            <p className="pr-count">
              {entrenadoresFiltrados.length} {entrenadoresFiltrados.length === 1 ? 'entrenador' : 'entrenadores'}
              {seguidos.size > 0 ? ' · los que seguís aparecen primero' : ''}
            </p>
          )}

          {loading ? (
            <div className="pr-grid" aria-busy="true" aria-label="Cargando entrenadores">
              {[0, 1, 2].map((i) => <div key={i} className="pr-card pr-card--skeleton cl-skeleton" />)}
            </div>
          ) : error ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No pudimos cargar los entrenadores</h2>
              <p>{error}</p>
              <button className="pr-btn pr-btn--ink" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : entrenadoresFiltrados.length === 0 ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No hay entrenadores con estos filtros</h2>
              <p>Probá con otro deporte o una zona más amplia.</p>
              <button className="pr-btn pr-btn--ink" onClick={restablecerFiltros}>Limpiar filtros</button>
            </div>
          ) : (
            <ul className="pr-grid">
              {entrenadoresFiltrados.map((e) => {
                const deportes = (e.deportes || []).map((d) => d.deporte).filter(Boolean)
                const nEntr = entrenamientosPorCoach[e.identrenador]?.length || 0
                const r = resenias[e.identrenador]
                const sigue = seguidos.has(Number(e.idusuario))
                return (
                  <li key={e.identrenador} className="pr-card">
                    <div className="pr-card-head cl-card-head">
                      {renderAvatar(e)}
                      <div className="pr-card-id">
                        <h3>{nombreCompleto(e)}</h3>
                        <p>{subtitulo(e)}</p>
                      </div>
                    </div>

                    {(r || nEntr > 0 || sigue || e.tieneclub) && (
                      <div className="pr-tags">
                        {r && <span className="cl-tag-rate">★ {notaTexto(r.promedio)} · {r.total} {r.total === 1 ? 'reseña' : 'reseñas'}</span>}
                        {nEntr > 0 && <span className="cl-tag-live">{nEntr} {nEntr === 1 ? 'entrenamiento' : 'entrenamientos'}</span>}
                        {e.tieneclub && <span>Trabaja con un club</span>}
                        {sigue && <span>Lo seguís</span>}
                      </div>
                    )}

                    {deportes.length > 0 && (
                      <div className="cl-sports" aria-label="Deportes">
                        {deportes.slice(0, 4).map((d) => <span key={d}>{d}</span>)}
                        {deportes.length > 4 && <span>+{deportes.length - 4}</span>}
                      </div>
                    )}

                    {(e.ubicacion || e.experiencia) && (
                      <dl className="pr-facts">
                        {e.ubicacion && (
                          <div><dt>Zona</dt><dd>{formatearUbicacionCorta(e.ubicacion) || e.ubicacion}</dd></div>
                        )}
                        {e.experiencia && (
                          <div><dt>Experiencia</dt><dd>{e.experiencia}</dd></div>
                        )}
                      </dl>
                    )}

                    <div className="pr-card-foot cl-card-foot">
                      <button className="pr-btn pr-btn--ink" onClick={() => setSeleccionado(e)}>
                        Ver entrenador
                      </button>
                      {renderBotonSeguir(e)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Detalle del entrenador ── */}
      {seleccionado && createPortal(
        <div className="pr-overlay" onClick={() => setSeleccionado(null)}>
          <div className="pr-modal" role="dialog" aria-modal="true" aria-labelledby="en-detalle-titulo" onClick={(ev) => ev.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head">
              {renderAvatar(seleccionado, true)}
              <div className="pr-card-id">
                <h2 id="en-detalle-titulo" className="pr-modal-title">{nombreCompleto(seleccionado)}</h2>
                <p>{subtitulo(seleccionado)}</p>
              </div>
              <button className="pr-close" onClick={() => setSeleccionado(null)} aria-label="Cerrar">×</button>
            </header>

            <div className="pr-modal-body">
              <dl className="pr-facts">
                <div>
                  <dt>Deportes</dt>
                  <dd>{(seleccionado.deportes || []).map((d) => d.deporte).filter(Boolean).join(', ') || 'A confirmar'}</dd>
                </div>
                <div><dt>Zona</dt><dd>{formatearUbicacionCorta(seleccionado.ubicacion) || seleccionado.ubicacion || 'A confirmar'}</dd></div>
                {seleccionado.experiencia && <div><dt>Experiencia</dt><dd>{seleccionado.experiencia}</dd></div>}
                <div>
                  <dt>Reseñas</dt>
                  <dd>
                    {reseniaSeleccionado
                      ? `★ ${notaTexto(reseniaSeleccionado.promedio)} · ${reseniaSeleccionado.total} ${reseniaSeleccionado.total === 1 ? 'reseña' : 'reseñas'}`
                      : 'Todavía sin reseñas'}
                  </dd>
                </div>
              </dl>

              {seleccionado.descripcion && (
                <div className="pr-block">
                  <h3>Sobre {seleccionado.nombre}</h3>
                  <p className="pr-desc">{seleccionado.descripcion}</p>
                </div>
              )}

              <div className="pr-block">
                <h3>Entrenamientos publicados</h3>
                {entrenamientosDelSeleccionado.length === 0 ? (
                  <p className="pr-muted">No tiene entrenamientos publicados en este momento.</p>
                ) : (
                  <ul className="cl-pruebas">
                    {entrenamientosDelSeleccionado.map((ent) => {
                      const id = ent.identrenamientos ?? ent.id
                      return (
                        <li key={id}>
                          <button onClick={() => { setSeleccionado(null); navigate(`/entrenamientos/${id}`) }}>
                            <span>
                              <strong>{ent.titulo || `Entrenamiento de ${(ent.deportes?.deporte || '').toLowerCase()}`}</strong>
                              <span>
                                {fechaLarga(ent.fechaentr, ent.horainicio, ent.horafin)}
                                {precio(ent.precio) ? ` · ${precio(ent.precio)}` : ''}
                              </span>
                            </span>
                            <Flecha />
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {seleccionado.cv && (
                <a className="pr-link" href={seleccionado.cv} target="_blank" rel="noopener noreferrer">
                  Ver CV <Flecha />
                </a>
              )}
            </div>

            <footer className="pr-modal-foot">
              <button
                className="pr-btn pr-btn--ghost"
                onClick={() => {
                  const id = seleccionado.idusuario
                  setSeleccionado(null)
                  navigate(`/perfil/${id}`)
                }}
              >
                Ver perfil
              </button>
              {renderBotonSeguir(seleccionado)}
              <button className="pr-btn" onClick={() => handleContactar(seleccionado)}>
                Contactar <Flecha />
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}

      {/* ── Contactar ── */}
      {popupContacto && createPortal(
        <div className="pr-overlay cl-overlay-top" onClick={() => !enviandoContacto && setPopupContacto(null)}>
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="en-contacto-titulo" onClick={(ev) => ev.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head--simple">
              <h2 id="en-contacto-titulo" className="pr-modal-title">Escribirle a {nombreCompleto(popupContacto.entrenador)}</h2>
              <button className="pr-close" onClick={() => setPopupContacto(null)} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              <label className="cl-message">
                <span>Tu mensaje le llega directo a su bandeja.</span>
                <textarea
                  placeholder={`Hola ${popupContacto.entrenador.nombre || ''}, me interesa…`}
                  value={mensajeContacto}
                  onChange={(ev) => setMensajeContacto(ev.target.value)}
                  rows={5}
                  autoFocus
                  maxLength={500}
                  onKeyDown={(ev) => { if (ev.key === 'Enter' && ev.ctrlKey) handleEnviarContacto() }}
                />
                <small>{mensajeContacto.length}/500 · Ctrl + Enter para enviar</small>
              </label>
              {errorContacto && <p className="pr-error">{errorContacto}</p>}
            </div>
            <footer className="pr-modal-foot">
              <button className="pr-btn pr-btn--ghost" onClick={() => setPopupContacto(null)} disabled={enviandoContacto}>Cancelar</button>
              <button className="pr-btn" onClick={handleEnviarContacto} disabled={!mensajeContacto.trim() || enviandoContacto}>
                {enviandoContacto ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </footer>
          </div>
        </div>,
        document.body
      )}

      {/* ── Mensaje enviado ── */}
      {toastContacto && createPortal(
        <div className="pr-toast" role="status">
          <div>
            <p className="pr-toast-titulo">Mensaje enviado a {toastContacto.nombre}</p>
            <p className="pr-toast-texto">Seguí la conversación desde tus mensajes.</p>
          </div>
          <button
            className="pr-btn"
            onClick={() => {
              const conversacion = toastContacto.conversacion
              setToastContacto(null)
              navigate('/mensajes', { state: { conversacionInicial: conversacion } })
            }}
          >
            Ir al chat
          </button>
        </div>,
        document.body
      )}
    </div>
  )
}


export default EntrenadoresView
