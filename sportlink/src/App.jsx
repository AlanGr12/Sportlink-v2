import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'
import Landing from './landing/landing.jsx'
import MiPerfil from './mi perfil/miperfil.jsx'
import EntrenadoresView from './mostrarEntrenadores/entrenadores.jsx'
import JugadoresView from './mostrarJugadores/jugadores.jsx'


function App() {
  const [usuario, setUsuario] = useState(null)
  
  // Cambiamos la vista inicial a 'landing' para que sea pública
  const [vista, setVista] = useState('landing') 

  // 1. CONDICIONALES PARA LOGIN Y REGISTRO (Manejados por el estado 'vista')
  if (vista === 'login' && !usuario) {
    return <Login onLogin={(user) => {
      setUsuario(user);
      setVista('landing'); // Al loguearse con éxito, vuelve a la landing ya autenticado
    }} onRegistro={() => setVista('registro')} />
  }

  if (vista === 'registro' && !usuario) {
    return <Registrar onRegistro={(user) => {
      setUsuario(user);
      setVista('landing'); // Al registrarse con éxito, vuelve a la landing ya autenticado
    }} />
  }

  if (vista === 'miperfil') {
    return <MiPerfil cambiarVista={setVista} usuario={usuario} />
  }

  return <Landing usuario={usuario} cambiarVista={setVista} />
}

export default App