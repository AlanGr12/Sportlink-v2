import React, { useState, useRef, useCallback } from 'react'
import Avatar from '../components/Avatar.jsx'
import api from '../axiosConfig.js'
import { SelectorEventos, TarjetaEvento } from '../components/EventoAdjunto.jsx'
import { puedeAdjuntarEventos } from '../utils/eventosAdjuntos.js'

// Campo de la publicación que referencia a cada tipo de evento
const CAMPO_EVENTO = { PRUEBA: 'idprueba', ENTRENAMIENTO: 'identrenamiento', EMPLEO: 'idempleo' }

const IcoPhoto = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21 15 16 10 5 21"/>
  </svg>
)

const IcoVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
)

const IcoEvent = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const IcoArticle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DEFF2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)

export default function CrearPost({ usuario, onPostCreado }) {
  const [expandido, setExpandido] = useState(false)
  const [contenido, setContenido] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [publicando, setPublicando] = useState(false)
  const [evento, setEvento] = useState(null)
  const [selectorAbierto, setSelectorAbierto] = useState(false)
  const fileInputRef = useRef(null)
  const puedeAdjuntar = puedeAdjuntarEventos(usuario)
  const puedePublicar = (contenido.trim() || evento) && !publicando
  const MAX_CHARS = 1000

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10MB.')
      return
    }
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
    setExpandido(true)
    e.target.value = ''
  }

  const quitarImagen = () => {
    setImagenFile(null)
    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagenPreview(null)
  }

  const handlePublicar = async () => {
    if (!puedePublicar) return
    setPublicando(true)
    try {
      const formData = new FormData()
      formData.append('contenido', contenido.trim())
      formData.append('tipopublicacion', evento ? evento.tipo : 'NORMAL')
      if (evento) formData.append(CAMPO_EVENTO[evento.tipo], evento.id)
      if (imagenFile) formData.append('imagen', imagenFile)

      const { data } = await api.post('/api/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setContenido('')
      setEvento(null)
      quitarImagen()
      setExpandido(false)
      onPostCreado(data)
    } catch (err) {
      console.error('Error al publicar:', err)
      alert('No se pudo publicar. Intentá de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  const cerrarSelector = useCallback(() => setSelectorAbierto(false), [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handlePublicar()
  }

  const nombre = usuario?.nombre || usuario?.email || 'Yo'
  const cerca = contenido.length > MAX_CHARS * 0.8

  return (
    <div className="crear-post-card">
      <div className="crear-post-fila-superior">
        <Avatar src={usuario?.fotoperfil} nombre={nombre} size={44} />
        <div className="crear-post-textarea-wrapper" onClick={() => setExpandido(true)}>
          {!expandido && !contenido && !imagenPreview && !evento ? (
            <div className="crear-post-input-fake">
              Comparte tus últimas estadísticas o novedades...
            </div>
          ) : (
            <textarea
              className="crear-post-textarea"
              placeholder="Comparte tus últimas estadísticas o novedades..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={handleKeyDown}
              rows={expandido ? 3 : 2}
              autoFocus={expandido}
            />
          )}

          {imagenPreview && (
            <div className="crear-post-imagen-preview">
              <img src={imagenPreview} alt="Preview" />
              <button
                className="crear-post-imagen-remove"
                onClick={(e) => { e.stopPropagation(); quitarImagen() }}
                title="Quitar archivo"
              >
                ✕
              </button>
            </div>
          )}

          {evento && (
            <div className="crear-post-evento-preview">
              <TarjetaEvento evento={evento} onQuitar={() => setEvento(null)} />
            </div>
          )}
        </div>
      </div>

      <div className="crear-post-fila-acciones">
        <div className="crear-post-media-opciones">
          <button
            type="button"
            className="crear-post-btn-media"
            onClick={() => { setExpandido(true); fileInputRef.current?.click() }}
            aria-label="Foto"
          >
            <IcoPhoto />
            <span className="crear-post-tooltip">Foto</span>
          </button>

          <button
            type="button"
            className="crear-post-btn-media"
            onClick={() => { setExpandido(true); fileInputRef.current?.click() }}
            aria-label="Video"
          >
            <IcoVideo />
            <span className="crear-post-tooltip">Video</span>
          </button>

          {puedeAdjuntar && (
            <button
              type="button"
              className="crear-post-btn-media"
              onClick={() => { setExpandido(true); setSelectorAbierto(true) }}
              aria-label="Adjuntar evento"
            >
              <IcoEvent />
              <span className="crear-post-tooltip">Evento</span>
            </button>
          )}

          <button
            type="button"
            className="crear-post-btn-media"
            onClick={() => setExpandido(true)}
            aria-label="Artículo"
          >
            <IcoArticle />
            <span className="crear-post-tooltip">Artículo</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleImagenChange}
        />

        {(expandido || contenido.length > 0 || imagenPreview || evento) && (
          <div className="crear-post-botones-derecha">
            {contenido.length > 0 && (
              <span className={`crear-post-contador${cerca ? ' cerca' : ''}`}>
                {contenido.length}/{MAX_CHARS}
              </span>
            )}
            <button
              className="crear-post-btn-publicar"
              onClick={handlePublicar}
              disabled={!puedePublicar}
            >
              {publicando ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        )}
      </div>

      <SelectorEventos
        abierto={selectorAbierto}
        onCerrar={cerrarSelector}
        onElegir={setEvento}
      />
    </div>
  )
}

