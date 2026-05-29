import { useEffect, useState } from 'react'
import axios from 'axios'
import './jugadores.css'

function JugadoresView() {
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function obtenerJugadores() {
      try {
        const response = await axios.get(
          'http://localhost:3000/api/jugadores'
        )

        setJugadores(response.data)
      } catch (err) {
        console.error(err)
        setError('Error al obtener jugadores')
      } finally {
        setLoading(false)
      }
    }

    obtenerJugadores()
  }, [])

  if (loading) {
    return <h1>Cargando...</h1>
  }

  if (error) {
    return <h1>{error}</h1>
  }

  return (
    <div className="contenedor-jugadores">
      <h1>Jugadores</h1>

      {jugadores.map((jugador) => (
        <div
          key={jugador.idjugador}
          className="card-jugador"
        >
          <h2>
            {jugador.nombre} {jugador.apellido}
          </h2>

          <p>Ubicación: {jugador.ubicacion}</p>

          <p>Género: {jugador.genero}</p>

          <p>
            Deporte:{' '}
            {jugador.deportes?.deporte || jugador.iddeporte}
          </p>

          {jugador.fotoperfil && (
            <img
              src={jugador.fotoperfil}
              alt={jugador.nombre}
              className="foto-jugador"
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default JugadoresView