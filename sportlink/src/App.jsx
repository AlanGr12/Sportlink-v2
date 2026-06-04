import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'
import Landing from './landing/landing.jsx'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('login')

  if (!usuario) {
    if (vista === 'registro') {
      return <Registrar onRegistro={setUsuario} />
    }
    return <Login onLogin={setUsuario} onRegistro={() => setVista('registro')} />
  }

  //si el usuario se registra que lo mande a la landing y ver si primera view al entrar es la landing o log in, ya lo devuelve en caso de registrarse
  //ojo pq el cuando se logea lo trae a este return y lo mismo pasa con el registrar pq lo que habria que hacer un if si esta registrado que lo mande a la landing y sino al log in
  
  return <Landing />
}

export default App