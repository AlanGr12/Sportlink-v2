import { useState } from 'react'
import Login from './log in/Login.jsx'
import Registrar from './registrar/registrar.jsx'

function App() {
  const [usuario, setUsuario] = useState(null)
  const [vista, setVista] = useState('login') // 'login' o 'registro'

  if (!usuario) {
    if (vista === 'registro') {
      return <Registrar onRegistro={setUsuario} />
    }
    return (
      <div>
        <Login onLogin={setUsuario} />
        <button onClick={() => setVista('registro')}>¿No tenés cuenta? Registrate</button>
      </div>
    )
  }

  return <h1>Bienvenido {usuario.email}</h1>
}

export default App