import { useState } from 'react'
import axios from 'axios'
import './login.css'
import logoSportlink from '../assets/logoSportlink.png'
import Footer from '../footer/footer.jsx'

function Login({ onLogin, onRegistro }) {
  const [email, setEmail] = useState('')
  const [contraseña, setContraseña] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !contraseña) {
      setError('Por favor, completá todos los campos.')
      return
    }

    setCargando(true)
    setError('')

    try {
      const response = await axios.post(
        'http://localhost:3000/api/login',
        {
          email,
          contraseña
        }
      )

      onLogin(response.data)

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
              onClick={cargando ? null : onRegistro}
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