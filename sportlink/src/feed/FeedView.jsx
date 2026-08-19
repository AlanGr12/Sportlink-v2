import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import api from '../axiosConfig.js'
import { PostCard, PostAcciones } from './PostCard.jsx'
import CrearPost from './CrearPost.jsx'
import Avatar from '../components/Avatar.jsx'
import './FeedView.css'

// ─── Referencia de post vinculado ────────────────────────────────────────────
function ReferenciaBloque({ tipo, ref: refData }) {
  if (!refData) return null
  let contenido = null
  if (tipo === 'PRUEBA') {
    contenido = (
      <>
        <strong>Prueba deportiva</strong>
        {refData.categoria && <span> · {refData.categoria}</span>}
        {refData.zona && <span> · {refData.zona}</span>}
      </>
    )
  } else if (tipo === 'ENTRENAMIENTO') {
    contenido = (
      <>
        <strong>{refData.titulo || 'Entrenamiento'}</strong>
        {refData.ubicacion && <span> · {refData.ubicacion}</span>}
        {refData.nivel && <span> · {refData.nivel}</span>}
      </>
    )
  } else if (tipo === 'EMPLEO') {
    contenido = (
      <>
        <strong>{refData.nombre || 'Empleo'}</strong>
        {refData.horasreq && <span> · {refData.horasreq}h</span>}
      </>
    )
  }
  if (!contenido) return null
  return <div className="post-referencia-bloque">{contenido}</div>
}

// ─── Modal de imagen ampliada ────────────────────────────────────────────────
function ModalImagen({ src, onClose }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onClose])

  return createPortal(
    <div className="feed-modal-imagen" onClick={onClose}>
      <button className="feed-modal-imagen-close" onClick={onClose}>✕</button>
      <img src={src} alt="Imagen ampliada" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  )
}

