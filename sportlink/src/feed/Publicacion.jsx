import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import { normalizeAvatarUrl } from '../components/Avatar.jsx'
import ModalConfirmarEliminar from '../components/ModalConfirmarEliminar.jsx'
import { TarjetaEvento } from '../components/EventoAdjunto.jsx'
import UserHoverCard from '../components/UserHoverCard.jsx'
import { tiempoRelativo } from '../utils/dateUtils.js'
import { iniciales } from '../utils/formato.js'
import { ROLES, fechaDePost } from './feedUtils.js'

// Publicación del feed con el diseño nuevo (clases fd-*, ver Feed.css).
// PostCard.jsx sigue existiendo para Mi perfil, que todavía usa el diseño viejo.

const TIPOS = { PRUEBA: 'Prueba', ENTRENAMIENTO: 'Entrenamiento', EMPLEO: 'Empleo' }

const esVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url || '')

// Avatar cuadrado con foto o iniciales (mismo criterio que .pr-avatar)
export function FdAvatar({ persona, size = 48 }) {
  const [fallo, setFallo] = useState(false)
  const src = normalizeAvatarUrl(persona?.fotoperfil || persona?.logo)
  return (
    <span className="fd-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {src && !fallo ? <img src={src} alt="" onError={() => setFallo(true)} /> : iniciales(persona?.nombre || '?')}
    </span>
  )
}

// ─── Íconos (trazo 2px, heredan color) ─────────────────────
const Ico = ({ children, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)
const IcoResponder = () => <Ico><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Ico>
const IcoRepublicar = () => <Ico><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Ico>
const IcoLike = ({ lleno }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={lleno ? 'var(--slk-accent)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
)
const IcoEnlace = () => <Ico><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></Ico>
const IcoPuntos = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
)

// ─── Visor de imagen ────────────────────────────────────────
function VisorImagen({ src, onCerrar }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onCerrar])

  return createPortal(
    <div className="pr-overlay fd-visor" onClick={onCerrar}>
      <button type="button" className="pr-close fd-visor-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
      <img src={src} alt="Imagen de la publicación" onClick={(e) => e.stopPropagation()} />
    </div>,
    document.body
  )
}

