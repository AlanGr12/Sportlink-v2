import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import Avatar from '../components/Avatar.jsx'
import api from '../axiosConfig.js'

function tiempoRelativo(fechaStr) {
  if (!fechaStr) return ''
  const diff = (Date.now() - new Date(fechaStr).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`
  return new Date(fechaStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

// ─── Íconos SVG estilo Twitter/X ───────────────────────────
const IcoClose = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IcoMediaImage = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const IcoGif = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M7 12h2v-2H7v4h2v-1"/>
    <path d="M13 10v4"/>
    <path d="M16 10v4h2"/>
    <path d="M16 12h2"/>
  </svg>
)

const IcoPoll = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const IcoEmoji = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <line x1="9" y1="9" x2="9.01" y2="9"/>
    <line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
)

const IcoCalendar = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IcoLocation = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

export default function ModalComentarPost({ post, usuario, onClose, onComentarioEnviado }) {
  const navigate = useNavigate()
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const textareaRef = useRef(null)

  // Enfocar textarea automáticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Tecla Escape para cerrar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!post) return null

  const handleEnviar = async () => {
    if (!usuario) {
      if (window.confirm('Necesitás iniciar sesión para comentar. ¿Querés ir a la página de login?')) {
        navigate('/login')
      }
      return
    }

    if (!contenido.trim() || enviando) return

    setEnviando(true)
    try {
      const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/comentarios`, {
        contenido: contenido.trim()
      })
      if (onComentarioEnviado) {
        onComentarioEnviado(data)
      }
      onClose()
    } catch (err) {
      console.error('Error enviando comentario:', err)
      alert('No se pudo enviar el comentario. Intentá nuevamente.')
    } finally {
      setEnviando(false)
    }
  }

  const autorNombre = post.autor?.nombre || 'Usuario'
  const miNombre = usuario?.nombre || usuario?.email || 'Yo'

  return createPortal(
    <div className="reply-modal-backdrop" onClick={onClose}>
      <div className="reply-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del modal */}
        <div className="reply-modal-header">
          <button className="reply-modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <IcoClose />
          </button>
          <span className="reply-modal-drafts">Borradores</span>
        </div>

        {/* Cuerpo del modal */}
        <div className="reply-modal-body">
          {/* Fila 1: Publicación original siendo respondida */}
          <div className="reply-modal-post-row">
            <div className="reply-modal-avatar-col">
              <Avatar src={post.autor?.fotoperfil} nombre={autorNombre} size={42} />
              {/* Línea conectora de hilo (Thread line vertical) */}
              <div className="reply-modal-thread-line" />
            </div>

            <div className="reply-modal-content-col">
              <div className="reply-modal-author-header">
                <span className="reply-modal-author-name">{autorNombre}</span>
                {post.autor?.tipousuario && (
                  <span className="reply-modal-author-role">· {post.autor.tipousuario}</span>
                )}
                <span className="reply-modal-time">· {tiempoRelativo(post.createdat)}</span>
              </div>

              {post.contenido && (
                <p className="reply-modal-post-text">{post.contenido}</p>
              )}

              {post.imagen && (
                <div className="reply-modal-media-preview">
                  {post.imagen.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={post.imagen} className="reply-modal-media" />
                  ) : (
                    <img src={post.imagen} alt="Publicación previa" className="reply-modal-media" />
                  )}
                </div>
              )}

              <div className="reply-modal-replying-to">
                Respondiendo a <span className="reply-modal-mention">@{autorNombre.toLowerCase().replace(/\s+/g, '')}</span>
              </div>
            </div>
          </div>

          {/* Fila 2: Input de respuesta del usuario actual */}
          <div className="reply-modal-reply-row">
            <div className="reply-modal-avatar-col">
              <Avatar src={usuario?.fotoperfil} nombre={miNombre} size={42} />
            </div>

            <div className="reply-modal-content-col">
              <textarea
                ref={textareaRef}
                className="reply-modal-textarea"
                placeholder="Postea tu respuesta"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault()
                    handleEnviar()
                  }
                }}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="reply-modal-footer">
          <div className="reply-modal-toolbar">
            <button className="reply-modal-tool-btn" title="Media / Imagen">
              <IcoMediaImage />
            </button>
            <button className="reply-modal-tool-btn" title="GIF">
              <IcoGif />
            </button>
            <button className="reply-modal-tool-btn" title="Encuesta">
              <IcoPoll />
            </button>
            <button className="reply-modal-tool-btn" title="Emoji">
              <IcoEmoji />
            </button>
            <button className="reply-modal-tool-btn" title="Programar">
              <IcoCalendar />
            </button>
            <button className="reply-modal-tool-btn" title="Ubicación">
              <IcoLocation />
            </button>
          </div>

          <button
            className="reply-modal-submit-btn"
            onClick={handleEnviar}
            disabled={!contenido.trim() || enviando}
          >
            {enviando ? 'Respondiendo...' : 'Responder'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
