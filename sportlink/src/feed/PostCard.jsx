import React, { useState, useRef, useEffect } from 'react'
import Avatar from '../components/Avatar.jsx'
import api from '../axiosConfig.js'

// ─── helpers ───────────────────────────────────────────────
function tiempoRelativo(fechaStr) {
  if (!fechaStr) return ''
  const diff = (Date.now() - new Date(fechaStr).getTime()) / 1000
  if (diff < 60)     return 'ahora'
  if (diff < 3600)   return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400)  return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
  return new Date(fechaStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
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

// ─── Íconos SVG inline ────────────────────────────────────
const IcoThumbsUp = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#2DEFF2' : 'none'} stroke={filled ? '#2DEFF2' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
  </svg>
)

const IcoComment = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const IcoRepost = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

const IcoSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)

const IcoDots = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
)

// ═══════════════════════════════════════════════════════════
// COMPONENTE: PostCard  — solo la publicación
// ═══════════════════════════════════════════════════════════
export function PostCard({ post, usuario, onImagenClick, onEliminar }) {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const menuRef = useRef(null)

  const esMio = usuario && post.autor?.idusuario === (usuario.idusuario || usuario.id)

  // Cerrar menu al clickear afuera
  useEffect(() => {
    if (!menuAbierto) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuAbierto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuAbierto])

  const handleEliminar = async () => {
    setMenuAbierto(false)
    if (!window.confirm('¿Eliminar esta publicación?')) return
    try {
      await api.delete(`/api/publicaciones/${post.idpublicacion}`)
      onEliminar(post.idpublicacion)
    } catch {
      alert('No se pudo eliminar la publicación.')
    }
  }

  const handleCompartir = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copiado al portapapeles.'))
    }
  }

  const rolTraducido = post.autor?.tipousuario === 'jugador'
    ? 'Atleta Profesional'
    : post.autor?.tipousuario === 'entrenador'
      ? 'Entrenador Elite'
      : post.autor?.tipousuario === 'club'
        ? 'Club Deportivo'
        : post.autor?.tipousuario

  return (
    <div className="post-card-header">
      {/* Autor */}
      <div className="post-card-autor">
        <Avatar
          src={post.autor?.fotoperfil}
          nombre={post.autor?.nombre || '?'}
          size={44}
        />
        <div className="post-card-autor-info">
          <span className="post-card-nombre">{post.autor?.nombre || 'Usuario'}</span>
          <div className="post-card-meta">
            {rolTraducido && <span className="post-card-subtitulo">{rolTraducido}</span>}
            <RolBadge rol={post.autor?.tipousuario} />
            <TipoChip tipo={post.tipopublicacion} />
            <span className="post-card-tiempo">• {tiempoRelativo(post.createdat)}</span>
          </div>
        </div>
      </div>

      {/* Menú 3 puntos (solo si es el dueño) */}
      {esMio && (
        <div className="post-menu-wrapper" ref={menuRef}>
          <button className="post-menu-btn" onClick={() => setMenuAbierto(v => !v)} aria-label="Opciones">
            <IcoDots />
          </button>
          {menuAbierto && (
            <div className="post-menu-dropdown">
              <button className="post-menu-item danger" onClick={handleEliminar}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE: PostAcciones — likes + comentarios
// ═══════════════════════════════════════════════════════════
export function PostAcciones({ post: postInicial, usuario, onEliminarComentario }) {
  const [post, setPost] = useState(postInicial)
  const [likeAnimando, setLikeAnimando] = useState(false)
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [loadingComentarios, setLoadingComentarios] = useState(false)
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [comentarioEditando, setComentarioEditando] = useState(null)
  const [reposts, setReposts] = useState(postInicial.republicaciones || 0)

  // ── Like optimista ─────────────────────────────────────
  const handleLike = async () => {
    const yaLiked = post.usuarioDioLike
    setPost(p => ({
      ...p,
      usuarioDioLike: !yaLiked,
      totalLikes: yaLiked ? Math.max(0, p.totalLikes - 1) : p.totalLikes + 1
    }))
    setLikeAnimando(true)
    setTimeout(() => setLikeAnimando(false), 400)

    try {
      if (yaLiked) {
        const { data } = await api.delete(`/api/publicaciones/${post.idpublicacion}/like`)
        setPost(p => ({ ...p, totalLikes: data.totalLikes, usuarioDioLike: data.liked }))
      } else {
        const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/like`)
        setPost(p => ({ ...p, totalLikes: data.totalLikes, usuarioDioLike: data.liked }))
      }
    } catch {
      setPost(p => ({
        ...p,
        usuarioDioLike: yaLiked,
        totalLikes: yaLiked ? p.totalLikes + 1 : Math.max(0, p.totalLikes - 1)
      }))
    }
  }

  // ── Comentarios ───────────────────────────────────────
  const handleToggleComentarios = async () => {
    const nuevosAbiertos = !comentariosAbiertos
    setComentariosAbiertos(nuevosAbiertos)
    if (nuevosAbiertos && comentarios.length === 0) {
      setLoadingComentarios(true)
      try {
        const { data } = await api.get(`/api/publicaciones/${post.idpublicacion}/comentarios`)
        setComentarios(data)
      } catch {
        console.error('Error cargando comentarios')
      } finally {
        setLoadingComentarios(false)
      }
    }
  }

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() || enviandoComentario) return
    setEnviandoComentario(true)
    try {
      const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/comentarios`, {
        contenido: nuevoComentario.trim()
      })
      setComentarios(prev => [data, ...prev])
      setPost(p => ({ ...p, totalComentarios: p.totalComentarios + 1 }))
      setNuevoComentario('')
    } catch {
      alert('No se pudo enviar el comentario.')
    } finally {
      setEnviandoComentario(false)
    }
  }

  const handleEliminarComentario = async (idcomentario) => {
    try {
      await api.delete(`/api/comentarios/${idcomentario}`)
      setComentarios(prev => prev.filter(c => c.idcomentario !== idcomentario))
      setPost(p => ({ ...p, totalComentarios: Math.max(0, p.totalComentarios - 1) }))
    } catch {
      alert('No se pudo eliminar el comentario.')
    }
  }

  const handleGuardarEdicion = async () => {
    if (!comentarioEditando?.texto.trim()) return
    try {
      await api.put(`/api/comentarios/${comentarioEditando.id}`, { contenido: comentarioEditando.texto.trim() })
      setComentarios(prev => prev.map(c =>
        c.idcomentario === comentarioEditando.id ? { ...c, contenido: comentarioEditando.texto.trim() } : c
      ))
      setComentarioEditando(null)
    } catch {
      alert('No se pudo editar el comentario.')
    }
  }

  const handleRepublicar = () => {
    setReposts(r => r + 1)
  }

  const handleEnviar = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  const miId = usuario?.idusuario || usuario?.id

  return (
    <>
      <div className="post-acciones-wrapper">
        {/* Botones de acción minimalistas con tooltip al pasar el mouse */}
        <div className="post-acciones-botones">
          <button
            className={`post-accion-btn${post.usuarioDioLike ? ' liked' : ''}`}
            onClick={handleLike}
            aria-label="Me gusta"
          >
            <span className={likeAnimando ? 'like-anim' : ''} style={{ display: 'inline-flex' }}>
              <IcoThumbsUp filled={post.usuarioDioLike} />
            </span>
            {post.totalLikes > 0 && <span className="post-accion-numero">{post.totalLikes}</span>}
            <span className="post-accion-tooltip">Me gusta</span>
          </button>

          <button
            className="post-accion-btn"
            onClick={handleToggleComentarios}
            aria-label="Comentar"
          >
            <IcoComment />
            {post.totalComentarios > 0 && <span className="post-accion-numero">{post.totalComentarios}</span>}
            <span className="post-accion-tooltip">Comentar</span>
          </button>

          <button
            className="post-accion-btn"
            onClick={handleRepublicar}
            aria-label="Republicar"
          >
            <IcoRepost />
            {reposts > 0 && <span className="post-accion-numero">{reposts}</span>}
            <span className="post-accion-tooltip">Republicar</span>
          </button>

          <button
            className="post-accion-btn"
            onClick={handleEnviar}
            aria-label="Enviar"
          >
            <IcoSend />
            <span className="post-accion-tooltip">Enviar</span>
          </button>
        </div>
      </div>

      {/* Sección de comentarios */}
      {comentariosAbiertos && (
        <div className="post-comentarios-seccion">
          {/* Input nuevo comentario */}
          {usuario && (
            <div className="post-nuevo-comentario">
              <Avatar src={usuario.fotoperfil} nombre={usuario.nombre || 'Yo'} size={32} />
              <textarea
                className="post-comentario-input"
                placeholder="Escribí un comentario... (Enter para enviar)"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarComentario() } }}
                rows={1}
              />
              <button
                className="post-comentario-enviar"
                onClick={handleEnviarComentario}
                disabled={!nuevoComentario.trim() || enviandoComentario}
                title="Enviar comentario"
              >
                <IcoSend />
              </button>
            </div>
          )}

          {/* Lista */}
          {loadingComentarios ? (
            <div className="feed-spinner-wrapper" style={{ padding: '16px 0' }}>
              <div className="feed-spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
            </div>
          ) : (
            <div className="post-comentarios-lista">
              {comentarios.map(c => (
                <div key={c.idcomentario} className="post-comentario-item">
                  <Avatar src={c.autor?.fotoperfil} nombre={c.autor?.nombre || '?'} size={32} />
                  <div className="post-comentario-burbuja">
                    <div className="post-comentario-nombre">{c.autor?.nombre || 'Usuario'}</div>

                    {comentarioEditando?.id === c.idcomentario ? (
                      <>
                        <textarea
                          className="post-comentario-editar-input"
                          value={comentarioEditando.texto}
                          onChange={(e) => setComentarioEditando(prev => ({ ...prev, texto: e.target.value }))}
                          rows={2}
                        />
                        <div className="post-comentario-editar-acciones">
                          <button className="post-comentario-editar-btn guardar" onClick={handleGuardarEdicion}>Guardar</button>
                          <button className="post-comentario-editar-btn cancelar" onClick={() => setComentarioEditando(null)}>Cancelar</button>
                        </div>
                      </>
                    ) : (
                      <p className="post-comentario-texto">{c.contenido}</p>
                    )}

                    <div className="post-comentario-footer">
                      <span className="post-comentario-tiempo">{tiempoRelativo(c.createdat)}</span>
                      {Number(c.autor?.idusuario) === Number(miId) && !comentarioEditando && (
                        <div className="post-comentario-acciones">
                          <button
                            className="post-comentario-accion-btn"
                            onClick={() => setComentarioEditando({ id: c.idcomentario, texto: c.contenido })}
                          >Editar</button>
                          <button
                            className="post-comentario-accion-btn danger"
                            onClick={() => handleEliminarComentario(c.idcomentario)}
                          >Eliminar</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comentarios.length === 0 && !loadingComentarios && (
                <p style={{ color: '#4a5060', fontSize: '13px', margin: 0, textAlign: 'center' }}>
                  Sé el primero en comentar.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