// ─── Modal para responder ───────────────────────────────────
function ModalResponder({ post, usuario, onCerrar, onEnviado }) {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const ref = useRef(null)
  const MAX = 500

  useEffect(() => { ref.current?.focus() }, [])
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [onCerrar])

  const enviar = async () => {
    if (!usuario) { navigate('/login'); return }
    if (!texto.trim() || enviando) return
    setEnviando(true)
    setError(null)
    try {
      const { data } = await api.post(`/api/publicaciones/${post.idpublicacion}/comentarios`, { contenido: texto.trim() })
      onEnviado?.(data)
      onCerrar()
    } catch {
      setError('No se pudo enviar la respuesta. Probá de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return createPortal(
    <div className="pr-overlay" onClick={onCerrar}>
      <div className="pr-modal fd-modal" role="dialog" aria-modal="true" aria-labelledby="fd-responder-titulo" onClick={(e) => e.stopPropagation()}>
        <div className="pr-modal-head fd-modal-head">
          <h2 id="fd-responder-titulo" className="pr-modal-title">Responder</h2>
          <button type="button" className="pr-close" onClick={onCerrar} aria-label="Cerrar">×</button>
        </div>

        <div className="pr-modal-body fd-modal-body">
          <div className="fd-hilo">
            <div className="fd-hilo-col">
              <FdAvatar persona={post.autor} size={44} />
              <i className="fd-hilo-linea" />
            </div>
            <div className="fd-hilo-texto">
              <p className="fd-meta"><strong>{post.autor?.nombre || 'Usuario'}</strong> <span>· {tiempoRelativo(fechaDePost(post))}</span></p>
              {post.contenido && <p className="fd-hilo-cita">{post.contenido}</p>}
              <p className="fd-hilo-a">Respondiendo a <strong>{post.autor?.nombre || 'Usuario'}</strong></p>
            </div>
          </div>

          <div className="fd-hilo">
            <div className="fd-hilo-col"><FdAvatar persona={usuario} size={44} /></div>
            <label className="fd-campo">
              <span className="pr-sr">Tu respuesta</span>
              <textarea
                ref={ref}
                rows={4}
                maxLength={MAX}
                placeholder="Escribí tu respuesta"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); enviar() } }}
              />
              <small>{texto.length}/{MAX}</small>
            </label>
          </div>
          {error && <p className="pr-error">{error}</p>}
        </div>

        <div className="pr-modal-foot">
          <button type="button" className="pr-btn" onClick={enviar} disabled={!texto.trim() || enviando}>
            {enviando ? 'Respondiendo…' : 'Responder'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Publicación ────────────────────────────────────────────
export default function Publicacion({ post: postInicial, usuario, onEliminar, onAviso }) {
  const navigate = useNavigate()
  const [post, setPost] = useState(postInicial)
  const [reposts, setReposts] = useState(postInicial.republicaciones || 0)
  const [menu, setMenu] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState(null)
  const [respondiendo, setRespondiendo] = useState(false)
  const [visor, setVisor] = useState(null)
  const menuRef = useRef(null)

  const miId = usuario?.idusuario || usuario?.id
  const esMio = usuario && post.autor?.idusuario === miId
  const puedeEliminar = esMio || usuario?.es_admin === true
  const autorId = post.autor?.idusuario
  const rol = ROLES[post.autor?.tipousuario]
  // Si trae la tarjeta del evento, la etiqueta ya está ahí: no se repite arriba
  const tipo = post.tipopublicacion !== 'NORMAL' && !post.referencia ? TIPOS[post.tipopublicacion] : null

  useEffect(() => {
    if (!menu) return
    const fn = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menu])

  // Un visitante sin cuenta que intenta interactuar va al login
  const requiereLogin = () => {
    if (usuario) return false
    if (window.confirm('Necesitás una cuenta para hacer esto. ¿Querés iniciar sesión?')) navigate('/login')
    return true
  }

  const irAlPerfil = (e) => {
    e.stopPropagation()
    if (autorId) navigate(`/perfil/${autorId}`)
  }

  const abrir = (e) => {
    if (e.target.closest('button, a, textarea, input, video, [data-no-nav]')) return
    if (window.getSelection()?.toString()) return
    navigate(`/publicacion/${post.idpublicacion}`)
  }

  // Like optimista
  const darLike = async () => {
    if (requiereLogin()) return
    const ya = post.usuarioDioLike
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
    if (requiereLogin()) return
    setReposts((r) => r + 1)
  }

  // Copia el link de ESTA publicación, no la URL de la pestaña
  const copiarEnlace = () => {
    const url = `${window.location.origin}/publicacion/${post.idpublicacion}`
    navigator.clipboard?.writeText(url).then(() => onAviso?.('Enlace copiado'))
  }

  const confirmarEliminar = async () => {
    setEliminando(true)
    try {
      await api.delete(`/api/publicaciones/${post.idpublicacion}`)
      setConfirmando(false)
      onEliminar?.(post.idpublicacion)
    } catch {
      setErrorEliminar('No se pudo eliminar la publicación.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <article className="fd-post" onClick={abrir}>
      <UserHoverCard autor={post.autor} usuario={usuario}>
        <button type="button" className="fd-post-avatar" onClick={irAlPerfil} aria-label={`Ver perfil de ${post.autor?.nombre || 'usuario'}`}>
          <FdAvatar persona={post.autor} />
        </button>
      </UserHoverCard>

      <div className="fd-post-body">
        <header className="fd-post-head">
          <p className="fd-meta">
            <UserHoverCard autor={post.autor} usuario={usuario}>
              <button type="button" className="fd-nombre" onClick={irAlPerfil}>{post.autor?.nombre || 'Usuario'}</button>
            </UserHoverCard>
            {rol && <span>{rol}</span>}
            <span>· <time dateTime={fechaDePost(post)}>{tiempoRelativo(fechaDePost(post))}</time></span>
          </p>

          {tipo && <span className="pr-pill pr-pill--open fd-tipo">{tipo}</span>}

          {puedeEliminar && (
            <div className="fd-menu" ref={menuRef}>
              <button type="button" className="fd-icono" onClick={() => setMenu((v) => !v)} aria-label="Opciones" aria-expanded={menu}>
                <IcoPuntos />
              </button>
              {menu && (
                <div className="fd-menu-lista" role="menu">
                  <button type="button" role="menuitem" className="fd-menu-item fd-menu-item--peligro" onClick={() => { setMenu(false); setErrorEliminar(null); setConfirmando(true) }}>
                    Eliminar publicación
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {post.contenido && <p className="fd-texto">{post.contenido}</p>}

        {post.tipopublicacion !== 'NORMAL' && post.referencia && (
          <div className="fd-evento"><TarjetaEvento evento={post.referencia} /></div>
        )}

        {post.imagen && (
          <div className="fd-media" data-no-nav>
            {esVideo(post.imagen)
              ? <video src={post.imagen} controls preload="metadata" />
              : (
                <button type="button" className="fd-media-btn" onClick={() => setVisor(post.imagen)} aria-label="Ampliar imagen">
                  <img src={post.imagen} alt="" loading="lazy" />
                </button>
              )}
          </div>
        )}

        <div className="fd-acciones">
          <button type="button" className="fd-accion" onClick={() => { if (!requiereLogin()) setRespondiendo(true) }} aria-label="Responder" title="Responder">
            <IcoResponder />{post.totalComentarios > 0 && <span>{post.totalComentarios}</span>}
          </button>
          <button type="button" className="fd-accion" onClick={republicar} aria-label="Republicar" title="Republicar">
            <IcoRepublicar />{reposts > 0 && <span>{reposts}</span>}
          </button>
          <button
            type="button"
            className={`fd-accion${post.usuarioDioLike ? ' is-on' : ''}`}
            onClick={darLike}
            aria-label="Me gusta"
            aria-pressed={!!post.usuarioDioLike}
            title="Me gusta"
          >
            <IcoLike lleno={post.usuarioDioLike} />{post.totalLikes > 0 && <span>{post.totalLikes}</span>}
          </button>
          <button type="button" className="fd-accion" onClick={copiarEnlace} aria-label="Copiar enlace" title="Copiar enlace">
            <IcoEnlace />
          </button>
        </div>
      </div>

      {respondiendo && (
        <ModalResponder
          post={post}
          usuario={usuario}
          onCerrar={() => setRespondiendo(false)}
          onEnviado={() => setPost((p) => ({ ...p, totalComentarios: (p.totalComentarios || 0) + 1 }))}
        />
      )}

      {visor && <VisorImagen src={visor} onCerrar={() => setVisor(null)} />}

      <ModalConfirmarEliminar
        abierto={confirmando}
        titulo="¿Eliminar publicación?"
        mensaje={esMio ? 'Esta acción no se puede deshacer.' : 'Estás moderando como administrador. Esta acción no se puede deshacer.'}
        eliminando={eliminando}
        error={errorEliminar}
        onConfirmar={confirmarEliminar}
        onCerrar={() => setConfirmando(false)}
      />
    </article>
  )
}
