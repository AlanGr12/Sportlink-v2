import { useEffect, useState } from 'react'
import axios from 'axios'
import '../entrenamientos/entrenamientos.css'
import './entrenadores.css'
import Footer from '../footer/footer.jsx'
import { IconoUbicacion } from '../iconos/IconoUbicacion.jsx'
import { IconoFutbol } from '../iconos/IconoFutbol.jsx'
import { IconoBuscador } from '../iconos/IconoBuscador.jsx'
import { IconoMedalla } from '../iconos/IconoMedalla.jsx'
import { IconoModalidad } from '../iconos/IconoModalidad.jsx'


// Lista de deportes para el filtro (misma que PaginaEntrenamientos)
const deportesDisponibles = [
  { id: 1, nombre: 'Fútbol' },
  { id: 2, nombre: 'Basket' },
  { id: 3, nombre: 'Tenis' },
  { id: 4, nombre: 'Voley' },
  { id: 5, nombre: 'Pádel' },
  { id: 6, nombre: 'Rugby' },
  { id: 7, nombre: 'Hockey' },
  { id: 8, nombre: 'Natación' },
  { id: 9, nombre: 'Atletismo' },
  { id: 10, nombre: 'Ciclismo' },
  { id: 11, nombre: 'Boxeo' },
  { id: 12, nombre: 'Artes Marciales' },
  { id: 13, nombre: 'Handball' },
  { id: 14, nombre: 'Béisbol' },
  { id: 15, nombre: 'Golf' },
]

