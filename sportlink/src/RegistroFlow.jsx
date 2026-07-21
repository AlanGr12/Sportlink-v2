import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Registrar from './registrar/registrar.jsx'
import RegistroRol from './registrar/RegistroRolPASO2.jsx'

function RegistroFlow({ onRegistro }) {
  const navigate = useNavigate()
  const [paso, setPaso] = useState(1)
  const [datosBase, setDatosBase] = useState(null)

  if (paso === 1) {
    return (
      <Registrar
        onSiguiente={(datos) => {
          setDatosBase(datos)
          setPaso(2)
        }}
      />
    )
  }

  if (paso === 2) {
    return (
      <RegistroRol
        datosBase={datosBase}
        onRegistro={(user) => {
          if (onRegistro) onRegistro(user)
          navigate('/')
        }}
      />
    )
  }

  return null
}

export default RegistroFlow
