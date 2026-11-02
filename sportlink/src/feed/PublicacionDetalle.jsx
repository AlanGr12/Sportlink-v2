import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar.jsx'
import { TarjetaEvento } from '../components/EventoAdjunto.jsx'
import UserHoverCard from '../components/UserHoverCard.jsx'
import { tiempoRelativo, fechaCompleta } from '../utils/dateUtils.js'
import { FdAvatar, VisorImagen, IcoResponder, IcoRepublicar, IcoLike, IcoEnlace, IcoPuntos } from './Publicacion.jsx'
import { ColumnaYo, ColumnaSeguir } from './Laterales.jsx'
import { ROLES, fechaDePost } from './feedUtils.js'
import '../pruebas/PruebasView.css'
import './Feed.css'

// Detalle de una publicación con el diseño nuevo (clases fd-*, ver Feed.css).

const TIPOS = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', EMPLEO: 'Empleo' }
const MAX_RESPUESTA = 500

const esVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url || '')
const IcoVolver = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

// ─── Seguir / dejar de seguir al autor (clubes y entrenadores) ───
function SeguirAutor({ autor, usuario }) {
  const [siguiendo, setSiguiendo] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const puedeSeguir = !!usuario?.idusuario && !!autor?.idusuario &&
    Number(autor.idusuario) !== Number(usuario.idusuario) &&
    ['club', 'entrenador'].includes(String(autor.tipousuario || '').toLowerCase())

  useEffect(() => {
    if (!puedeSeguir) return
    let vivo = true
    api.get(`/api/seguidores/${autor.idusuario}`)
      .then((res) => { if (vivo) setSiguiendo(res.data?.siguiendo === true) })
      .catch(() => {})
    return () => { vivo = false }
  }, [autor?.idusuario, puedeSeguir])

  if (!puedeSeguir) return null

  const alternar = async () => {
    setCargando(true)
    setError('')
    try {
      const { data } = siguiendo
        ? await api.delete(`/api/seguidores/${autor.idusuario}`)
        : await api.post(`/api/seguidores/${autor.idusuario}`)
      setSiguiendo(data.siguiendo === true)
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo completar la acción.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <span className="fd-seguir-wrap">
      <button type="button" className={`pr-btn pr-btn--ghost pr-btn--sm fd-seguir${siguiendo ? ' is-on' : ''}`} onClick={alternar} disabled={cargando} aria-pressed={siguiendo}>
        {siguiendo ? 'Siguiendo' : 'Seguir'}
      </button>
      {error && <small className="fd-seguir-error">{error}</small>}
    </span>
  )
}

// ─── Menú de opciones (eliminar) ───
function MenuOpciones({ etiqueta, onEliminar }) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!abierto) return
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [abierto])

  return (
    <div className="fd-menu" ref={ref}>
      <button type="button" className="fd-icono" onClick={() => setAbierto((v) => !v)} aria-label="Opciones" aria-expanded={abierto}>
        <IcoPuntos />
      </button>
      {abierto && (
        <div className="fd-menu-lista" role="menu">
          <button type="button" role="menuitem" className="fd-menu-item fd-menu-item--peligro" onClick={() => { setAbierto(false); onEliminar() }}>
            {etiqueta}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Post del que viene la respuesta (contexto del hilo) ───
function PostPadre({ post, onClick }) {
  return (
    <article className="fd-post fd-padre" onClick={onClick}>
      <div className="fd-hilo-col">
        <FdAvatar persona={post.autor} size={44} />
        <i className="fd-hilo-linea" />
      </div>
      <div className="fd-post-body">
        <p className="fd-meta">
          <strong>{post.autor?.nombre || 'Usuario'}</strong>
          <span>· {tiempoRelativo(fechaDePost(post))}</span>
        </p>
        {post.contenido && <p className="fd-texto fd-padre-texto">{post.contenido}</p>}
        {post.imagen && !esVideo(post.imagen) && (
          <div className="fd-media"><img src={post.imagen} alt="" loading="lazy" /></div>
        )}
      </div>
    </article>
  )
}

// ─── Una respuesta ───
function Respuesta({ comentario, usuario, autorPost, onEliminar, onAviso }) {
  const navigate = useNavigate()
  // Los "me gusta" de las respuestas son locales (el backend no los guarda)
  const [liked, setLiked] = useState(false)
  const miId = usuario?.idusuario || usuario?.id
  const puedeEliminar = usuario && (comentario.autor?.idusuario === miId || usuario?.es_admin === true)
  const irAlPerfil = (id) => { if (id) navigate(`/perfil/${id}`) }

  const copiarEnlace = () => {
    const url = `${window.location.origin}/publicacion/${comentario.idpublicacion || comentario.idcomentario}`
    navigator.clipboard?.writeText(url).then(() => onAviso('Enlace copiado'))
  }

  return (
    <article className="fd-post fd-resp">
      <UserHoverCard autor={comentario.autor} usuario={usuario}>
        <button type="button" className="fd-post-avatar" onClick={() => irAlPerfil(comentario.autor?.idusuario)} aria-label={`Ver perfil de ${comentario.autor?.nombre || 'usuario'}`}>
          <FdAvatar persona={comentario.autor} />
        </button>
      </UserHoverCard>

      <div className="fd-post-body">
        <header className="fd-post-head">
          <p className="fd-meta">
            <UserHoverCard autor={comentario.autor} usuario={usuario}>
              <button type="button" className="fd-nombre" onClick={() => irAlPerfil(comentario.autor?.idusuario)}>{comentario.autor?.nombre || 'Usuario'}</button>
            </UserHoverCard>
            {ROLES[comentario.autor?.tipousuario] && <span>{ROLES[comentario.autor.tipousuario]}</span>}
            <span>· {tiempoRelativo(comentario.createdat || comentario.created_at || comentario.createdAt || comentario.fechacreacion)}</span>
          </p>
          {puedeEliminar && <MenuOpciones etiqueta="Eliminar respuesta" onEliminar={() => onEliminar(comentario.idcomentario)} />}
        </header>

        <p className="fd-resp-a">
          En respuesta a{' '}
          <button type="button" className="fd-resp-link" onClick={() => irAlPerfil(autorPost?.idusuario)}>{autorPost?.nombre || 'usuario'}</button>
        </p>

        <p className="fd-texto">{comentario.contenido}</p>

        <div className="fd-acciones">
          <button type="button" className={`fd-accion${liked ? ' is-on' : ''}`} onClick={() => setLiked((v) => !v)} aria-label="Me gusta" aria-pressed={liked} title="Me gusta">
            <IcoLike lleno={liked} />{liked && <span>1</span>}
          </button>
          <button type="button" className="fd-accion" onClick={copiarEnlace} aria-label="Copiar enlace" title="Copiar enlace">
            <IcoEnlace />
          </button>
        </div>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════════
export default function PublicacionDetalle({ usuario }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post, setPost] = useState(null)
  const [postPadre, setPostPadre] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [error, setError] = useState(null)
  const [visor, setVisor] = useState(null)

  const [reposts, setReposts] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorRespuesta, setErrorRespuesta] = useState(null)

  // Eliminar: { tipo: 'post' } | { tipo: 'respuesta', id }
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState(null)

  const [aviso, setAviso] = useState(null)
  const avisoTimer = useRef(null)
  const mostrarAviso = useCallback((texto) => {
    setAviso(texto)
    clearTimeout(avisoTimer.current)
    avisoTimer.current = setTimeout(() => setAviso(null), 2400)
  }, [])
  useEffect(() => () => clearTimeout(avisoTimer.current), [])

  // ── Cargar post, post padre y respuestas ──
  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      setLoading(true)
      setError(null)
      setPost(null)
      setPostPadre(null)
      setComentarios([])

      try {
        const { data } = await api.get(`/api/publicaciones/compartir/${id}`)
        if (cancelado) return
        setPost(data)
        setReposts(data.republicaciones || 0)

        if (data.idpublicacionpadre) {
          try {
            const { data: padre } = await api.get(`/api/publicaciones/compartir/${data.idpublicacionpadre}`)
            if (!cancelado) setPostPadre(padre)
          } catch { /* el contexto no es crítico */ }
        }

        setLoadingComentarios(true)
        try {
          const { data: coms } = await api.get(`/api/publicaciones/${id}/comentarios`)
          if (!cancelado) setComentarios(coms)
        } catch { /* sin respuestas */ } finally {
          if (!cancelado) setLoadingComentarios(false)
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.response?.status === 404
            ? 'Esta publicación no existe o fue eliminada.'
            : 'No se pudo cargar la publicación.')
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [id])

  const irALogin = () => navigate('/login')

  // ── Me gusta (optimista) ──
  const darLike = async () => {
    if (!usuario) { irALogin(); return }
    const ya = !!post.usuarioDioLike
    setPost((p) => ({ ...p, usuarioDioLike: !ya, totalLikes: ya ? Math.max(0, (p.totalLikes || 0) - 1) : (p.totalLikes || 0) + 1 }))
    try {
      const { data } = ya
        ? await api.delete(`/api/publicaciones/${post.idpublicacion}/like`)
        : await api.post(`/api/publicaciones/${post.idpublicacion}/like`)
      setPost((p) => ({ ...p, totalLikes: data.totalLikes, usuarioDioLike: data.liked }))
    } catch {
      setPost((p) => ({ ...p, usuarioDioLike: ya, totalLikes: ya ? (p.totalLikes || 0) + 1 : Math.max(0, (p.totalLikes || 0) - 1) }))
    }
  }

  const republicar = () => {
    if (!usuario) { irALogin(); return }
    setReposts((r) => r + 1)
  }

  const copiarEnlace = () => {
    const url = `${window.location.origin}/publicacion/${id}`
    navigator.clipboard?.writeText(url).then(() => mostrarAviso('Enlace copiado'))
  }

  // ── Responder ──
  const enviarRespuesta = async () => {
    if (!usuario) { irALogin(); return }
    if (!respuesta.trim() || enviando) return
    setEnviando(true)
    setErrorRespuesta(null)
    try {
      const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/comentarios`, { contenido: respuesta.trim() })
      setComentarios((prev) => [data, ...prev])
      setPost((p) => ({ ...p, totalComentarios: (p.totalComentarios || 0) + 1 }))
      setRespuesta('')
    } catch {
      setErrorRespuesta('No se pudo enviar la respuesta. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Eliminar post o respuesta ──
  const confirmarEliminar = async () => {
    if (!porEliminar) return
    setEliminando(true)
    setErrorEliminar(null)
    try {
      if (porEliminar.tipo === 'post') {
        await api.delete(`/api/publicaciones/${post.idpublicacion}`)
        navigate('/feed')
        return
      }
      await api.delete(`/api/comentarios/${porEliminar.id}`)
      setComentarios((prev) => prev.filter((c) => c.idcomentario !== porEliminar.id))
      setPost((p) => ({ ...p, totalComentarios: Math.max(0, (p.totalComentarios || 1) - 1) }))
      setPorEliminar(null)
    } catch {
      setErrorEliminar(porEliminar.tipo === 'post' ? 'No se pudo eliminar la publicación.' : 'No se pudo eliminar la respuesta.')
    } finally {
      setEliminando(false)
    }
  }

  const miId = usuario?.idusuario || usuario?.id
  const esMio = !!usuario && post?.autor?.idusuario === miId
  const puedeEliminar = esMio || (!!usuario && usuario?.es_admin === true)
  const rol = ROLES[post?.autor?.tipousuario]
  const tipo = post && post.tipopublicacion !== 'NORMAL' && !post.referencia ? TIPOS[post.tipopublicacion] : null
  const totalRespuestas = post?.totalComentarios || comentarios.length
  const autorId = post?.autor?.idusuario
  const irAlPerfil = () => { if (autorId) navigate(`/perfil/${autorId}`) }

  return (
    <div className="pr fd">
      <div className="pr-wrap fd-layout">
        <ColumnaYo usuario={usuario} />

        <main className="fd-centro">
          <div className="fd-det-nav">
            <button type="button" className="fd-icono" onClick={() => navigate(-1)} aria-label="Volver">
              <IcoVolver />
            </button>
            <h1 className="fd-det-titulo">Publicación</h1>
          </div>

          {loading ? (
            <div aria-busy="true" aria-label="Cargando publicación">
              <div className="fd-post fd-post--skeleton" style={{ minHeight: 320 }} />
              <div className="fd-post fd-post--skeleton" />
            </div>
          ) : error ? (
            <div className="pr-empty fd-vacio">
              <h2 className="pr-display pr-empty-title">{error}</h2>
              <p>Puede que el enlace esté mal o que la hayan borrado.</p>
              <button type="button" className="pr-btn pr-btn--ink" onClick={() => navigate('/')}>Ir al inicio</button>
            </div>
          ) : post && (
            <>
              {postPadre && (
                <PostPadre post={postPadre} onClick={() => navigate(`/publicacion/${postPadre.idpublicacion}`)} />
              )}

              {/* ── La publicación, expandida ── */}
              <article className="fd-det">
                <header className="fd-det-autor">
                  <UserHoverCard autor={post.autor} usuario={usuario}>
                    <button type="button" className="fd-det-quien" onClick={irAlPerfil} aria-label={`Ver perfil de ${post.autor?.nombre || 'usuario'}`}>
                      <FdAvatar persona={post.autor} size={56} />
                      <span className="fd-det-nombres">
                        <strong>{post.autor?.nombre || 'Usuario'}</strong>
                        {rol && <span>{rol}</span>}
                      </span>
                    </button>
                  </UserHoverCard>

                  {tipo && <span className="pr-pill pr-pill--open fd-tipo">{tipo}</span>}
                  {!esMio && <SeguirAutor autor={post.autor} usuario={usuario} />}
                  {puedeEliminar && (
                    <MenuOpciones
                      etiqueta="Eliminar publicación"
                      onEliminar={() => { setErrorEliminar(null); setPorEliminar({ tipo: 'post' }) }}
                    />
                  )}
                </header>

                {post.contenido && <p className="fd-det-texto">{post.contenido}</p>}

                {post.tipopublicacion !== 'NORMAL' && post.referencia && (
                  <div className="fd-evento"><TarjetaEvento evento={post.referencia} /></div>
                )}

                {post.imagen && (
                  <div className="fd-media">
                    {esVideo(post.imagen)
                      ? <video src={post.imagen} controls preload="metadata" />
                      : (
                        <button type="button" className="fd-media-btn" onClick={() => setVisor(post.imagen)} aria-label="Ampliar imagen">
                          <img src={post.imagen} alt="" />
                        </button>
                      )}
                  </div>
                )}

                <p className="fd-det-fecha">{fechaCompleta(fechaDePost(post))}</p>

                {(totalRespuestas > 0 || reposts > 0 || post.totalLikes > 0) && (
                  <dl className="fd-det-stats">
                    {totalRespuestas > 0 && <div><dd>{totalRespuestas}</dd><dt>{totalRespuestas === 1 ? 'Respuesta' : 'Respuestas'}</dt></div>}
                    {reposts > 0 && <div><dd>{reposts}</dd><dt>{reposts === 1 ? 'Republicación' : 'Republicaciones'}</dt></div>}
                    {post.totalLikes > 0 && <div><dd>{post.totalLikes}</dd><dt>Me gusta</dt></div>}
                  </dl>
                )}

                <div className="fd-acciones fd-det-acciones">
                  <button type="button" className="fd-accion" onClick={() => document.getElementById('fd-det-respuesta')?.focus()} aria-label="Responder" title="Responder">
                    <IcoResponder />
                  </button>
                  <button type="button" className="fd-accion" onClick={republicar} aria-label="Republicar" title="Republicar">
                    <IcoRepublicar />
                  </button>
                  <button type="button" className={`fd-accion${post.usuarioDioLike ? ' is-on' : ''}`} onClick={darLike} aria-label="Me gusta" aria-pressed={!!post.usuarioDioLike} title="Me gusta">
                    <IcoLike lleno={post.usuarioDioLike} />
                  </button>
                  <button type="button" className="fd-accion" onClick={copiarEnlace} aria-label="Copiar enlace" title="Copiar enlace">
                    <IcoEnlace />
                  </button>
                </div>

                {/* Responder */}
                <div className="fd-responder">
                  <FdAvatar persona={usuario} size={44} />
                  <div className="fd-responder-campo">
                    <label className="fd-campo fd-campo--plano">
                      <span className="pr-sr">Tu respuesta</span>
                      <textarea
                        id="fd-det-respuesta"
                        rows={2}
                        maxLength={MAX_RESPUESTA}
                        placeholder={usuario ? 'Escribí tu respuesta' : 'Iniciá sesión para responder'}
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && usuario) { e.preventDefault(); enviarRespuesta() } }}
                        disabled={!usuario}
                      />
                    </label>
                    {errorRespuesta && <p className="pr-error">{errorRespuesta}</p>}
                    <div className="fd-responder-barra">
                      {usuario && respuesta.length > 0 && (
                        <span className={`fd-contador${respuesta.length > MAX_RESPUESTA - 40 ? ' is-cerca' : ''}`}>{respuesta.length}/{MAX_RESPUESTA}</span>
                      )}
                      <button
                        type="button"
                        className="pr-btn pr-btn--sm"
                        onClick={usuario ? enviarRespuesta : irALogin}
                        disabled={!!usuario && (!respuesta.trim() || enviando)}
                      >
                        {usuario ? (enviando ? 'Respondiendo…' : 'Responder') : 'Iniciar sesión'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>

              {/* ── Respuestas ── */}
              {loadingComentarios ? (
                <div aria-busy="true" aria-label="Cargando respuestas">
                  <div className="fd-post fd-post--skeleton" />
                </div>
              ) : comentarios.length === 0 ? (
                <p className="fd-fin">Nadie respondió todavía. Sé el primero.</p>
              ) : (
                <div className="fd-lista">
                  {comentarios.map((c) => (
                    <Respuesta
                      key={c.idcomentario}
                      comentario={c}
                      usuario={usuario}
                      autorPost={post.autor}
                      onEliminar={(idc) => { setErrorEliminar(null); setPorEliminar({ tipo: 'respuesta', id: idc }) }}
                      onAviso={mostrarAviso}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        <ColumnaSeguir />
      </div>

      {visor && <VisorImagen src={visor} onCerrar={() => setVisor(null)} />}

      <ModalConfirmarEliminar
        abierto={!!porEliminar}
        titulo={porEliminar?.tipo === 'post' ? '¿Eliminar publicación?' : '¿Eliminar respuesta?'}
        mensaje={porEliminar?.tipo === 'post' && !esMio ? 'Estás moderando como administrador. Esta acción no se puede deshacer.' : 'Esta acción no se puede deshacer.'}
        eliminando={eliminando}
        error={errorEliminar}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setPorEliminar(null)}
      />

      {aviso && (
        <div className="pr-toast fd-toast" role="status">
          <p className="pr-toast-titulo">{aviso}</p>
        </div>
      )}
    </div>
  )
}
