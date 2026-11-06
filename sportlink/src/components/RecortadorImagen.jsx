import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import { ASPECTOS } from './aspectosImagen.js'
import useVistaPrevia from './useVistaPrevia.js'
import './RecortadorImagen.css'

// Editor de recorte: se abre al elegir una foto. El usuario la mueve y le hace zoom
// dentro de un marco con la proporción final y confirma; se devuelve un File ya recortado.
// Sirve para clubes (logo 1:1, portada 2:1), pruebas, entrenamientos y foto de perfil.

const MAX_LADO = 1600

function cargarImagen(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('No se pudo leer la imagen'))
    img.src = url
  })
}

async function recortar(url, area, nombre) {
  const img = await cargarImagen(url)
  const escala = Math.min(1, MAX_LADO / Math.max(area.width, area.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(area.width * escala)
  canvas.height = Math.round(area.height * escala)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
  if (!blob) throw new Error('No se pudo generar la imagen')
  const base = (nombre || 'imagen').replace(/\.[^.]+$/, '')
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' })
}

export default function RecortadorImagen({ archivo, aspecto = ASPECTOS.tarjeta, titulo = 'Acomodá la imagen', onConfirmar, onCancelar }) {
  const url = useVistaPrevia(archivo)

  const [posicion, setPosicion] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const alTerminar = useCallback((_, pixeles) => setArea(pixeles), [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onCancelar() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onCancelar])

  const confirmar = async () => {
    if (!area || !url || guardando) return
    setGuardando(true)
    setError('')
    try {
      onConfirmar(await recortar(url, area, archivo.name))
    } catch (e) {
      setError(e.message || 'No se pudo recortar la imagen')
      setGuardando(false)
    }
  }

  return createPortal(
    <div className="rc-overlay" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="rc-modal">
        <h2 className="rc-titulo">{titulo}</h2>
        <p className="rc-ayuda">Arrastrá la imagen para moverla y usá el zoom. Lo que ves dentro del marco es lo que se va a mostrar.</p>

        <div className="rc-area">
          {url && <Cropper
            image={url}
            crop={posicion}
            zoom={zoom}
            aspect={aspecto}
            minZoom={1}
            maxZoom={4}
            zoomSpeed={0.4}
            showGrid
            onCropChange={setPosicion}
            onZoomChange={setZoom}
            onCropComplete={alTerminar}
          />}
        </div>

        <label className="rc-zoom">
          <span>Zoom</span>
          <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} aria-label="Zoom" />
        </label>

        {error && <p className="rc-error" role="alert">{error}</p>}

        <div className="rc-acciones">
          <button type="button" className="rc-btn rc-btn--sec" onClick={onCancelar} disabled={guardando}>Cancelar</button>
          <button type="button" className="rc-btn" onClick={confirmar} disabled={!area || guardando}>
            {guardando ? 'Procesando…' : 'Usar esta imagen'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
