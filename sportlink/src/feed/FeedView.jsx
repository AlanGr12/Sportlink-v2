import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import api from '../axiosConfig.js'
import { PostCard, PostAcciones } from './PostCard.jsx'
import CrearPost from './CrearPost.jsx'
import './FeedView.css'

// ─── Referencia de post vinculado ────────────────────────────────────────────
function ReferenciaBloque({ tipo, ref: refData }) {
  if (!refData) return null
  let contenido = null
  if (tipo === 'PRUEBA') {
    contenido = (
      <>
        <strong>Prueba deportiva</strong>
        {refData.categoria && <span>· {refData.categoria}</span>}
        {refData.zona && <span>· {refData.zona}</span>}
      </>
    )
  } else if (tipo === 'ENTRENAMIENTO') {
    contenido = (
      <>
        <strong>{refData.titulo || 'Entrenamiento'}</strong>
        {refData.ubicacion && <span>· {refData.ubicacion}</span>}
        {refData.nivel && <span>· {refData.nivel}</span>}
      </>
    )
  } else if (tipo === 'EMPLEO') {
    contenido = (
      <>
        <strong>{refData.nombre || 'Empleo'}</strong>
        {refData.horasreq && <span>· {refData.horasreq}h</span>}
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

      {/* Imagen */}
      {post.imagen && (
        <div className="post-card-imagen">
          <img
            src={post.imagen}
            alt="Imagen de la publicación"
            onClick={() => setImagenModal(post.imagen)}
            loading="lazy"
          />
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

  // Stats para sidebar
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalComentarios: 0 })

  // Ref para el sentinel del scroll infinito
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

  // Carga inicial
  useEffect(() => {
    cargarPosts(1, true)
  }, [cargarPosts])

  // Scroll infinito con IntersectionObserver
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

  return (
    <div className="feed-pagina">
      <div className="feed-layout">
        {/* ── Columna principal ── */}
        <div className="feed-columna-principal">
          {/* Crear post (solo si hay sesión) */}
          {usuario && (
            <CrearPost usuario={usuario} onPostCreado={handlePostCreado} />
          )}

          {/* Posts */}
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

              {/* Sentinel para scroll infinito */}
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
        </div>

        {/* ── Sidebar ── */}
        <aside className="feed-sidebar">
          <div className="feed-sidebar-card">
            <p className="feed-sidebar-titulo">Actividad del feed</p>
            <div className="feed-sidebar-stat">
              <span className="feed-sidebar-stat-label">Publicaciones</span>
              <span className="feed-sidebar-stat-valor">{stats.totalPosts}</span>
            </div>
            <div className="feed-sidebar-stat">
              <span className="feed-sidebar-stat-label">Likes totales</span>
              <span className="feed-sidebar-stat-valor">{stats.totalLikes}</span>
            </div>
            <div className="feed-sidebar-stat">
              <span className="feed-sidebar-stat-label">Comentarios</span>
              <span className="feed-sidebar-stat-valor">{stats.totalComentarios}</span>
            </div>
          </div>

          <div className="feed-sidebar-card">
            <p className="feed-sidebar-titulo">Consejo</p>
            <p style={{ fontSize: '13px', color: '#8A9099', margin: 0, lineHeight: 1.6 }}>
              Compartí tu progreso, logros y entrenamientos para conectar con la comunidad deportiva de Sportlink.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
