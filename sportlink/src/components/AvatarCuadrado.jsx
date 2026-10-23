import { useState } from 'react'
import { normalizeAvatarUrl } from './Avatar.jsx'
import { iniciales } from '../utils/formato.js'
import './AvatarCuadrado.css'

// Avatar del diseño nuevo: cuadrado, con foto o iniciales (mismo criterio que .pr-avatar)
export default function AvatarCuadrado({ src, nombre = '', size = 48 }) {
  const [fallo, setFallo] = useState(false)
  const url = normalizeAvatarUrl(src)
  return (
    <span className="slk-avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {url && !fallo ? <img src={url} alt="" onError={() => setFallo(true)} /> : iniciales(nombre || '?')}
    </span>
  )
}
