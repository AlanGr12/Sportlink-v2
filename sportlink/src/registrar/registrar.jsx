import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './registrar.css'
import logoSportlink from '../assets/logoSportlink.png'
import Footer from '../footer/footer.jsx'

function Registrar({ onSiguiente }) {
  const navigate = useNavigate()
  const [contraseña, setContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSiguiente() {
    if (!email || !contraseña || !confirmarContraseña) {
      setError('Por favor completá todos los campos.')
      return
    }
    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError('')
    onSiguiente({ email, contraseña })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSiguiente()
    }
  }

  return (
    <>
      <div className="pagina">
        <img
          src={logoSportlink}
          alt="Sportlink"
          className="logo"
        />

        <div className="tarjeta">

          <div className="sr-step-container">
            <span className="sr-step-text">PASO 1 / 3</span>
            <div className="sr-step-track">
              <div className="sr-step-bar sr-step-bar--active"></div>
              <div className="sr-step-bar"></div>
              <div className="sr-step-bar"></div>
            </div>
          </div>

          <h1 className="titulo">
            Creá tu cuenta
          </h1>

          <p className="subtitulo">
            Registro de usuario.
          </p>

          {/* Banner de error profesional */}
          {error && (
            <div className="registrar-error-banner">
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
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
          />

          <label className="etiqueta">
            CONTRASEÑA
          </label>

          <input
            className="campo"
            type="password"
            placeholder="••••••••"
            value={contraseña}
            onChange={(e) => {
              setContraseña(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
          />

          <label className="etiqueta">
            CONFIRMAR CONTRASEÑA
          </label>

          <input
            className="campo"
            type="password"
            placeholder="••••••••"
            value={confirmarContraseña}
            onChange={(e) => {
              setConfirmarContraseña(e.target.value)
              setError('')
            }}
            onKeyDown={handleKeyDown}
          />

          <button
            className="boton"
            onClick={handleSiguiente}
          >
            SIGUIENTE
          </button>

          <p className="pie">
            ¿Ya tenés cuenta?{' '}
            <a
              className="enlace"
              onClick={() => navigate('/login')}
              style={{ cursor: 'pointer' }}
            >
              Iniciá sesión
            </a>
          </p>

        </div>
      </div>
      <Footer />
    </>
  )
}

export default Registrar
