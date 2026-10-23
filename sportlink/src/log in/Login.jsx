import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import api from '../axiosConfig.js'
import fotoIngreso from '../assets/jugador-10.jpg'
import '../pruebas/PruebasView.css'
import './Auth.css'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [codigoBloqueo, setCodigoBloqueo] = useState(location.state?.clubRegistrado ? 'CLUB_PENDIENTE' : '')

  async function handleLogin(e) {
    e?.preventDefault()
    if (cargando) return
    if (!email || !contraseña) {
      setError('Completá el email y la contraseña.')
      return
    }

    setCargando(true)
    setError('')
    setCodigoBloqueo('')

    try {
      // El backend devuelve { token, perfil } — lo pasamos completo a App.jsx
      const response = await api.post('/api/login', { email, contraseña })
      onLogin(response.data)  // App.actualizarUsuario desempaqueta token y perfil
      navigate('/')
    } catch (err) {
      const codigo = err.response?.data?.codigo
      if (codigo === 'CLUB_PENDIENTE' || codigo === 'CLUB_RECHAZADO') {
        setCodigoBloqueo(codigo)
        return
      }
      console.error(err)
      setError('El email o la contraseña no coinciden. Revisalos y probá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="pr au">
      <div className="au-grid">
        <div className="au-col">
          <div className="au-col-inner">
            <h1 className="pr-display au-titulo">Volviste a la cancha.</h1>
            <p className="au-lead">Ingresá para seguir con tus pruebas, entrenamientos y mensajes.</p>

            {codigoBloqueo === 'CLUB_PENDIENTE' && (
              <div className="au-aviso" role="status">
                <strong>Tu club está en revisión</strong>
                Lo registraste bien. El equipo de SportLink lo está revisando y te avisamos apenas quede habilitado.
              </div>
            )}
            {codigoBloqueo === 'CLUB_RECHAZADO' && (
              <div className="au-aviso au-aviso--error" role="alert">
                <strong>No pudimos aprobar tu club</strong>
                Si creés que es un error, escribinos a soporte.
              </div>
            )}

            <form className="au-form" onSubmit={handleLogin} noValidate>
              <label className="au-campo">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@correo.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  disabled={cargando}
                  aria-invalid={!!error}
                  autoFocus
                />
              </label>

              <label className="au-campo">
                <span>Contraseña</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={contraseña}
                  onChange={(e) => { setContraseña(e.target.value); setError('') }}
                  disabled={cargando}
                  aria-invalid={!!error}
                />
              </label>

              <div className="au-fila-link">
                <a className="pr-link" href="/recuperar">¿Olvidaste tu contraseña?</a>
              </div>

              {error && <p className="pr-error" role="alert">{error}</p>}

              <button type="submit" className="pr-btn pr-btn--block au-enviar" disabled={cargando}>
                {cargando ? 'Ingresando…' : 'Ingresar'}
                {!cargando && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                )}
              </button>
            </form>

            <p className="au-pie">
              ¿Todavía no tenés cuenta? <Link className="pr-link" to="/registro">Registrate</Link>
            </p>
          </div>
        </div>

        <figure className="au-media">
          <div className="au-media-frame">
            <img src={fotoIngreso} alt="Un jugador con la camiseta número 10 de espaldas en la cancha" style={{ objectPosition: '50% 40%' }} />
          </div>
        </figure>
      </div>
    </div>
  )
}

export default Login
