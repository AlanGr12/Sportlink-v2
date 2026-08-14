import React, { useState, useRef } from 'react'
import Avatar from '../components/Avatar.jsx'
import api from '../axiosConfig.js'

export default function CrearPost({ usuario, onPostCreado }) {
  const [contenido, setContenido] = useState('')
  const [imagenFile, setImagenFile] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [publicando, setPublicando] = useState(false)
  const fileInputRef = useRef(null)
  const MAX_CHARS = 1000

  const handleImagenChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar los 5MB.')
      return
    }
    setImagenFile(file)
    setImagenPreview(URL.createObjectURL(file))
    // reset input para permitir re-seleccionar el mismo archivo
    e.target.value = ''
  }

  const quitarImagen = () => {
    setImagenFile(null)
    if (imagenPreview) URL.revokeObjectURL(imagenPreview)
    setImagenPreview(null)
  }

  const handlePublicar = async () => {
    if (!contenido.trim() || publicando) return
    setPublicando(true)
    try {
      const formData = new FormData()
      formData.append('contenido', contenido.trim())
      formData.append('tipopublicacion', 'NORMAL')
      if (imagenFile) formData.append('imagen', imagenFile)

      const { data } = await api.post('/api/publicaciones', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setContenido('')
      quitarImagen()
      onPostCreado(data)
    } catch (err) {
      console.error('Error al publicar:', err)
      alert('No se pudo publicar. Intentá de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) handlePublicar()
  }

  const nombre = usuario?.nombre || usuario?.email || 'Yo'
  const cerca = contenido.length > MAX_CHARS * 0.8

  return (
    <div className="crear-post-card">
      <div className="crear-post-fila-superior">
        <Avatar src={usuario?.fotoperfil} nombre={nombre} size={40} />
        <div className="crear-post-textarea-wrapper">
          <textarea
            className="crear-post-textarea"
            placeholder="¿Qué querés compartir hoy?"
            value={contenido}
            onChange={(e) => setContenido(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          {imagenPreview && (
            <div className="crear-post-imagen-preview">
              <img src={imagenPreview} alt="Preview" />
              <button
                className="crear-post-imagen-remove"
                onClick={quitarImagen}
                title="Quitar imagen"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <hr className="crear-post-divisor" />

      <div className="crear-post-fila-acciones">
        {/* Botón adjuntar imagen */}
        <button
          className="crear-post-btn-media"
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar imagen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          Imagen
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleImagenChange}
        />

        <div className="crear-post-botones-derecha">
          {contenido.length > 0 && (
            <span className={`crear-post-contador${cerca ? ' cerca' : ''}`}>
              {contenido.length}/{MAX_CHARS}
            </span>
          )}
          <button
            className="crear-post-btn-publicar"
            onClick={handlePublicar}
            disabled={!contenido.trim() || publicando}
          >
            {publicando ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
