import { useEffect, useState } from 'react'
import axios from 'axios'
import './entrenadores.css'
import Header from '../header/header.jsx';
import Footer from '../footer/footer.jsx';

function EntrenadoresView() {
  const [Entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function obtenerEntrenadores() {
      try {
        const response = await axios.get('http://localhost:3000/api/Entrenadores')
        setEntrenadores(response.data)
      } catch (err) {
        console.error(err)
        setError('Error al obtener Entrenadores')
      } finally {
        setLoading(false)
      }
    }
    obtenerEntrenadores()
  }, [])

  if (loading) return <h1>Cargando...</h1>
  if (error) return <h1>{error}</h1>

  return (
    <>
    <Header />
    <div className="contenedor-Entrenadores">
      <h1>Entrenadores</h1>

      <div className="cards-grid-Entrenadores">
        {Entrenadores.filter(e => e.deportes && e.deportes.length > 0).map((Entrenador) => (
          <div key={Entrenador.identrenador} className="card-Entrenador">

            {Entrenador.fotoperfil && (
              <img
                src={Entrenador.fotoperfil}
                alt={Entrenador.nombre}
                className="foto-Entrenador"
              />
            )}

            <h2>{Entrenador.nombre} {Entrenador.apellido}</h2>
            <p className="titulo-entrenador">{Entrenador.titulo}</p>

            {Entrenador.descripcion && <p>{Entrenador.descripcion}</p>}

            <p>🏅 Deporte: {Entrenador.deportes.map(d => d.deporte).join(', ')}</p>
            <p>📍 Ubicación: {Entrenador.ubicacion}</p>
            <p>⭐ Experiencia: {Entrenador.experiencia}</p>
            <p>📞 Teléfono: {Entrenador.telefono}</p>
            <p>🏟️ Tiene club: {Entrenador.tieneclub ? 'Sí' : 'No'}</p>

          </div>
        ))}
      </div>
    </div>
    <Footer />
    </>
  )
}

export default EntrenadoresView