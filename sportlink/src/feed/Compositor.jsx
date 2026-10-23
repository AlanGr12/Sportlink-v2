import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../axiosConfig.js'
import { SelectorEventos, TarjetaEvento } from '../components/EventoAdjunto.jsx'
import { puedeAdjuntarEventos } from '../utils/eventosAdjuntos.js'
import { FdAvatar } from './Publicacion.jsx'

// Caja para publicar arriba del feed (diseño nuevo). CrearPost.jsx queda para Mi perfil.

const CAMPO_EVENTO = { PRUEBA: 'idprueba', ENTRENAMIENTO: 'identrenamiento', EMPLEO: 'idempleo' }
const MAX = 1000

const IcoMedia = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
)
const IcoEvento = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export default function Compositor({ usuario, onPublicado, onAviso }) {
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [evento, setEvento] = useState(null)
  const [selector, setSelector] = useState(false)
  const [publicando, setPublicando] = useState(false)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)
  const fileRef = useRef(null)

  const puedeAdjuntar = puedeAdjuntarEventos(usuario)
  const puedePublicar = (texto.trim() || evento) && !publicando

  // El textarea crece con el texto hasta un tope
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`
  }, [texto])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const elegirArchivo = (e) => {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (f.size > 10 * 1024 * 1024) { setError('El archivo no puede superar los 10 MB.'); return }
    setError(null)
    setArchivo(f)
    setPreview(URL.createObjectURL(f))
  }

  const quitarArchivo = () => { setArchivo(null); setPreview(null) }

  const publicar = async () => {
    if (!puedePublicar) return
    setPublicando(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('contenido', texto.trim())
      fd.append('tipopublicacion', evento ? evento.tipo : 'NORMAL')
      if (evento) fd.append(CAMPO_EVENTO[evento.tipo], evento.id)
      if (archivo) fd.append('imagen', archivo)
      const { data } = await api.post('/api/publicaciones', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setTexto('')
      setEvento(null)
      quitarArchivo()
      onPublicado(data)
      onAviso?.('Publicado')
    } catch {
      setError('No se pudo publicar. Probá de nuevo.')
    } finally {
      setPublicando(false)
    }
  }

  const cerrarSelector = useCallback(() => setSelector(false), [])
  const esVideo = archivo?.type?.startsWith('video/')
  const cerca = texto.length > MAX * 0.8

  return (
    <section className="fd-compositor" aria-label="Crear publicación">
      <FdAvatar persona={usuario} />

      <div className="fd-compositor-body">
        <label className="fd-campo fd-campo--plano">
          <span className="pr-sr">¿Qué está pasando?</span>
          <textarea
            ref={textareaRef}
            rows={2}
            placeholder="¿Qué hay de nuevo en tu cancha?"
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) publicar() }}
          />
        </label>

        {preview && (
          <div className="fd-adjunto">
            {esVideo ? <video src={preview} controls /> : <img src={preview} alt="Vista previa del archivo" />}
            <button type="button" className="fd-adjunto-quitar" onClick={quitarArchivo} aria-label="Quitar archivo">×</button>
          </div>
        )}

        {evento && (
          <div className="fd-evento"><TarjetaEvento evento={evento} onQuitar={() => setEvento(null)} /></div>
        )}

        {error && <p className="pr-error">{error}</p>}

        <div className="fd-compositor-barra">
          <div className="fd-compositor-tools">
            <button type="button" className="fd-icono" onClick={() => fileRef.current?.click()} aria-label="Agregar foto o video" title="Foto o video">
              <IcoMedia />
            </button>
            {puedeAdjuntar && (
              <button type="button" className="fd-icono" onClick={() => setSelector(true)} aria-label="Adjuntar evento" title="Adjuntar prueba, entrenamiento o empleo">
                <IcoEvento />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={elegirArchivo} />
          </div>

          <div className="fd-compositor-enviar">
            {texto.length > 0 && <span className={`fd-contador${cerca ? ' is-cerca' : ''}`}>{texto.length}/{MAX}</span>}
            <button type="button" className="pr-btn pr-btn--sm" onClick={publicar} disabled={!puedePublicar}>
              {publicando ? 'Publicando…' : 'Publicar'}
            </button>
          </div>
        </div>
      </div>

      <SelectorEventos abierto={selector} onCerrar={cerrarSelector} onElegir={setEvento} />
    </section>
  )
}
