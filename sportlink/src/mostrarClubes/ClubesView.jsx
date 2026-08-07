import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import '../entrenamientos/entrenamientos.css'
import './clubes.css'
import Footer from '../footer/footer.jsx'
import Avatar from '../components/Avatar.jsx'
import { IconoUbicacion } from '../iconos/IconoUbicacion.jsx'
import { IconoFutbol } from '../iconos/IconoFutbol.jsx'
import { IconoBuscador } from '../iconos/IconoBuscador.jsx'
import { IconoMedalla } from '../iconos/IconoMedalla.jsx'


// Misma lista de deportes usada en Entrenamientos y Entrenadores
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


function ClubesView(props) {
  const navigate = useNavigate()
  const [clubes, setClubes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contactando, setContactando] = useState(null)


  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroDeporte, setFiltroDeporte] = useState('')
  const [filtroUbicacion, setFiltroUbicacion] = useState('')


  // Sidebar accordion
  const [sidebarExpandido, setSidebarExpandido] = useState({
    deporte: true,
    ubicacion: true,
  })


  // Modal de detalle
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false)
  const [clubSeleccionado, setClubSeleccionado] = useState(null)


  const toggleSidebarSeccion = (seccion) => {
    setSidebarExpandido(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }))
  }


  useEffect(() => {
    async function obtenerClubes() {
      try {
        const response = await api.get('/api/clubes')
        setClubes(response.data)
      } catch (err) {
        console.error(err)
        setError('Error al obtener clubes')
      } finally {
        setLoading(false)
      }
    }
    obtenerClubes()
  }, [])


  // Bloquea el scroll de fondo mientras el modal está abierto
  useEffect(() => {
    if (modalDetalleAbierto) {
      const overflowOriginal = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = overflowOriginal
      }
    }
  }, [modalDetalleAbierto])


  // Filtrado local
  const clubesFiltrados = clubes.filter(c => {
    const coincideBusqueda =
      !busqueda ||
      c.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.ubicacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.deportes?.some(d => d.deporte?.toLowerCase().includes(busqueda.toLowerCase()))


    const coincideDeporte =
      !filtroDeporte ||
      c.deportes?.some(d => d.deporte === filtroDeporte)


    const coincideUbicacion =
      !filtroUbicacion ||
      c.ubicacion?.toLowerCase().includes(filtroUbicacion.toLowerCase())


    return coincideBusqueda && coincideDeporte && coincideUbicacion
  })


  const aplicarFiltros = () => {
    // Los filtros ya se aplican reactivamente; el botón queda por consistencia de UI
  }


  const restablecerFiltros = () => {
    setBusqueda('')
    setFiltroDeporte('')
    setFiltroUbicacion('')
  }


  const handleVerClub = (club) => {
    setClubSeleccionado(club)
    setModalDetalleAbierto(true)
  }


  // Botón Contactar dentro del modal: crea/recupera conversación privada con el club
  const handleContactar = async (club) => {
    if (!props.usuario) {
      navigate('/login')
      return
    }
    if (contactando === club.idclub) return


    setContactando(club.idclub)
    try {
      const { data: conversacion } = await api.post('/api/conversaciones/privada', {
        idusuarioReceptor: club.idusuario
      })
      navigate('/mensajes', { state: { conversacionInicial: conversacion } })
    } catch (err) {
      console.error('Error al contactar club:', err)
      alert('No se pudo iniciar la conversación. Intentá de nuevo.')
    } finally {
      setContactando(null)
    }
  }


  if (loading) {
    return (
      <div className="pagina-entrenamientos">
        <div className="entrenadores-loading-box">
          <div className="entrenadores-spinner"></div>
          <span>Cargando clubes...</span>
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
              <p className="filtros-subtitulo">Ajustá tu búsqueda</p>
            </div>


            {/* Filtro Deporte */}
            <div className="filtro-grupo">
              <div
                className={`filtro-header ${sidebarExpandido.deporte ? 'abierto' : ''}`}
                onClick={() => toggleSidebarSeccion('deporte')}
              >
                <span><IconoFutbol size={16} color="currentColor" className="icon-small" /> Deporte</span>
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
              <h1 className="entrenamientos-titulo-principal">Clubes</h1>
              <p className="entrenamientos-descripcion">
                Explorá la variedad de clubes que forman parte de Sportlink.
              </p>
            </div>


            {/* Barra de Búsqueda */}
            <div className="buscador-container">
              <IconoBuscador size={16} color="currentColor" className="icon-small buscador-img" />
              <input
                type="text"
                className="buscador-input"
                placeholder="Buscar clubes, deportes, ubicación..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>


            {/* Grilla de tarjetas */}
            <div className="grid-clubes">
              {clubesFiltrados.length === 0 ? (
                <div className="entrenadores-empty">
                  <p>No se encontraron clubes con los filtros aplicados.</p>
                </div>
              ) : (
                clubesFiltrados.map((club) => (
                  <div key={club.idclub} className="card-club">


                    {/* ── Logo (mitad superior, sobre fondo claro) ── */}
                    <div className="card-club-imagen">
                      <Avatar
                        src={club.fotoperfil}
                        nombre={club.nombre}
                        size="100%"
                        style={{ borderRadius: 0, fontSize: '3rem' }}
                      />
                    </div>


                    {/* ── Cuerpo ── */}
                    <div className="card-club-body">
                      <h2 className="card-club-nombre">{club.nombre}</h2>


                      {club.ubicacion && (
                        <p className="card-club-ubicacion">
                          <IconoUbicacion size={16} color="currentColor" className="pill-icon" />
                          {club.ubicacion}
                        </p>
                      )}


                      {/* Píldoras de deportes */}
                      {club.deportes && club.deportes.length > 0 && (
                        <div className="card-club-pills">
                          {club.deportes.map((d, idx) => (
                            <span key={idx} className="pill-info">
                              <IconoMedalla size={14} color="currentColor" className="pill-icon" />
                              {d.deporte}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>


                    {/* ── Botón de acción ── */}
                    <div className="card-club-acciones">
                      <button
                        className="btn-club-info"
                        onClick={() => handleVerClub(club)}
                      >
                        Más información
                      </button>
                    </div>


                  </div>
                ))
              )}
            </div>


          </main>
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════
          MODAL DETALLE DE CLUB
          ═══════════════════════════════════════════════════ */}
      {modalDetalleAbierto && clubSeleccionado && createPortal(
        <div className="modal-overlay" onClick={() => setModalDetalleAbierto(false)}>
          <div className="modal-contenedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-titulo">Detalle del club</h3>
              <button className="btn-cerrar-modal" onClick={() => setModalDetalleAbierto(false)}>×</button>
            </div>
            <div className="modal-cuerpo">
              <div className="detalle-club-imagen">
                <Avatar
                  src={clubSeleccionado.fotoperfil}
                  nombre={clubSeleccionado.nombre}
                  size="100%"
                  style={{ borderRadius: 0, fontSize: '3rem' }}
                />
              </div>


              <h2 className="detalle-club-nombre">{clubSeleccionado.nombre}</h2>


              {clubSeleccionado.ubicacion && (
                <p className="detalle-club-ubicacion">
                  <IconoUbicacion size={16} color="currentColor" className="pill-icon" />
                  {clubSeleccionado.ubicacion}
                </p>
              )}


              {clubSeleccionado.deportes && clubSeleccionado.deportes.length > 0 && (
                <div className="detalle-club-pills">
                  {clubSeleccionado.deportes.map((d, idx) => (
                    <span key={idx} className="pill-info">
                      <IconoMedalla size={14} color="currentColor" className="pill-icon" />
                      {d.deporte}
                    </span>
                  ))}
                </div>
              )}


              {clubSeleccionado.descripcion && (
                <p className="detalle-club-descripcion">{clubSeleccionado.descripcion}</p>
              )}


              <div className="detalle-club-acciones">
                <button
                  className="btn-entrenador-contactar"
                  onClick={() => handleContactar(clubSeleccionado)}
                  disabled={contactando === clubSeleccionado.idclub}
                >
                  {contactando === clubSeleccionado.idclub ? 'Conectando...' : 'Contactar'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}


      <Footer />
    </>
  )
}


export default ClubesView

