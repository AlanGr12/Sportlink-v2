import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import api from '../axiosConfig.js'
import '../entrenamientos/entrenamientos.css'
import './entrenadores.css'
import Footer from '../footer/footer.jsx'
import Avatar from '../components/Avatar.jsx'
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
  const navigate = useNavigate()
  const [Entrenadores, setEntrenadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // ── Estado del popup de contacto ──
  const [popupContacto, setPopupContacto] = useState(null) // { entrenador } | null
  const [mensajeContacto, setMensajeContacto] = useState('')
  const [enviandoContacto, setEnviandoContacto] = useState(false)
  const [toastContacto, setToastContacto] = useState(null) // { nombre, conversacion } | null

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
        const response = await api.get('/api/Entrenadores')
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

  // Botón Contactar: abre el popup para escribir el mensaje inicial
  const handleContactar = (entrenador) => {
    if (!props.usuario) {
      navigate('/login')
      return
    }
    setMensajeContacto('')
    setToastContacto(null)
    setPopupContacto({ entrenador })
  }

  // Enviar el mensaje inicial desde el popup
  const handleEnviarContacto = async () => {
    if (!mensajeContacto.trim() || !popupContacto) return
    setEnviandoContacto(true)
    try {
      // 1. Crear o recuperar la conversación privada
      const { data: conversacion } = await api.post('/api/conversaciones/privada', {
        idusuarioReceptor: popupContacto.entrenador.idusuario
      })
      // 2. Enviar el primer mensaje
      await api.post(`/api/conversaciones/${conversacion.idconversacion}/mensajes`, {
        contenido: mensajeContacto.trim()
      })
      // 3. Cerrar popup y mostrar el cuadro verde debajo
      const nombre = `${popupContacto.entrenador.nombre} ${popupContacto.entrenador.apellido}`
      setPopupContacto(null)
      setMensajeContacto('')
      setToastContacto({ nombre, conversacion })
    } catch (err) {
      console.error('Error al enviar mensaje:', err)
      alert('No se pudo enviar el mensaje. Intentá de nuevo.')
    } finally {
      setEnviandoContacto(false)
    }
  }

  // Bloquear scroll del body mientras el popup está abierto
  useEffect(() => {
    if (popupContacto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [popupContacto])

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
      {/* ═══ POPUP DE CONTACTO — Portal sobre document.body ═══ */}
      {popupContacto && createPortal(
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setPopupContacto(null) }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#1a1d1e',
              border: '1px solid #2d3032',
              borderRadius: '12px',
              padding: '32px',
              width: '90%',
              maxWidth: '460px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              color: '#fff',
              fontFamily: 'inherit',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar */}
            <button
              aria-label="Cerrar"
              onClick={() => setPopupContacto(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#8b949e',
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >✕</button>

            {/* Cabecera */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ marginBottom: '10px' }}>
                <svg viewBox="0 0 24 24" width="34" height="34" stroke="#2DEFF2" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: '0 0 6px',letterSpacing:0 }}>
                Contactar a {popupContacto.entrenador.nombre} {popupContacto.entrenador.apellido}
              </h2>
              <p style={{ fontSize: '13px', color: '#8b949e', margin: 0, lineHeight: 1.5 }}>
                Escribí tu mensaje inicial y lo recibirá directamente en su bandeja.
              </p>
            </div>

            {/* Textarea */}
            <textarea
              className="contacto-modal-textarea"
              placeholder={`Hola ${popupContacto.entrenador.nombre}, me interesa...`}
              value={mensajeContacto}
              onChange={(e) => setMensajeContacto(e.target.value)}
              rows={4}
              autoFocus
              maxLength={500}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleEnviarContacto() }}
            />
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#8b949e', margin: '4px 2px 16px' }}>
              {mensajeContacto.length}/500
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPopupContacto(null)}
                disabled={enviandoContacto}
                style={{
                  flex: 1,
                  padding: '11px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#8b949e',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: enviandoContacto ? 0.45 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarContacto}
                disabled={!mensajeContacto.trim() || enviandoContacto}
                style={{
                  flex: 2,
                  padding: '11px',
                  background: 'var(--primary, #2DEFF2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: !mensajeContacto.trim() || enviandoContacto ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  opacity: !mensajeContacto.trim() || enviandoContacto ? 0.45 : 1,
                }}
              >
                {enviandoContacto ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* ═══ CUADRO VERDE DE ÉXITO — fijo abajo, portal ═══ */}
      {toastContacto && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            backgroundColor: '#0d1f14',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            padding: '11px 14px',
            fontSize: '14px',
            color: '#86efac',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            fontFamily: 'inherit',
          }}
        >
          <span>¡Mensaje enviado con éxito!</span>
          <span
            onClick={() => {
              setToastContacto(null)
              navigate('/mensajes', { state: { conversacionInicial: toastContacto.conversacion } })
            }}
            style={{
              textDecoration: 'underline',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#4ade80',
            }}
          >
            Hacé click aquí para ir al chat
          </span>
          <button
            aria-label="Cerrar"
            onClick={() => setToastContacto(null)}
            style={{
              marginLeft: '8px',
              background: 'transparent',
              border: 'none',
              color: '#86efac',
              fontSize: '16px',
              cursor: 'pointer',
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
          >✕</button>
        </div>,
        document.body
      )}

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
                    <Avatar 
                      src={Entrenador.fotoperfil} 
                      nombre={Entrenador.nombre} 
                      size="100%" 
                      style={{ borderRadius: 0, fontSize: '4rem' }} 
                    />
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
                    <button
                      className="btn-entrenador-contactar"
                      onClick={() => handleContactar(Entrenador)}
                    >
                      Contactar
                    </button>
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
