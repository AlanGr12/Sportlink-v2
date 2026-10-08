import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import './login.css'
import logoSportlink from '../assets/logoSportlink.png'
import Footer from '../footer/footer.jsx'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [clubPendienteData, setClubPendienteData] = useState(null)

  async function handleLogin() {
    if (!email || !contraseña) {
      setError('Por favor, completá todos los campos.')
      return
    }

    setCargando(true)
    setError('')

    try {
      // El backend devuelve { token, perfil } — lo pasamos completo a App.jsx
      const response = await api.post('/api/login', { email, contraseña })
      const data = response.data

      // Si es un club con estado PENDIENTE, mostrar pantalla informativa de revisión
      if (data?.perfil?.tipousuario === 'club' && data?.perfil?.estado === 'PENDIENTE') {
        setClubPendienteData(data)
        return
      }

      onLogin(data)  // App.actualizarUsuario desempaqueta token y perfil
      navigate('/')

    } catch (error) {
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

  if (clubPendienteData) {
    return (
      <div className="pagina">
        <img src={logoSportlink} alt="Sportlink" className="logo" />
        <div className="club-pendiente-card">
          <div className="club-pendiente-icon-wrapper">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="club-pendiente-titulo">Cuenta en Proceso de Revisión</h2>
          <p className="club-pendiente-texto">
            Tu cuenta de club está en proceso de revisión por el equipo de SportLink. Te notificaremos una vez aprobada.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={{ justifyContent: 'center', padding: '12px' }}
              onClick={() => {
                onLogin(clubPendienteData)
                navigate('/')
              }}
            >
              Continuar al feed en modo lectura
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              style={{ justifyContent: 'center', padding: '10px' }}
              onClick={() => setClubPendienteData(null)}
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
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