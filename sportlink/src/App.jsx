import { useEffect, useState } from 'react'
import axios from 'axios'
import Login from './log in/Login.jsx'
import RegistroFlow from './RegistroFlow.jsx'
import Landing from './landing/landing.jsx'
import MiPerfil from './mi perfil/miperfil.jsx'
import EntrenadoresView from './mostrarEntrenadores/entrenadores.jsx'
import JugadoresView from './mostrarJugadores/jugadores.jsx'
import Header from './header/header.jsx'
import Calendario from './calendario/calendario.jsx'
import Pruebas from './pruebas/pruebas.jsx'
import PaginaEntrenamientos from './entrenamientos/PaginaEntrenamientos.jsx'
import Empleos from './empleos/Empleos.jsx'

function App() {
  const [usuario, setUsuario] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('usuario') || 'null')
    } catch {
      return null
    }
  })
  const [vista, setVista] = useState('landing')

  const actualizarUsuario = (user) => {
    if (user) {
      localStorage.setItem('usuario', JSON.stringify(user))
    } else {
      localStorage.removeItem('usuario')
    }
    setUsuario(user)
  }

  useEffect(() => {
    const fetchIdJugador = async () => {
      if (!usuario) return
      if (usuario.idjugador || usuario.idJugador) return
      if (usuario.tipousuario !== 'jugador') return
      const idusuario = usuario.idusuario || usuario.idUsuario || usuario.id || null
      if (!idusuario) return

      try {
        const response = await axios.get('http://localhost:3000/api/jugadores')
        const jugador = Array.isArray(response.data)
          ? response.data.find((j) => j.idusuario === idusuario)
          : null
        if (jugador?.idjugador) {
          actualizarUsuario({ ...usuario, idjugador: jugador.idjugador })
        }
      } catch (err) {
        console.error('No se pudo obtener idjugador para el usuario jugador:', err)
      }
    }

    fetchIdJugador()
  }, [usuario])

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
        <RegistroFlow
          onRegistro={(user) => {
            actualizarUsuario(user)
            setVista('landing')
          }}
          onLogin={() => setVista('login')}
        />
      )
    }

    if (vista === 'jugadores') {
      return <JugadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'entrenadores') {
      return <EntrenadoresView cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'pruebas') {
      const idJugador =
        usuario?.idjugador ||
        usuario?.idJugador ||
        usuario?.jugador?.idjugador ||
        usuario?.jugador?.idJugador ||
        usuario?.jugadorId ||
        usuario?.jugador?.id ||
        null;
      return <Pruebas idJugador={idJugador} usuario={usuario} />
    }

    if (vista === 'calendario') {
      return <Calendario cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'perfil') {
      return <MiPerfil cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'entrenamientos') {
      return <PaginaEntrenamientos cambiarVista={setVista} usuario={usuario} />
    }

    if (vista === 'empleos') {
      return <Empleos cambiarVista={setVista} usuario={usuario} />
    }

    return <Landing cambiarVista={setVista} usuario={usuario} />
  }

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header cambiarVista={setVista} usuario={usuario} onLogout={() => actualizarUsuario(null)} />
      <main className="content-body" style={{ flex: 1 }}>
        {renderContenido()}
      </main>
      
    </div>
  )
}

export default App
