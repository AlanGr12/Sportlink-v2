import { useState } from 'react'
import Registrar from './registrar/registrar.jsx'
import RegistroRol from './registrar/RegistroRolPASO2.jsx'

function RegistroFlow({ onRegistro, onLogin }) {
  const [paso, setPaso] = useState(1)
  const [datosBase, setDatosBase] = useState(null) // guarda email + contraseña del paso 1

  if (paso === 1) {
    return (
      <Registrar
        onSiguiente={(datos) => {
          setDatosBase(datos)
          setPaso(2)
        }}
        onLogin={onLogin}
      />
    )
  }

  if (paso === 2) {
    return (
      <RegistroRol
        datosBase={datosBase}
        onRegistro={onRegistro}
      />
    )
  }

  return null
}

export default RegistroFlow
