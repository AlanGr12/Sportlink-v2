import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import Avatar from '../components/Avatar.jsx'
import { ModalImagen, ReferenciaBloque } from './PostCard.jsx'
import Footer from '../footer/footer.jsx'
import BotonSeguir from '../components/BotonSeguir.jsx'
import './FeedView.css'

// ─── helpers ────────────────────────────────────────────────
function tiempoRelativo(fechaStr) {
  if (!fechaStr) return ''
  const diff = (Date.now() - new Date(fechaStr).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
  return new Date(fechaStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function fechaCompleta(fechaStr) {
  if (!fechaStr) return ''
  const d = new Date(fechaStr)
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  const fecha = d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${hora} · ${fecha}`
}

function RolBadge({ rol }) {
  if (!rol) return null
  return <span className={`post-rol-badge ${rol.toLowerCase()}`}>{rol}</span>
}

function TipoChip({ tipo }) {
  if (!tipo || tipo === 'NORMAL') return null
  const labels = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', EMPLEO: 'Empleo' }
  return <span className={`post-tipo-chip ${tipo}`}>{labels[tipo] || tipo}</span>
}

// ─── Íconos ────────────────────────────────────────────────
const IcoThumbsUp = ({ filled }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#2DEFF2' : 'none'} stroke={filled ? '#2DEFF2' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)
const IcoComment = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const IcoRepost = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)
const IcoSend = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)
const IcoDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
)
const IcoArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
)

// ─── Mini card del post padre (contexto) ───────────────────
function PostPadreCard({ post, onClick }) {
  return (
    <div className="post-detalle-padre-wrapper" onClick={onClick}>
      <div className="post-detalle-padre-avatar-col">
        <Avatar src={post.autor?.fotoperfil} nombre={post.autor?.nombre || '?'} size={40} />
        {/* Línea que conecta padre con el post actual */}
        <div className="post-thread-line post-thread-line--padre" />
      </div>
      <div className="post-detalle-padre-body">
        <div className="post-detalle-padre-header">
          <span className="post-detalle-padre-nombre">{post.autor?.nombre || 'Usuario'}</span>
          <span className="post-detalle-padre-tiempo">· {tiempoRelativo(post.createdat)}</span>
        </div>
        <p className="post-detalle-padre-contenido">{post.contenido}</p>
        {post.imagen && !post.imagen.match(/\.(mp4|webm|ogg)$/i) && (
          <img src={post.imagen} alt="Imagen del post original" className="post-detalle-padre-imagen" />
        )}
      </div>
    </div>
  )
}

// ─── Card de respuesta en la vista de detalle ─────────────
function RespuestaCard({ comentario, usuario, autorPost, onEliminar, esUltimo }) {
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [likeAnimando, setLikeAnimando] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const menuRef = useRef(null)

  const esMio = usuario && comentario.autor?.idusuario === (usuario.idusuario || usuario.id)

  useEffect(() => {
    if (!menuAbierto) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuAbierto])

  return (
    <article className="post-card post-detalle-respuesta-card">
      {/* Columna avatar */}
      <div className="post-card-avatar-col">
        <Avatar
          src={comentario.autor?.fotoperfil}
          nombre={comentario.autor?.nombre || '?'}
          size={44}
          onClick={() => comentario.autor?.idusuario && navigate(`/perfil/${comentario.autor.idusuario}`)}
          style={{ cursor: 'pointer', flexShrink: 0 }}
        />
        {!esUltimo && <div className="post-thread-line" />}
      </div>

      {/* Columna contenido */}
      <div className="post-card-body">
        <div className="post-card-header">
          <div
            className="post-card-autor"
            onClick={() => comentario.autor?.idusuario && navigate(`/perfil/${comentario.autor.idusuario}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="post-card-autor-info">
              <span className="post-card-nombre">{comentario.autor?.nombre || 'Usuario'}</span>
              <span className="post-card-tiempo">· {tiempoRelativo(comentario.createdat)}</span>
            </div>
          </div>

          {esMio && (
            <div className="post-menu-wrapper" ref={menuRef}>
              <button
                className="post-menu-btn"
                onClick={() => setMenuAbierto(v => !v)}
                aria-label="Opciones"
              >
                <IcoDots />
              </button>
              {menuAbierto && (
                <div className="post-menu-dropdown">
                  <button className="post-menu-item danger" onClick={() => { setMenuAbierto(false); onEliminar(comentario.idcomentario) }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* "En respuesta a @autor" */}
        <p className="post-detalle-en-respuesta-a">
          En respuesta a{' '}
          <span
            className="post-detalle-en-respuesta-link"
            onClick={() => autorPost?.idusuario && navigate(`/perfil/${autorPost.idusuario}`)}
          >
            @{autorPost?.nombre || 'usuario'}
          </span>
        </p>

        <div className="post-card-contenido">{comentario.contenido}</div>

        {/* Acciones simples de la respuesta */}
        <div className="post-acciones-wrapper">
          <div className="post-acciones-botones">
            <button
              className={`post-accion-btn${liked ? ' liked' : ''}`}
              onClick={() => { setLiked(v => !v); setLikesCount(c => liked ? Math.max(0, c - 1) : c + 1) }}
              aria-label="Me gusta"
            >
              <span className={likeAnimando ? 'like-anim' : ''} style={{ display: 'inline-flex' }}>
                <IcoThumbsUp filled={liked} />
              </span>
              {likesCount > 0 && <span className="post-accion-numero">{likesCount}</span>}
              <span className="post-accion-tooltip">Me gusta</span>
            </button>
            <button className="post-accion-btn" aria-label="Comentar">
              <IcoComment />
              <span className="post-accion-tooltip">Responder</span>
            </button>
            <button className="post-accion-btn" aria-label="Republicar">
              <IcoRepost />
              <span className="post-accion-tooltip">Republicar</span>
            </button>
            <button
              className="post-accion-btn"
              onClick={() => {
                const url = `${window.location.origin}/publicacion/${comentario.idpublicacion || comentario.idcomentario}`
                navigator.clipboard?.writeText(url).then(() => alert('Enlace copiado'))
              }}
              aria-label="Compartir"
            >
              <IcoSend />
              <span className="post-accion-tooltip">Copiar enlace</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: PublicacionDetalle
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
  const [imagenModal, setImagenModal] = useState(null)

  // Acciones del post
  const [likeAnimando, setLikeAnimando] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [reposts, setReposts] = useState(0)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  // Input de respuesta
  const [respuesta, setRespuesta] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Sidebars
  const [seguidos, setSeguidos] = useState(usuario?.seguidos || [])
  const [recomendaciones, setRecomendaciones] = useState([])

  useEffect(() => {
    const cargarRecomendaciones = async () => {
      try {
        const res = await api.get('/api/recomendaciones', { params: { limite: 3 } })
        setRecomendaciones(Array.isArray(res.data) ? res.data : [])
      } catch {
        setRecomendaciones([])
      }
    }
    cargarRecomendaciones()
  }, [usuario])

  const rolUsuario = usuario?.tipousuario === 'jugador'
    ? 'Atleta Profesional'
    : usuario?.tipousuario === 'entrenador'
      ? 'Entrenador Elite'
      : usuario?.tipousuario === 'club'
        ? 'Club Deportivo'
        : usuario?.tipousuario || 'Miembro de SportLink'

  // Cerrar menú al click afuera
  useEffect(() => {
    if (!menuAbierto) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuAbierto])

  // ── Cargar post ──────────────────────────────────────
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
        setLiked(data.usuarioDioLike || false)
        setLikesCount(data.totalLikes || 0)
        setReposts(data.republicaciones || 0)

        // Si es una respuesta, cargar el post padre
        if (data.idpublicacionpadre) {
          try {
            const { data: padre } = await api.get(`/api/publicaciones/compartir/${data.idpublicacionpadre}`)
            if (!cancelado) setPostPadre(padre)
          } catch {
            // No es crítico si no se puede cargar el padre
          }
        }

        // Cargar comentarios/respuestas
        setLoadingComentarios(true)
        try {
          const { data: coms } = await api.get(`/api/publicaciones/${id}/comentarios`)
          if (!cancelado) setComentarios(coms)
        } catch {
          // sin comentarios
        } finally {
          if (!cancelado) setLoadingComentarios(false)
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.response?.status === 404
            ? 'Esta publicación no existe o fue eliminada.'
            : 'No se pudo cargar la publicación.'
          )
        }
      } finally {
        if (!cancelado) setLoading(false)
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [id])

  // ── Like ──────────────────────────────────────────────
  const handleLike = async () => {
    if (!usuario) { navigate('/login'); return }
    const yaLiked = liked
    setLiked(!yaLiked)
    setLikesCount(c => yaLiked ? Math.max(0, c - 1) : c + 1)
    setLikeAnimando(true)
    setTimeout(() => setLikeAnimando(false), 400)
    try {
      if (yaLiked) {
        const { data } = await api.delete(`/api/publicaciones/${post.idpublicacion}/like`)
        setLiked(data.liked); setLikesCount(data.totalLikes)
      } else {
        const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/like`)
        setLiked(data.liked); setLikesCount(data.totalLikes)
      }
    } catch {
      setLiked(yaLiked)
      setLikesCount(c => yaLiked ? c + 1 : Math.max(0, c - 1))
    }
  }

  // ── Enviar respuesta ──────────────────────────────────
  const handleEnviarRespuesta = async () => {
    if (!usuario) { navigate('/login'); return }
    if (!respuesta.trim() || enviando) return
    setEnviando(true)
    try {
      const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/comentarios`, {
        contenido: respuesta.trim()
      })
      setComentarios(prev => [data, ...prev])
      setPost(p => ({ ...p, totalComentarios: (p.totalComentarios || 0) + 1 }))
      setRespuesta('')
    } catch {
      alert('No se pudo enviar la respuesta.')
    } finally {
      setEnviando(false)
    }
  }

  // ── Eliminar post ─────────────────────────────────────
  const handleEliminarPost = async () => {
    setMenuAbierto(false)
    if (!window.confirm('¿Eliminar esta publicación?')) return
    try {
      await api.delete(`/api/publicaciones/${post.idpublicacion}`)
      navigate('/feed')
    } catch {
      alert('No se pudo eliminar la publicación.')
    }
  }

  // ── Eliminar comentario ───────────────────────────────
  const handleEliminarComentario = async (idcomentario) => {
    if (!window.confirm('¿Eliminar esta respuesta?')) return
    try {
      await api.delete(`/api/comentarios/${idcomentario}`)
      setComentarios(prev => prev.filter(c => c.idcomentario !== idcomentario))
      setPost(p => ({ ...p, totalComentarios: Math.max(0, (p.totalComentarios || 1) - 1) }))
    } catch {
      alert('No se pudo eliminar la respuesta.')
    }
  }

  // ── Copiar enlace ─────────────────────────────────────
  const handleCompartir = () => {
    const url = `${window.location.origin}/publicacion/${id}`
    navigator.clipboard?.writeText(url).then(() => alert('Enlace copiado al portapapeles'))
  }

  const esMio = usuario && post?.autor?.idusuario === (usuario?.idusuario || usuario?.id)

  const rolTraducido = post?.autor?.tipousuario === 'jugador'
    ? 'Atleta Profesional'
    : post?.autor?.tipousuario === 'entrenador'
      ? 'Entrenador Elite'
      : post?.autor?.tipousuario === 'club'
        ? 'Club Deportivo'
        : post?.autor?.tipousuario

  return (
    <>
      <div className="feed-pagina post-detalle-pagina">
        <div className="feed-layout">
          {/* ════ Columna Izquierda: Perfil + Seguidos ════ */}
          <aside className="feed-sidebar-izquierda">
            {/* Card Resumen Perfil */}
            <div className="feed-profile-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/perfil')}>
              <div className="feed-profile-banner" />
              <div className="feed-profile-avatar-container">
                <Avatar src={usuario?.fotoperfil} nombre={usuario?.nombre || 'Usuario'} size={72} />
              </div>
              <div className="feed-profile-info">
                <h3 className="feed-profile-name">{usuario?.nombre || usuario?.email || 'Usuario'}</h3>
                <p className="feed-profile-role">{rolUsuario}</p>
              </div>
              <div className="feed-profile-stats">
                <div className="feed-profile-stat-row">
                  <span className="feed-stat-label">Vistas del perfil</span>
                  <span className="feed-stat-value">{usuario?.vistasPerfil ?? 0}</span>
                </div>
                <div className="feed-profile-stat-row">
                  <span className="feed-stat-label">Conexiones</span>
                  <span className="feed-stat-value">{usuario?.conexiones ?? 0}</span>
                </div>
              </div>
            </div>

            {/* Card SEGUIDOS */}
            <div className="feed-sidebar-card">
              <h4 className="feed-sidebar-header-title">SEGUIDOS</h4>
              {seguidos && seguidos.length > 0 ? (
                <div className="feed-seguidos-lista">
                  {seguidos.map((item, idx) => (
                    <div key={item.id || idx} className="feed-seguido-item">
                      <Avatar src={item.logo || item.fotoperfil} nombre={item.nombre} size={36} />
                      <div className="feed-seguido-info">
                        <span className="feed-seguido-nombre">{item.nombre}</span>
                        <span className="feed-seguido-sub">{item.categoria || item.tipousuario || 'Club'}</span>
                      </div>
                    </div>
                  ))}
                  <button className="feed-ver-todo-btn">Ver todo →</button>
                </div>
              ) : (
                <div className="feed-vacio-box">Sin seguidos por el momento</div>
              )}
            </div>
          </aside>

          {/* ════ Columna Central: Contenedor del Post ════ */}
          <main className="post-detalle-contenedor">
            {/* ── Header: Volver ── */}
            <div className="post-detalle-header-nav">
              <button className="post-detalle-volver-btn" onClick={() => navigate(-1)} aria-label="Volver">
                <IcoArrowLeft />
              </button>
              <span className="post-detalle-titulo">Post</span>
            </div>

            {loading ? (
              <div className="feed-spinner-wrapper" style={{ paddingTop: 60 }}>
                <div className="feed-spinner" />
              </div>
            ) : error ? (
              <div className="feed-vacio" style={{ paddingTop: 60 }}>
                <h3>{error}</h3>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    marginTop: '16px', background: '#2DEFF2', color: '#000', border: 'none',
                    borderRadius: '8px', padding: '10px 24px', fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            ) : post && (
              <>
                {/* ── Post padre (si es una respuesta) ── */}
                {postPadre && (
                  <PostPadreCard
                    post={postPadre}
                    onClick={() => navigate(`/publicacion/${postPadre.idpublicacion}`)}
                  />
                )}

                {/* ── Post principal expandido ── */}
                <div className={`post-detalle-principal${postPadre ? ' post-detalle-principal--es-respuesta' : ''}`}>
                  {/* Avatar + Nombre + 3 puntos */}
                  <div className="post-detalle-autor-row">
                    <div className="post-detalle-autor-info" onClick={() => post.autor?.idusuario && navigate(`/perfil/${post.autor.idusuario}`)}>
                      <Avatar
                        src={post.autor?.fotoperfil}
                        nombre={post.autor?.nombre || '?'}
                        size={48}
                        style={{ cursor: 'pointer', flexShrink: 0 }}
                      />
                      <div className="post-detalle-autor-texto">
                        <span className="post-detalle-autor-nombre">{post.autor?.nombre || 'Usuario'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          {rolTraducido && <span className="post-card-subtitulo">{rolTraducido}</span>}
                          <RolBadge rol={post.autor?.tipousuario} />
                        </div>
                      </div>
                    </div>
                    {!esMio && (
                      <BotonSeguir
                        idusuario={post.autor?.idusuario}
                        tipousuario={post.autor?.tipousuario}
                        usuario={usuario}
                      />
                    )}
                    {esMio && (
                      <div className="post-menu-wrapper" ref={menuRef}>
                        <button className="post-menu-btn" onClick={() => setMenuAbierto(v => !v)} aria-label="Opciones">
                          <IcoDots />
                        </button>
                        {menuAbierto && (
                          <div className="post-menu-dropdown">
                            <button className="post-menu-item danger" onClick={handleEliminarPost}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tipo chip */}
                  <TipoChip tipo={post.tipopublicacion} />

                  {/* Contenido */}
                  {post.contenido && (
                    <p className="post-detalle-contenido">{post.contenido}</p>
                  )}

                  {/* Referencia */}
                  {post.tipopublicacion !== 'NORMAL' && post.referencia && (
                    <div style={{ marginTop: '12px' }}>
                      <ReferenciaBloque referencia={post.referencia} />
                    </div>
                  )}

                  {/* Imagen / Video */}
                  {post.imagen && (
                    <div className="post-card-imagen" style={{ marginTop: '16px' }}>
                      {post.imagen.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video src={post.imagen} controls className="post-media-video" />
                      ) : (
                        <img
                          src={post.imagen}
                          alt="Publicación"
                          onClick={() => setImagenModal(post.imagen)}
                          style={{ cursor: 'zoom-in' }}
                        />
                      )}
                    </div>
                  )}

                  {/* Fecha completa */}
                  <div className="post-detalle-fecha">{fechaCompleta(post.createdat)}</div>

                  {/* Barra de stats */}
                  {(likesCount > 0 || (post.totalComentarios || comentarios.length) > 0 || reposts > 0) && (
                    <div className="post-detalle-stats">
                      {(post.totalComentarios || comentarios.length) > 0 && (
                        <span className="post-detalle-stat">
                          <strong>{post.totalComentarios || comentarios.length}</strong> Respuestas
                        </span>
                      )}
                      {reposts > 0 && (
                        <span className="post-detalle-stat">
                          <strong>{reposts}</strong> Reposts
                        </span>
                      )}
                      {likesCount > 0 && (
                        <span className="post-detalle-stat">
                          <strong>{likesCount}</strong> Me gusta
                        </span>
                      )}
                    </div>
                  )}

                  {/* Separador + Acciones */}
                  <div className="post-detalle-acciones-barra">
                    <button
                      className={`post-detalle-accion-btn${liked ? ' liked' : ''}`}
                      onClick={handleLike}
                      aria-label="Me gusta"
                    >
                      <span className={likeAnimando ? 'like-anim' : ''} style={{ display: 'inline-flex' }}>
                        <IcoThumbsUp filled={liked} />
                      </span>
                      <span className="post-detalle-accion-label">Me gusta</span>
                    </button>

                    <button className="post-detalle-accion-btn" aria-label="Responder" onClick={() => document.getElementById('detalle-respuesta-input')?.focus()}>
                      <IcoComment />
                      <span className="post-detalle-accion-label">Responder</span>
                    </button>

                    <button className="post-detalle-accion-btn" aria-label="Republicar" onClick={() => setReposts(r => r + 1)}>
                      <IcoRepost />
                      <span className="post-detalle-accion-label">Republicar</span>
                    </button>

                    <button className="post-detalle-accion-btn" aria-label="Compartir" onClick={handleCompartir}>
                      <IcoSend />
                      <span className="post-detalle-accion-label">Compartir</span>
                    </button>
                  </div>

                  {/* Input para responder */}
                  <div className="post-detalle-responder-box">
                    <Avatar src={usuario?.fotoperfil} nombre={usuario?.nombre || '?'} size={40} />
                    <div className="post-detalle-responder-input-wrapper">
                      <textarea
                        id="detalle-respuesta-input"
                        className="post-detalle-responder-input"
                        placeholder={usuario ? 'Publicá tu respuesta' : 'Iniciá sesión para responder'}
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && usuario) { e.preventDefault(); handleEnviarRespuesta() } }}
                        disabled={!usuario}
                        rows={1}
                      />
                    </div>
                    <button
                      className="post-detalle-responder-btn"
                      onClick={usuario ? handleEnviarRespuesta : () => navigate('/login')}
                      disabled={usuario && (!respuesta.trim() || enviando)}
                    >
                      {usuario ? 'Responder' : 'Iniciar sesión'}
                    </button>
                  </div>
                </div>

                {/* ── Separador ── */}
                <div className="post-detalle-separador" />

                {/* ── Lista de respuestas ── */}
                {loadingComentarios ? (
                  <div className="feed-spinner-wrapper" style={{ padding: '32px 0' }}>
                    <div className="feed-spinner" />
                  </div>
                ) : comentarios.length === 0 ? (
                  <div style={{ padding: '40px 16px', textAlign: 'center', color: '#4a5060' }}>
                    <p style={{ fontSize: '14px' }}>Nadie respondió todavía. ¡Sé el primero!</p>
                  </div>
                ) : (
                  <div className="post-detalle-respuestas-lista">
                    {comentarios.map((c, idx) => (
                      <RespuestaCard
                        key={c.idcomentario}
                        comentario={c}
                        usuario={usuario}
                        autorPost={post.autor}
                        onEliminar={handleEliminarComentario}
                        esUltimo={idx === comentarios.length - 1}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </main>

          {/* ════ Columna Derecha: Recomendados ════ */}
          <aside className="feed-sidebar-derecha">
            {/* Recomendado para ti */}
            <div className="feed-sidebar-card">
              <h4 className="feed-sidebar-header-title">RECOMENDADO PARA TI</h4>
              {recomendaciones && recomendaciones.length > 0 ? (
                <div className="feed-recomendados-lista">
                  {recomendaciones.map((rec) => (
                    <div
                      key={rec.idusuario}
                      className="feed-recomendado-item"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/perfil/${rec.idusuario}`)}
                    >
                      <Avatar src={rec.fotoperfil} nombre={rec.nombre || 'Usuario'} size={40} />
                      <div className="feed-recomendado-info">
                        <span className="feed-recomendado-nombre">{rec.nombre}</span>
                        <span className="feed-recomendado-sub">
                          {rec.tipousuario === 'club' ? 'Club' : 'Entrenador'}{rec.deporte ? ` · ${rec.deporte}` : ''}
                        </span>
                      </div>
                      <button className="feed-btn-conectar" onClick={(e) => { e.stopPropagation(); navigate(`/perfil/${rec.idusuario}`) }}>Perfil</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="feed-vacio-box">Sin recomendaciones por el momento</div>
              )}
            </div>

            {/* Footer links */}
            <footer className="feed-footer-links">
              <div className="feed-footer-row">
                <span onClick={() => navigate('/landing')} style={{ cursor: 'pointer' }}>Landing</span>
                <span>•</span>
                <span>Acerca de</span>
                <span>•</span>
                <span>Accesibilidad</span>
                <span>•</span>
                <span>Centro de ayuda</span>
              </div>
              <div className="feed-footer-row">
                <span>Privacidad y Términos</span>
              </div>
              <p className="feed-copyright">SportLink © 2026</p>
            </footer>
          </aside>
        </div>
      </div>

      {imagenModal && <ModalImagen src={imagenModal} onClose={() => setImagenModal(null)} />}
    </>
  )
}