function EntrenadoresView(props) {
  const [Entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')

  // Sidebar accordion
  const [sidebarExpandido, setSidebarExpandido] = useState({
    deporte: true,
    ubicacion: true,
  })

  const toggleSidebarSeccion = (seccion) => {
    setSidebarExpandido(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }))
  }

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

  // Filtrado local (misma lógica de siempre, sólo se filtra la presentación)
  const entrenadoresFiltrados = Entrenadores
    .filter(e => e.deportes && e.deportes.length > 0)
    .filter(e => {
      const coincideBusqueda =
        !busqueda ||
        `${e.nombre} ${e.apellido}`.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.deportes?.some(d => d.deporte?.toLowerCase().includes(busqueda.toLowerCase()))

      const coincideDeporte =
        !filtroDeporte ||
        e.deportes?.some(d => d.deporte === filtroDeporte)

      const coincideUbicacion =
        !filtroUbicacion ||
        e.ubicacion?.toLowerCase().includes(filtroUbicacion.toLowerCase())

      return coincideBusqueda && coincideDeporte && coincideUbicacion
    })

  const aplicarFiltros = () => {
    // Los filtros ya se aplican reactivamente, pero podemos forzar un re-render
    // Este botón está aquí para ser consistente con la UI de entrenamientos/pruebas
  }

  const restablecerFiltros = () => {
    setBusqueda('')
    setFiltroDeporte('')
    setFiltroUbicacion('')
  }

  if (loading) {
    return (
      <div className="pagina-entrenamientos">
        <div className="entrenadores-loading-box">
          <div className="entrenadores-spinner"></div>
          <span>Cargando entrenadores...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pagina-entrenamientos">
        <div className="entrenadores-error-box">
          <span style={{ fontSize: '48px' }}>⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="pagina-entrenamientos">
        <div className="entrenamientos-layout">

          {/* ═══════════════════════════════════════════════════
              SIDEBAR FILTROS
              ═══════════════════════════════════════════════════ */}
          <aside className="filtros-sidebar">
            <div>
              <h2 className="filtros-titulo">Filtros</h2>
              <p className="filtros-subtitulo">Refiná tu búsqueda</p>
            </div>

            {/* Filtro Deporte */}
            <div className="filtro-grupo">
              <div
                className={`filtro-header ${sidebarExpandido.deporte ? 'abierto' : ''}`}
                onClick={() => toggleSidebarSeccion('deporte')}
              >
                <span><IconoFutbol size={16} color="currentColor" className="icon-small" /> Deportes</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              <div className={`filtro-contenido-wrapper ${sidebarExpandido.deporte ? 'open' : ''}`}>
                <div className="filtro-contenido">
                  <select
                    className="filtro-select"
                    value={filtroDeporte}
                    onChange={(e) => setFiltroDeporte(e.target.value)}
                  >
                    <option value="">Todos los deportes</option>
                    {deportesDisponibles.map(d => (
                      <option key={d.id} value={d.nombre}>{d.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filtro Ubicación */}
            <div className="filtro-grupo">
              <div
                className={`filtro-header ${sidebarExpandido.ubicacion ? 'abierto' : ''}`}
                onClick={() => toggleSidebarSeccion('ubicacion')}
              >
                <span><IconoUbicacion size={16} color="currentColor" className="icon-small" /> Ubicación</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
              <div className={`filtro-contenido-wrapper ${sidebarExpandido.ubicacion ? 'open' : ''}`}>
                <div className="filtro-contenido">
                  <input
                    type="text"
                    className="filtro-input"
                    placeholder="ej. Buenos Aires"
                    value={filtroUbicacion}
                    onChange={(e) => setFiltroUbicacion(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button className="btn-aplicar-filtros" onClick={aplicarFiltros}>
              Aplicar Filtros
            </button>
            <button type="button" className="btn-reset-filtros" onClick={restablecerFiltros}>
              Restablecer filtros
            </button>
          </aside>

          {/* ═══════════════════════════════════════════════════
              CONTENIDO PRINCIPAL
              ═══════════════════════════════════════════════════ */}
          <main className="entrenamientos-main">

            <div className="entrenamientos-header">
              <h1 className="entrenamientos-titulo-principal">Entrenadores</h1>
              <p className="entrenamientos-descripcion">
                Encontrá el entrenador ideal para potenciar tu rendimiento deportivo.
              </p>
            </div>

            {/* Barra de Búsqueda */}
            <div className="buscador-container">
              <IconoBuscador size={16} color="currentColor" className="icon-small buscador-img" />
              <input
                type="text"
                className="buscador-input"
                placeholder="Buscar entrenadores, deportes, ubicación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            {/* Grilla de tarjetas */}
            <div className="grid-entrenadores">
              {entrenadoresFiltrados.length === 0 ? (
                <div className="entrenadores-empty">
                  <p>No se encontraron entrenadores con los filtros aplicados.</p>
                </div>
              ) : (
                entrenadoresFiltrados.map((Entrenador) => (
                <div key={Entrenador.identrenador} className="card-entrenador">

                  {/* ── Imagen (mitad superior) ── */}
                  <div className="card-entrenador-imagen">
                    {Entrenador.fotoperfil ? (
                      <img src={Entrenador.fotoperfil} alt={Entrenador.nombre} />
                    ) : (
                      <div className="card-entrenador-sin-foto">Sin foto</div>
                    )}
                    <div className="card-entrenador-imagen-overlay" aria-hidden="true" />
                    {Entrenador.tieneclub && (
                      <span className="badge-recomendado">RECOMENDADO</span>
                    )}
                  </div>

                  {/* ── Cuerpo ── */}
                  <div className="card-entrenador-body">
                    <h2 className="card-entrenador-nombre">
                      {Entrenador.nombre} {Entrenador.apellido}
                    </h2>

                    {Entrenador.titulo && (
                      <p className="card-entrenador-titulo">{Entrenador.titulo}</p>
                    )}

                    {/* Píldoras de info */}
                    <div className="card-entrenador-pills">
                      {Entrenador.deportes.map((d, idx) => (
                        <span key={idx} className="pill-info">
                          <IconoMedalla size={14} color="currentColor" className="pill-icon" />
                          {d.deporte}
                        </span>
                      ))}
                      {Entrenador.experiencia && (
                        <span className="pill-info">
                          <IconoModalidad size={14} color="currentColor" className="pill-icon" />
                          {Entrenador.experiencia}
                        </span>
                      )}
                    </div>

                    {/* Ubicación */}
                    {Entrenador.ubicacion && (
                      <p className="card-entrenador-ubicacion">
                        <IconoUbicacion size={16} color="currentColor" className="pill-icon" />
                        {Entrenador.ubicacion}
                      </p>
                    )}
                  </div>

                  {/* ── Botones de acción ── */}
                  <div className="card-entrenador-acciones">
                    <button className="btn-entrenador-perfil">Perfil</button>
                    <button className="btn-entrenador-contactar">Contactar</button>
                  </div>

                </div>
                ))
              )}
            </div>

          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default EntrenadoresView
