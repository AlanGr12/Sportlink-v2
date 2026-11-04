import { Link } from 'react-router-dom'
import { EDAD_MINIMA } from './datosNegocio.js'
import './legal.css'

// Casillas del registro. Ninguna viene tildada de antemano (consentimiento explícito).
export default function Consentimientos({ valor, onCambiar, error }) {
  const set = (k) => (e) => onCambiar({ ...valor, [k]: e.target.checked })
  return (
    <div className="cs">
      <label className="cs-item">
        <input type="checkbox" checked={!!valor.terminos} onChange={set('terminos')} aria-invalid={!!error && !valor.terminos} />
        <span>
          Leí y acepto los <Link to="/legal/terminos" target="_blank">términos y condiciones</Link> y la{' '}
          <Link to="/legal/privacidad" target="_blank">política de privacidad</Link>.
        </span>
      </label>
      <label className="cs-item">
        <input type="checkbox" checked={!!valor.edad} onChange={set('edad')} aria-invalid={!!error && !valor.edad} />
        <span>
          Tengo {EDAD_MINIMA} años o más. Si soy menor de 18, tengo la autorización de mi madre, padre o tutor.
        </span>
      </label>
      {error && <small className="au-error" role="alert">{error}</small>}
    </div>
  )
}
