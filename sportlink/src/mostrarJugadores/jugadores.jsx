import { useEffect, useState } from 'react'
import api from '../axiosConfig.js'
import './jugadores.css'
import Footer from '../footer/footer.jsx';
import Avatar from '../components/Avatar.jsx';

function JugadoresView(props) {
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function obtenerJugadores() {
      try {
        const response = await api.get('/api/jugadores')
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
    return (
      <div className="miPerfil-root">
        <div className="miPerfil-container">
          <div className="miPerfil-loading">Cargando jugadores...</div>
        </div>
      </div>
    );
  }

  if (error) return <h1>{error}</h1>

  return (
    <>
      <div className="contenedor-jugadores">
        <h1>Jugadores</h1>

        <div className="cards-grid-jugadores">
          {jugadores.map((jugador) => (
            <div key={jugador.idjugador} className="card-jugador">

              <Avatar 
                src={jugador.fotoperfil} 
                nombre={jugador.nombre} 
                size="100%" 
                className="foto-jugador" 
                style={{ borderRadius: 0, fontSize: '4rem', aspectRatio: '1/1' }} 
              />

              <h2>{jugador.nombre} {jugador.apellido}</h2>

              {jugador.descripcion && <p>{jugador.descripcion}</p>}

              <p>🏅 Deporte: {jugador.deportes?.deporte || 'Sin deporte'}</p>
              <p>📍 Ubicación: {jugador.ubicacion}</p>
              <p>📞 Teléfono: {jugador.telefono}</p>
              <p>⚧ Género: {jugador.genero}</p>

            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default JugadoresView
