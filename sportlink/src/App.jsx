import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('login')

  if (!usuario) {
    if (vista === 'registro') {
      return <Registrar onRegistro={setUsuario} />
    }
    return <Login onLogin={setUsuario} onRegistro={() => setVista('registro')} />
  }

  //si el usuario se registra que lo mande a la landing
  return <h1>Bienvenido {usuario.email}</h1>
}

export default App