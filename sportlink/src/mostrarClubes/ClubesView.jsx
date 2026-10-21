import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import Footer from '../footer/footer.jsx'
import CarruselChips from '../components/CarruselChips.jsx'
import MapaUbicacionDark from '../components/maps/MapaUbicacionDark.jsx'
import useSeguidos from '../hooks/useSeguidos.js'
import { iniciales, fechaLarga } from '../utils/formato.js'
import { formatearUbicacionCorta } from '../utils/mapUtils.js'
import { haPasadoFecha } from '../utils/dateUtils.js'
import '../pruebas/PruebasView.css'
import './ClubesView.css'


// Misma lista de deportes usada en Entrenamientos y Entrenadores
const DEPORTES = ['Fútbol', 'Basket', 'Tenis', 'Voley', 'Pádel', 'Rugby', 'Hockey', 'Natación', 'Atletismo', 'Ciclismo', 'Boxeo', 'Artes Marciales', 'Handball', 'Béisbol', 'Golf']

const Flecha = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="square" />
  </svg>
)

const tieneCoordenadas = (lat, lon) =>
  lat !== null && lat !== undefined && lat !== '' && !isNaN(Number(lat)) &&
  lon !== null && lon !== undefined && lon !== '' && !isNaN(Number(lon)) &&
  (Number(lat) !== 0 || Number(lon) !== 0)


