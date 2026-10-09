import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../axiosConfig.js'
import './login.css'
import logoSportlink from '../assets/logoSportlink.png'
import Footer from '../footer/footer.jsx'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [codigoBloqueo, setCodigoBloqueo] = useState(location.state?.clubRegistrado ? 'CLUB_PENDIENTE' : '')

  async function handleLogin() {
    if (!email || !contraseña) {
      setError('Por favor, completá todos los campos.')
      return
    }

    setCargando(true)
    setError('')
    setCodigoBloqueo('')

    try {
      // El backend devuelve { token, perfil } — lo pasamos completo a App.jsx
      const response = await api.post('/api/login', { email, contraseña })
      const data = response.data

      onLogin(data)  // App.actualizarUsuario desempaqueta token y perfil
      navigate('/')

    } catch (error) {
      const codigo = error.response?.data?.codigo
      if (codigo === 'CLUB_PENDIENTE' || codigo === 'CLUB_RECHAZADO') {
        setCodigoBloqueo(codigo)
        return
      }
      console.error(error)
      setError('Email o contraseña incorrectos. Por favor, verifica tus datos.')
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!cargando) {
        handleLogin()
      }
    }
  }

  return (
    <>
      {/* SE QUITÓ EL <Header /> DE ACÁ PORQUE AHORA VIENE DESDE APP.JSX */}
      <div className="pagina">
        <img
          src={logoSportlink}
          alt="Sportlink"
          className="logo"
        />

        <div className="tarjeta">
          <h1 className="titulo">
            ¡Bienvenido de vuelta!
          </h1>

          <p className="subtitulo">
            Inicio de sesión.
          </p>

          {/* Banner de error profesional */}
          {error && (
            <div className="login-error-banner">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {codigoBloqueo === 'CLUB_PENDIENTE' && (
            <div className="login-pendiente-banner" role="status">
              <span className="login-pendiente-icono">⏳</span>
              <div>
                <strong>Cuenta en proceso de revisión</strong>
                <p>
                  Tu cuenta de club fue registrada con éxito y actualmente está siendo revisada por el equipo de
                  SportLink para ser aprobada. Te notificaremos en cuanto tu acceso sea habilitado.
                </p>
              </div>
            </div>
          )}

          {codigoBloqueo === 'CLUB_RECHAZADO' && (
            <div className="login-error-banner" role="alert">
              <span>
                La solicitud de tu club no fue admitida por el equipo de SportLink. Si creés que se trata de un
                error, contactá a soporte.
              </span>
            </div>
          )}

          <label className="etiqueta">
            EMAIL
          </label>

          <input
            className="campo"
            type="email"
            placeholder="user@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={cargando}
          />

          <label className="etiqueta">
            CONTRASEÑA
          </label>

          <input
            className="campo"
            type="password"
            placeholder="••••••••"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={cargando}
          />

          <button
            className="boton"
            onClick={handleLogin}
            disabled={cargando}
          >
            {cargando ? 'INICIANDO...' : 'INICIAR SESIÓN'}
          </button>

          <p className="pie">
            No tenés cuenta?{' '}
            <a
              className="enlace"
              onClick={cargando ? undefined : () => navigate('/registro')}
              style={{ cursor: cargando ? 'not-allowed' : 'pointer' }}
            >
              Registrate
            </a>
          </p>

          <a
            className="enlace-secundario"
            href="/recuperar"
            style={{ pointerEvents: cargando ? 'none' : 'auto', opacity: cargando ? 0.5 : 0.8 }}
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default Login