import { useState } from 'react'
import { Link } from 'react-router-dom'
import './legal.css'

const CLAVE = 'slk-cookies'
const yaVisto = () => {
  try { return !!localStorage.getItem(CLAVE) } catch { return false }
}

// Aviso de almacenamiento. Hoy solo hay almacenamiento esencial (sesión y tema), sin analítica
// ni publicidad: por eso no hay un "rechazar" que no cambie nada. Si se suma analítica,
// agregar acá los botones Aceptar / Rechazar y cargar el script solo tras aceptar.
export default function BannerCookies() {
  const [visible, setVisible] = useState(() => !yaVisto())
  if (!visible) return null

  const cerrar = () => {
    try { localStorage.setItem(CLAVE, new Date().toISOString()) } catch { /* sin storage */ }
    setVisible(false)
  }

  return (
    <div className="ck" role="region" aria-label="Aviso de cookies">
      <div className="ck-in">
        <p className="ck-txt">
          Guardamos en tu navegador lo mínimo para mantener tu sesión y recordar tu tema. No usamos cookies de publicidad ni de seguimiento.{' '}
          <Link to="/legal/cookies">Más información</Link>
        </p>
        <div className="ck-acc">
          <button type="button" className="pr-btn" onClick={cerrar}>Entendido</button>
        </div>
      </div>
    </div>
  )
}
