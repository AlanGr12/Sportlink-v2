import { useState } from 'react'
import './registrar.css'
import logoSportlink from '../assets/logoSportlink.png'
import Footer from '../footer/footer.jsx'

function Registrar({ onSiguiente, onLogin }) {
  const [contraseña, setContraseña] = useState('')
  const [confirmarContraseña, setConfirmarContraseña] = useState('')
  const [email, setEmail] = useState('')

  function handleSiguiente() {
    if (!email || !contraseña || !confirmarContraseña) {
      alert('Por favor completá todos los campos')
      return
    }
    if (contraseña !== confirmarContraseña) {
      alert('Las contraseñas no coinciden')
      return
    }
    onSiguiente({ email, contraseña })
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

          <label className="etiqueta">
            EMAIL
          </label>

          <input
            className="campo"
            type="email"
            placeholder="user@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          />

          <label className="etiqueta">
            CONFIRMAR CONTRASEÑA
          </label>

          <input
            className="campo"
            type="password"
            placeholder="••••••••"
            value={confirmarContraseña}
            onChange={(e) => setConfirmarContraseña(e.target.value)}
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
              onClick={onLogin}
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
