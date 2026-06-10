import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'
import Landing from './landing/landing.jsx'
import MiPerfil from './mi perfil/miperfil.jsx'
import EntrenadoresView from './mostrarEntrenadores/entrenadores.jsx'
import JugadoresView from './mostrarJugadores/jugadores.jsx'
import Header from './header/header.jsx'
import Footer from './footer/footer.jsx'
import Calendario from './calendario/calendario.jsx'

function App() {
  // FIX 1: inicializar desde localStorage para que la sesión sobreviva recargas
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      return null
    }
  })
  const [vista, setVista] = useState('landing')

  // FIX 3: wrapper que sincroniza el estado de React Y el localStorage
  const actualizarUsuario = (user) => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user))
    } else {
      localStorage.removeItem('usuario')
    }
    setUsuario(user)
  }

  const renderContenido = () => {
    if (vista === 'login' && !usuario) {
      return (
        <Login
          onLogin={(user) => {
            actualizarUsuario(user)
            setVista('landing')
          }}
          onRegistro={() => setVista('registro')}
        />
      )
    }

    if (vista === 'registro' && !usuario) {
      return (
        <Registrar
          onRegistro={(user) => {
            actualizarUsuario(user)
            setVista('landing')
          }}
        />
      )
    }

    if (vista === 'jugadores') {
      return <JugadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'entrenadores') {
      return <EntrenadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'calendario') {
      return <Calendario cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'perfil') {
      return <MiPerfil cambiarVista={setVista} usuario={usuario} />
    }

    return <Landing cambiarVista={setVista} usuario={usuario} />
  }

  return (
    <div className="app-container">
      {/* FIX 3: pasamos actualizarUsuario para que el Header pueda limpiar el estado al hacer logout */}
      <Header cambiarVista={setVista} usuario={usuario} onLogout={() => actualizarUsuario(null)} />

      <main className="content-body">
        {renderContenido()}
      </main>
    </div>
  )
}

export default App