// ─── Tarjeta completa (PostCard + PostAcciones juntas) ───────────────────────
function PostCompleto({ post, usuario, onEliminar }) {
  const [imagenModal, setImagenModal] = useState(null)

  return (
    <article className="post-card">
      {/* Encabezado del post (autor, menú) */}
      <PostCard
        post={post}
        usuario={usuario}
        onImagenClick={setImagenModal}
        onEliminar={onEliminar}
      />

      {/* Texto */}
      {post.contenido && (
        <div className="post-card-contenido">{post.contenido}</div>
      )}

      {/* Referencia vinculada */}
      {post.tipopublicacion !== 'NORMAL' && post.referencia && (
        <ReferenciaBloque tipo={post.tipopublicacion} ref={post.referencia} />
      )}

      {/* Media (Imagen o Video) */}
      {post.imagen && (
        <div className="post-card-imagen">
          {post.imagen.match(/\.(mp4|webm|ogg)$/i) ? (
            <video src={post.imagen} controls className="post-media-video" />
          ) : (
            <img
              src={post.imagen}
              alt="Publicación"
              onClick={() => setImagenModal(post.imagen)}
              loading="lazy"
            />
          )}
        </div>
      )}

      {/* Acciones: likes + comentarios */}
      <PostAcciones post={post} usuario={usuario} />

      {/* Modal imagen */}
      {imagenModal && <ModalImagen src={imagenModal} onClose={() => setImagenModal(null)} />}
    </article>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISTA PRINCIPAL: FeedView
// ═══════════════════════════════════════════════════════════════════════════════
export default function FeedView({ usuario }) {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMas, setLoadingMas] = useState(false)
  const [hayMas, setHayMas] = useState(true)

  // Stats
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComentarios: 0 })

  // Datos dinámicos para sidebars (según backend)
  const [seguidos, setSeguidos] = useState(usuario?.seguidos || [])
  const [recomendaciones, setRecomendaciones] = useState([])
  const [noticias, setNoticias] = useState([]) // vacías si no hay API de noticias

  const sentinelRef = useRef(null)

  const cargarPosts = useCallback(async (pagina = 1, reemplazar = false) => {
    if (pagina === 1) setLoading(true)
    else setLoadingMas(true)
    try {
      const { data } = await api.get('/api/publicaciones', { params: { page: pagina, limit: 10 } })
      const nuevos = data.publicaciones || []
      setPosts(prev => reemplazar ? nuevos : [...prev, ...nuevos])
      setTotalPaginas(data.totalPaginas || 1)
      setHayMas(pagina < (data.totalPaginas || 1))
      if (pagina === 1) {
        setStats({
          totalPosts: data.totalItems || 0,
          totalLikes: nuevos.reduce((a, p) => a + (p.totalLikes || 0), 0),
          totalComentarios: nuevos.reduce((a, p) => a + (p.totalComentarios || 0), 0),
        })
      }
    } catch (err) {
      console.error('Error cargando feed:', err)
    } finally {
      setLoading(false)
      setLoadingMas(false)
    }
  }, [])

  // Cargar datos dinámicos recomendados desde el backend si existen
  useEffect(() => {
    cargarPosts(1, true)

    const cargarRecomendaciones = async () => {
      try {
        const miId = usuario?.idusuario || usuario?.id
        const res = await api.get('/api/jugadores')
        if (Array.isArray(res.data)) {
          const filtrados = res.data
            .filter(j => Number(j.idusuario) !== Number(miId))
            .slice(0, 3)
          setRecomendaciones(filtrados)
        }
      } catch {
        // En caso de que no devuelva datos o falle
        setRecomendaciones([])
      }
    }

    cargarRecomendaciones()
  }, [cargarPosts, usuario])

  // Scroll infinito
  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hayMas && !loadingMas && !loading) {
          const siguientePagina = page + 1
          setPage(siguientePagina)
          cargarPosts(siguientePagina)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hayMas, loadingMas, loading, page, cargarPosts])

  const handlePostCreado = (nuevoPost) => {
    setPosts(prev => [nuevoPost, ...prev])
    setStats(prev => ({ ...prev, totalPosts: prev.totalPosts + 1 }))
  }

  const handleEliminarPost = (idpublicacion) => {
    setPosts(prev => prev.filter(p => p.idpublicacion !== idpublicacion))
    setStats(prev => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }))
  }

  // Traducción del tipo de usuario
  const rolUsuario = usuario?.tipousuario === 'jugador'
    ? 'Atleta Profesional'
    : usuario?.tipousuario === 'entrenador'
      ? 'Entrenador Elite'
      : usuario?.tipousuario === 'club'
        ? 'Club Deportivo'
        : usuario?.tipousuario || 'Miembro de SportLink'

  return (
    <div className="feed-pagina">
      <div className="feed-layout">
        {/* ════ Columna Izquierda: Perfil + Seguidos ════ */}
        <aside className="feed-sidebar-izquierda">
          {/* Card Resumen Perfil */}
          <div className="feed-profile-card">
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
                <span className="feed-stat-value">{usuario?.vistasPerfil ?? stats.totalPosts ?? 0}</span>
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

        {/* ════ Columna Central: Publicar + Feed ════ */}
        <main className="feed-columna-principal">
          {usuario && (
            <CrearPost usuario={usuario} onPostCreado={handlePostCreado} />
          )}

          {loading ? (
            <div className="feed-spinner-wrapper">
              <div className="feed-spinner" />
            </div>
          ) : posts.length === 0 ? (
            <div className="feed-vacio">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <h3>El feed está vacío</h3>
              <p>Sé el primero en publicar algo.</p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCompleto
                  key={post.idpublicacion}
                  post={post}
                  usuario={usuario}
                  onEliminar={handleEliminarPost}
                />
              ))}

              <div ref={sentinelRef} />

              {loadingMas && (
                <div className="feed-spinner-wrapper">
                  <div className="feed-spinner" />
                </div>
              )}

              {!hayMas && posts.length > 0 && (
                <div className="feed-fin">Ya viste todo</div>
              )}
            </>
          )}
        </main>

        {/* ════ Columna Derecha: Recomendados + Noticias ════ */}
        <aside className="feed-sidebar-derecha">
          {/* Recomendado para ti */}
          <div className="feed-sidebar-card">
            <h4 className="feed-sidebar-header-title">RECOMENDADO PARA TI</h4>
            {recomendaciones && recomendaciones.length > 0 ? (
              <div className="feed-recomendados-lista">
                {recomendaciones.map((rec) => (
                  <div key={rec.idjugador || rec.idusuario} className="feed-recomendado-item">
                    <Avatar src={rec.fotoperfil} nombre={rec.nombre || 'Usuario'} size={40} />
                    <div className="feed-recomendado-info">
                      <span className="feed-recomendado-nombre">{rec.nombre}</span>
                      <span className="feed-recomendado-sub">{rec.posicion || rec.deporte || 'Deportista'}</span>
                    </div>
                    <button className="feed-btn-conectar">Conectar</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="feed-vacio-box">Sin recomendaciones por el momento</div>
            )}
          </div>

          {/* Noticias deportivas */}
          <div className="feed-sidebar-card">
            <h4 className="feed-sidebar-header-title">NOTICIAS DEPORTIVAS</h4>
            {noticias && noticias.length > 0 ? (
              <div className="feed-noticias-lista">
                {noticias.map((item, idx) => (
                  <div key={idx} className="feed-noticia-item">
                    <h5>{item.titulo}</h5>
                    <p>{item.subtitulo}</p>
                  </div>
                ))}
                <button className="feed-mostrar-mas-btn">Mostrar más ∨</button>
              </div>
            ) : (
              <div className="feed-vacio-box">Sin noticias por el momento</div>
            )}
          </div>

          {/* Footer links */}
          <footer className="feed-footer-links">
            <div className="feed-footer-row">
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
  )
}

