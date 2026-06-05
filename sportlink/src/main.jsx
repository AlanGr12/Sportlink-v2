import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Jugadores from './mostrarJugadores/jugadores.jsx'
import Entrenadores from './mostrarEntrenadores/entrenadores.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Jugadores />
  </StrictMode>
)
