import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'
import Landing from './landing/landing.jsx'
import MiPerfil from './mi perfil/miperfil.jsx'
import EntrenadoresView from './mostrarEntrenadores/entrenadores.jsx'
import JugadoresView from './mostrarJugadores/jugadores.jsx'
import Header from './header/header.jsx' // Importamos el Header global acá
import Footer from './footer/footer.jsx'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('landing') // Vista inicial pública

  // Función interna para decidir qué cuerpo de página renderizar
  const renderContenido = () => {
    // Vistas restringidas por Login/Registro si no hay usuario
    if (vista === 'login' && !usuario) {
      return (
        <Login 
          onLogin={(user) => {
            setUsuario(user);
            setVista('landing'); 
          }} 
          onRegistro={() => setVista('registro')} 
        />
      )
    }

    if (vista === 'registro' && !usuario) {
      return (
        <Registrar 
          onRegistro={(user) => {
            setUsuario(user);
            setVista('landing');
          }} 
        />
      )
    }

    // Navegación general de vistas fijas
    if (vista === 'jugadores') {
      return <JugadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'entrenadores') {
      return <EntrenadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'perfil') {
      return <MiPerfil cambiarVista={setVista} usuario={usuario} />
    }

    // Por defecto si no coincide ninguna, muestra la Landing
    return <Landing cambiarVista={setVista} />
  }

  return (
    <div className="app-container">
      {/* El Header ahora es GLOBAL y está siempre accesible en cualquier vista */}
      <Header cambiarVista={setVista} usuario={usuario} />
      
      <main className="content-body">
        {renderContenido()}
      </main>

      {/* Si querés un footer global también podés ponerlo acá, o dejarlo en las vistas */}
    </div>
  )
}

export default App