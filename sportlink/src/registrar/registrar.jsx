import { useState } from 'react'
import { AvisoError } from './CamposRegistro.jsx'

// Paso 2 del registro: email y contraseña de la cuenta
function Registrar({ datosIniciales = {}, onSiguiente }) {
  const [email, setEmail] = useState(datosIniciales.email || '')
  const [contraseña, setContraseña] = useState(datosIniciales.contraseña || '')
  const [confirmar, setConfirmar] = useState(datosIniciales.contraseña || '')
  const [error, setError] = useState('')

  function handleSiguiente(e) {
    e.preventDefault()
    if (!email || !contraseña || !confirmar) {
      setError('Completá los tres campos.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Revisá el email: parece que le falta algo.')
      return
    }
    if (contraseña !== confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    onSiguiente({ email, contraseña })
  }

  const limpiar = (fn) => (e) => { fn(e.target.value); setError('') }

  return (
    <form className="au-form" onSubmit={handleSiguiente} noValidate>
      <label className="au-campo">
        <span>Email</span>
        <input type="email" autoComplete="email" placeholder="nombre@correo.com" value={email} onChange={limpiar(setEmail)} autoFocus />
      </label>
      <label className="au-campo">
        <span>Contraseña</span>
        <input type="password" autoComplete="new-password" placeholder="Elegí una contraseña" value={contraseña} onChange={limpiar(setContraseña)} />
      </label>
      <label className="au-campo">
        <span>Repetí la contraseña</span>
        <input type="password" autoComplete="new-password" placeholder="La misma de arriba" value={confirmar} onChange={limpiar(setConfirmar)} aria-invalid={error === 'Las contraseñas no coinciden.'} />
      </label>

      <AvisoError texto={error} />
      <button type="submit" className="pr-btn pr-btn--block au-enviar">
        Seguir
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
      </button>
    </form>
  )
}

export default Registrar
