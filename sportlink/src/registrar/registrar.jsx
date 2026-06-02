import { useState } from 'react'
import RegistroJugador from './registrarUser/Registrojugador.jsx'
import RegistroEntrenador from './registrarUser/RegistroEntrenador.jsx'
import RegistroClub from './registrarUser/Registroclub.jsx'
import Header from '../header/header.jsx'
import Footer from '../footer/footer.jsx'
import logoSportlink from '../assets/logoSportlink.png'
import './registrar.css'


function Registrar({ onRegistro }) {
  const [tipo, setTipo] = useState(null)
  const [rolSeleccionado, setRolSeleccionado] = useState(null)


  // Por ahora, al confirmar, si es 'jugador' te manda directo al paso 2 largo
  if (tipo === 'jugador') return <RegistroJugador onRegistro={onRegistro} />
  if (tipo === 'entrenador') return <RegistroEntrenador onRegistro={onRegistro} />
  if (tipo === 'club') return <RegistroClub onRegistro={onRegistro} />


  function handleSiguiente() {
    if (!rolSeleccionado) {
      alert('Por favor, selecciona un rol para continuar.')
      return
    }
    setTipo(rolSeleccionado)
  }


  return (
    <>
      <Header />
     
      <main className="sr-main">
        {/* Encabezado Animado */}
        <div className="sr-hero rj-animate-hero">
          <img src={logoSportlink} alt="Sportlink Logo" className="sr-logo-top" />
          <h1 className="sr-main-title">REGISTRO DE MÁXIMO NIVEL</h1>
          <p className="sr-main-subtitle">
            Únete al ecosistema deportivo de rendimiento más avanzado del mundo.
          </p>
        </div>


        {/* Contenedor Dividido Principal */}
        <div className="sr-split-card rj-animate-content">
         
          {/* LADO IZQUIERDO: Imagen de fondo con overlay y texto */}
          <div className="sr-left-panel">
            <div className="sr-left-content">
              <h2 className="sr-left-title">
                DESCUBRE TU <span className="sr-left-accent">POTENCIAL</span>
              </h2>
              <p className="sr-left-text">
                UNITE AL ECOSISTEMA DE SPORTLINK.
              </p>
            </div>
          </div>


          {/* LADO DERECHO: Selector de Roles e interactividad */}
          <div className="sr-right-panel">
            <h3 className="sr-right-title">ELIGE TU ROL</h3>
            <p className="sr-right-subtitle">
              Personaliza tu experiencia seleccionando cómo usarás Sportlink.
            </p>


            <div className="sr-roles-list">
             
              {/* Opción Deportista / Jugador */}
              <div
                className={`sr-role-item ${rolSeleccionado === 'jugador' ? 'sr-role-item--active' : ''}`}
                onClick={() => setRolSeleccionado('jugador')}
              >
                <div className="sr-role-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6Z"></path>
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"></path>
                  </svg>
                </div>
                <div className="sr-role-info">
                  <h4 className="sr-role-name">DEPORTISTA</h4>
                  <p className="sr-role-desc">Entrena con expertos e inscribite en pruebas de los clubes afiliados</p>
                </div>
              </div>


              {/* Opción Entrenador */}
              <div
                className={`sr-role-item ${rolSeleccionado === 'entrenador' ? 'sr-role-item--active' : ''}`}
                onClick={() => setRolSeleccionado('entrenador')}
              >
                <div className="sr-role-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                </div>
                <div className="sr-role-info">
                  <h4 className="sr-role-name">ENTRENADOR</h4>
                  <p className="sr-role-desc">Gestiona atletas y encuentra club.</p>
                </div>
              </div>


              {/* Opción Club Staff */}
              <div
                className={`sr-role-item ${rolSeleccionado === 'club' ? 'sr-role-item--active' : ''}`}
                onClick={() => setRolSeleccionado('club')}
              >
                <div className="sr-role-icon-box">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <div className="sr-role-info">
                  <h4 className="sr-role-name">CLUB STAFF</h4>
                  <p className="sr-role-desc">Administra pruebas y entrevistas como administrador de club.</p>
                </div>
              </div>


            </div>


            {/* Acciones del Formulario */}
            <button className="sr-submit-btn" onClick={handleSiguiente}>
              SIGUIENTE
            </button>


            <div className="sr-step-container">
              <span className="sr-step-text">PASO 1 / 2</span>
              <div className="sr-step-track">
                <div className="sr-step-bar sr-step-bar--active"></div>
                <div className="sr-step-bar"></div>
              </div>
            </div>


          </div>


        </div>
      </main>
      <Footer />
    </>
  )
}


export default Registrar
