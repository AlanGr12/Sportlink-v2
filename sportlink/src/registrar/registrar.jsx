import { useState } from 'react'
import RegistroJugador from './registrarUser/RegistroJugador.jsx'
import RegistroEntrenador from './registrarUser/RegistroEntrenador.jsx'
import RegistroClub from './registrarUser/Registroclub.jsx'
import Header from '../header/header.jsx'
import './registrar.css'


function Registrar({ onRegistro }) {
  const [tipo, setTipo] = useState(null)

  if (tipo === 'jugador') return <RegistroJugador onRegistro={onRegistro} />
  if (tipo === 'entrenador') return <RegistroEntrenador onRegistro={onRegistro} />
  if (tipo === 'club') return <RegistroClub onRegistro={onRegistro} />

  return (
    <>
    
    <div className='registrarUser'>
      <h2>¿Cómo querés registrarte?</h2>
      <button onClick={() => setTipo('jugador')}>Jugador</button>
      <button onClick={() => setTipo('entrenador')}>Entrenador</button>
      <button onClick={() => setTipo('club')}>Club</button>
    </div>
  </>
  )
}

export default Registrar