function ClubesView({ usuario }) {
  const navigate = useNavigate()
  const [clubes, setClubes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Pruebas abiertas por club (dato real de /api/pruebas; si falla, no se muestra)
  const [pruebasPorClub, setPruebasPorClub] = useState({})

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')

  // Seguir clubes
  const seguidosIniciales = useSeguidos(usuario)
  const [cambiosSeguir, setCambiosSeguir] = useState({}) // idusuario → true/false tras seguir/dejar
  const [siguiendoCargando, setSiguiendoCargando] = useState(null)
  const seguidos = useMemo(() => {
    const set = new Set(seguidosIniciales)
    Object.entries(cambiosSeguir).forEach(([id, sigue]) => (sigue ? set.add(Number(id)) : set.delete(Number(id))))
    return set
  }, [seguidosIniciales, cambiosSeguir])

  // Detalle
  const [clubSeleccionado, setClubSeleccionado] = useState(null)

  // Contacto
  const [popupContacto, setPopupContacto] = useState(null)
  const [mensajeContacto, setMensajeContacto] = useState('')
  const [enviandoContacto, setEnviandoContacto] = useState(false)
  const [errorContacto, setErrorContacto] = useState('')
  const [toastContacto, setToastContacto] = useState(null)


  useEffect(() => {
    async function obtenerClubes() {
      try {
        const response = await api.get('/api/clubes')
        setClubes(Array.isArray(response.data) ? response.data : [])
      } catch (err) {
        console.error(err)
        setError('No pudimos cargar los clubes. Probá de nuevo en un rato.')
      } finally {
        setLoading(false)
      }
    }
    obtenerClubes()

    api.get('/api/pruebas')
      .then((res) => {
        const mapa = {}
        ;(Array.isArray(res.data) ? res.data : [])
          .filter((p) => !haPasadoFecha(p.fechaprueba, p.horafin))
          .forEach((p) => {
            const id = Number(p.club?.idclub ?? p.idclub)
            if (!id) return
            ;(mapa[id] ||= []).push(p)
          })
        setPruebasPorClub(mapa)
      })
      .catch(() => {})
  }, [])

  // Bloquea el scroll de fondo y cierra con Escape mientras hay un modal abierto
  useEffect(() => {
    if (!clubSeleccionado && !popupContacto) return
    const overflowOriginal = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alPresionar = (e) => {
      if (e.key !== 'Escape') return
      if (popupContacto) setPopupContacto(null)
      else setClubSeleccionado(null)
    }
    window.addEventListener('keydown', alPresionar)
    return () => {
      document.body.style.overflow = overflowOriginal
      window.removeEventListener('keydown', alPresionar)
    }
  }, [clubSeleccionado, popupContacto])


  // Deportes presentes en los clubes (para los chips)
  const deportesEnClubes = useMemo(() => {
    const set = new Set()
    clubes.forEach((c) => (c.deportes || []).forEach((d) => d?.deporte && set.add(d.deporte)))
    return [...set].sort()
  }, [clubes])

  const texto = busqueda.trim().toLowerCase()
  const clubesFiltrados = clubes
    .filter((c) => {
      const coincideBusqueda = !texto ||
        c.nombre?.toLowerCase().includes(texto) ||
        c.ubicacion?.toLowerCase().includes(texto) ||
        c.deportes?.some((d) => d.deporte?.toLowerCase().includes(texto))
      const coincideDeporte = !filtroDeporte || c.deportes?.some((d) => d.deporte === filtroDeporte)
      const coincideUbicacion = !filtroUbicacion ||
        [c.ubicacion, c.direccion].some((v) => v?.toLowerCase().includes(filtroUbicacion.trim().toLowerCase()))
      return coincideBusqueda && coincideDeporte && coincideUbicacion
    })
    // Los clubes que seguís primero, después los que tienen pruebas abiertas
    .sort((a, b) =>
      (Number(seguidos.has(Number(b.idusuario))) - Number(seguidos.has(Number(a.idusuario)))) ||
      ((pruebasPorClub[b.idclub]?.length || 0) - (pruebasPorClub[a.idclub]?.length || 0))
    )

  const hayFiltros = !!(busqueda || filtroDeporte || filtroUbicacion)

  const restablecerFiltros = () => {
    setBusqueda('')
    setFiltroDeporte('')
    setFiltroUbicacion('')
  }

  const puedeSeguir = (club) =>
    !!usuario?.idusuario && Number(club.idusuario) !== Number(usuario.idusuario)

  const alternarSeguir = async (club) => {
    if (!usuario) { navigate('/login'); return }
    const id = Number(club.idusuario)
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
  const handleContactar = (club) => {
    if (!usuario) {
      navigate('/login')
      return
    }
    setMensajeContacto('')
    setErrorContacto('')
    setToastContacto(null)
    setPopupContacto({ club })
  }

  const handleEnviarContacto = async () => {
    if (!mensajeContacto.trim() || !popupContacto) return
    setEnviandoContacto(true)
    setErrorContacto('')
    try {
      // 1. Crear o recuperar la conversación privada
      const { data: conversacion } = await api.post('/api/conversaciones/privada', {
        idusuarioReceptor: popupContacto.club.idusuario
      })
      // 2. Enviar el primer mensaje
      await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, {
        contenido: mensajeContacto.trim()
      })
      const nombre = popupContacto.club.nombre
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

  const renderAvatar = (club, grande = false) => (
    <span className={`pr-avatar${grande ? ' pr-avatar--lg' : ''}`} aria-hidden="true">
      {club.fotoperfil ? <img src={club.fotoperfil} alt="" /> : iniciales(club.nombre)}
    </span>
  )

  const renderBotonSeguir = (club, bloque = false) => {
    if (!puedeSeguir(club)) return null
    const sigue = seguidos.has(Number(club.idusuario))
    return (
      <button
        className={`pr-btn pr-btn--ghost cl-follow${sigue ? ' is-on' : ''}${bloque ? ' pr-btn--block' : ''}`}
        onClick={() => alternarSeguir(club)}
        disabled={siguiendoCargando === Number(club.idusuario)}
        aria-pressed={sigue}
      >
        {sigue ? 'Siguiendo' : 'Seguir'}
      </button>
    )
  }

  const pruebasDelClub = clubSeleccionado ? (pruebasPorClub[clubSeleccionado.idclub] || []) : []


  return (
    <div className="pr">
      {/* ── Encabezado ── */}
      <section className="pr-head">
        <div className="pr-wrap pr-head-grid">
          <div>
            <h1 className="pr-display pr-title">Clubes</h1>
            <p className="pr-lead">
              Instituciones que forman parte de SportLink. Seguilas para ver primero sus pruebas
              y escribiles directo desde acá.
            </p>
          </div>
          <div className="pr-head-side">
            <label className="pr-search">
              <span className="pr-sr">Buscar clubes</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="square" />
              </svg>
              <input
                type="search"
                placeholder="Buscar por nombre, deporte o zona"
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
          <CarruselChips ariaLabel="Deporte" deps={[clubes.length]}>
            <button className={`pr-chip${filtroDeporte === '' ? ' is-on' : ''}`} aria-pressed={filtroDeporte === ''} onClick={() => setFiltroDeporte('')}>
              Todos
            </button>
            {(deportesEnClubes.length ? deportesEnClubes : DEPORTES).map((d) => (
              <button key={d} className={`pr-chip${filtroDeporte === d ? ' is-on' : ''}`} aria-pressed={filtroDeporte === d} onClick={() => setFiltroDeporte(d)}>
                {d}
              </button>
            ))}
          </CarruselChips>

          <div className="pr-fields">
            <label className="pr-field">
              <span>Ubicación</span>
              <input type="text" placeholder="Ej. Villa Crespo" value={filtroUbicacion} onChange={(e) => setFiltroUbicacion(e.target.value)} />
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
          {!loading && !error && clubesFiltrados.length > 0 && (
            <p className="pr-count">
              {clubesFiltrados.length} {clubesFiltrados.length === 1 ? 'club' : 'clubes'}
              {seguidos.size > 0 ? ' · los que seguís aparecen primero' : ''}
            </p>
          )}

          {loading ? (
            <div className="pr-grid" aria-busy="true" aria-label="Cargando clubes">
              {[0, 1, 2].map((i) => <div key={i} className="pr-card pr-card--skeleton cl-skeleton" />)}
            </div>
          ) : error ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No pudimos cargar los clubes</h2>
              <p>{error}</p>
              <button className="pr-btn pr-btn--ink" onClick={() => window.location.reload()}>Reintentar</button>
            </div>
          ) : clubesFiltrados.length === 0 ? (
            <div className="pr-empty">
              <h2 className="pr-display pr-empty-title">No hay clubes con estos filtros</h2>
              <p>Probá con otro deporte o una zona más amplia.</p>
              <button className="pr-btn pr-btn--ink" onClick={restablecerFiltros}>Limpiar filtros</button>
            </div>
          ) : (
            <ul className="pr-grid">
              {clubesFiltrados.map((club) => {
                const deportes = (club.deportes || []).map((d) => d.deporte).filter(Boolean)
                const nPruebas = pruebasPorClub[club.idclub]?.length || 0
                const sigue = seguidos.has(Number(club.idusuario))
                return (
                  <li key={club.idclub} className="pr-card">
                    <div className="pr-card-head cl-card-head">
                      {renderAvatar(club)}
                      <div className="pr-card-id">
                        <h3>{club.nombre}</h3>
                        <p>{formatearUbicacionCorta(club.ubicacion || club.direccion) || 'Ubicación a confirmar'}</p>
                      </div>
                    </div>

                    {(nPruebas > 0 || sigue) && (
                      <div className="pr-tags">
                        {nPruebas > 0 && (
                          <span className="cl-tag-live">
                            {nPruebas} {nPruebas === 1 ? 'prueba abierta' : 'pruebas abiertas'}
                          </span>
                        )}
                        {sigue && <span>Lo seguís</span>}
                      </div>
                    )}

                    {deportes.length > 0 && (
                      <div className="cl-sports" aria-label="Deportes">
                        {deportes.slice(0, 4).map((d) => <span key={d}>{d}</span>)}
                        {deportes.length > 4 && <span>+{deportes.length - 4}</span>}
                      </div>
                    )}

                    {club.descripcion && <p className="cl-desc">{club.descripcion}</p>}

                    <div className="pr-card-foot cl-card-foot">
                      <button className="pr-btn pr-btn--ink" onClick={() => setClubSeleccionado(club)}>
                        Ver club
                      </button>
                      {renderBotonSeguir(club)}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <Footer />

      {/* ── Detalle del club ── */}
      {clubSeleccionado && createPortal(
        <div className="pr-overlay" onClick={() => setClubSeleccionado(null)}>
          <div className="pr-modal" role="dialog" aria-modal="true" aria-labelledby="cl-detalle-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head">
              {renderAvatar(clubSeleccionado, true)}
              <div className="pr-card-id">
                <h2 id="cl-detalle-titulo" className="pr-modal-title">{clubSeleccionado.nombre}</h2>
                <p>{formatearUbicacionCorta(clubSeleccionado.ubicacion || clubSeleccionado.direccion) || 'Ubicación a confirmar'}</p>
              </div>
              <button className="pr-close" onClick={() => setClubSeleccionado(null)} aria-label="Cerrar">×</button>
            </header>

            <div className="pr-modal-body">
              {(clubSeleccionado.deportes || []).length > 0 && (
                <div className="pr-block">
                  <h3>Deportes</h3>
                  <div className="cl-sports">
                    {clubSeleccionado.deportes.map((d) => d?.deporte && <span key={d.deporte}>{d.deporte}</span>)}
                  </div>
                </div>
              )}

              {clubSeleccionado.descripcion && (
                <div className="pr-block">
                  <h3>Acerca del club</h3>
                  <p className="pr-desc">{clubSeleccionado.descripcion}</p>
                </div>
              )}

              {clubSeleccionado.historia && (
                <div className="pr-block">
                  <h3>Historia</h3>
                  <p className="pr-desc">{clubSeleccionado.historia}</p>
                </div>
              )}

              {Array.isArray(clubSeleccionado.premios) && clubSeleccionado.premios.length > 0 && (
                <div className="pr-block">
                  <h3>Premios y palmarés</h3>
                  <ul className="cl-list">
                    {clubSeleccionado.premios.map((p, i) => <li key={i}>{p}</li>)}
                  </ul>
                </div>
              )}

              <div className="pr-block">
                <h3>Pruebas abiertas</h3>
                {pruebasDelClub.length === 0 ? (
                  <p className="pr-muted">Este club no tiene pruebas abiertas en este momento.</p>
                ) : (
                  <ul className="cl-pruebas">
                    {pruebasDelClub.map((p) => (
                      <li key={p.idprueba}>
                        <button onClick={() => { setClubSeleccionado(null); navigate(`/pruebas/${p.idprueba}`) }}>
                          <span>
                            <strong>Prueba de {(p.deporte?.deporte || 'jugadores').toLowerCase()}{p.categoria ? ` · ${p.categoria}` : ''}</strong>
                            <span>{fechaLarga(p.fechaprueba, p.horainicio)}</span>
                          </span>
                          <Flecha />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {tieneCoordenadas(clubSeleccionado.latitud, clubSeleccionado.longitud) && (
                <div className="pr-block">
                  <h3>Sede</h3>
                  <MapaUbicacionDark
                    latitud={Number(clubSeleccionado.latitud)}
                    longitud={Number(clubSeleccionado.longitud)}
                    direccion={clubSeleccionado.direccion || clubSeleccionado.ubicacion || ''}
                    zona={formatearUbicacionCorta(clubSeleccionado.ubicacion || clubSeleccionado.direccion || '')}
                    nombre={clubSeleccionado.nombre}
                    tipo="club"
                    esEditable={false}
                    height="200px"
                  />
                  <a
                    className="pr-link pr-maps"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${Number(clubSeleccionado.latitud)},${Number(clubSeleccionado.longitud)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cómo llegar en Google Maps <Flecha />
                  </a>
                </div>
              )}
            </div>

            <footer className="pr-modal-foot">
              <button
                className="pr-btn pr-btn--ghost"
                onClick={() => {
                  const id = clubSeleccionado.idusuario
                  setClubSeleccionado(null)
                  navigate(`/perfil/${id}`)
                }}
              >
                Ver perfil
              </button>
              {renderBotonSeguir(clubSeleccionado)}
              <button className="pr-btn" onClick={() => handleContactar(clubSeleccionado)}>
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
          <div className="pr-modal pr-modal--sm" role="dialog" aria-modal="true" aria-labelledby="cl-contacto-titulo" onClick={(e) => e.stopPropagation()}>
            <header className="pr-modal-head cl-modal-head--simple">
              <h2 id="cl-contacto-titulo" className="pr-modal-title">Escribirle a {popupContacto.club.nombre}</h2>
              <button className="pr-close" onClick={() => setPopupContacto(null)} aria-label="Cerrar">×</button>
            </header>
            <div className="pr-modal-body">
              <label className="cl-message">
                <span>Tu mensaje le llega directo a su bandeja.</span>
                <textarea
                  placeholder="Hola, me interesa…"
                  value={mensajeContacto}
                  onChange={(e) => setMensajeContacto(e.target.value)}
                  rows={5}
                  autoFocus
                  maxLength={500}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleEnviarContacto() }}
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


export default ClubesView
