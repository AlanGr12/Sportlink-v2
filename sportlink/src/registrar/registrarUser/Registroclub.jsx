import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../axiosConfig.js'
import InputDireccionOSM from '../../components/maps/InputDireccionOSM.jsx'
import MapaUbicacionDark from '../../components/maps/MapaUbicacionDark.jsx'
import './Registroclub.css'
import Header from "../../header/header.jsx"
import Footer from "../../footer/footer.jsx"
import logoSportlink from "../../assets/logoSportlink.png"

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
  { id: 15, nombre: 'Golf' }
]

// email y contraseña vienen de datosBase (Paso 1), no se piden acá
function RegistroClub({ datosBase = {} }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    ubicacion: '',
    direccion: '',
    latitud: null,
    longitud: null,
    deportes: [],
    descripcion: ''
  })
  const [fotoperfil, setFotoperfil] = useState(null)
  // URL del preview circular (se revoca al cambiar la foto para no filtrar memoria)
  const fotoPreviewUrl = useMemo(() => (fotoperfil ? URL.createObjectURL(fotoperfil) : null), [fotoperfil])
  const [errors, setErrors] = useState({})
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  function cambiarForm(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function cambiarDeporte(idDeporte) {
    if (cargando) return
    if (form.deportes.includes(idDeporte)) {
      setForm({ ...form, deportes: form.deportes.filter(id => id !== idDeporte) })
    } else {
      setForm({ ...form, deportes: [...form.deportes, idDeporte] })
    }
    setErrors((prev) => ({ ...prev, deportes: '' }))
  }

  async function registro() {
    if (cargando) return

    const newErrors = {}
    if (!datosBase.email || !datosBase.contraseña) {
      setErrorGlobal('Faltan el email y la contraseña del primer paso. Volvé a empezar el registro.')
      return
    }
    if (!form.nombre) newErrors.nombre = 'Este campo es obligatorio'
    if (form.latitud == null || form.longitud == null) {
      newErrors.ubicacion = 'Buscá y seleccioná la dirección exacta de la sede de la lista'
    }
    if (form.deportes.length === 0) newErrors.deportes = 'Seleccioná al menos un deporte'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setErrorGlobal('Por favor completá los campos requeridos correctamente.')
      return
    }

    setCargando(true)
    setErrorGlobal('')

    try {
      const formData = new FormData()
      formData.append('email', datosBase.email)
      formData.append('contrasenia', datosBase.contraseña)
      formData.append('nombre', form.nombre)
      formData.append('ubicacion', form.ubicacion)
      formData.append('direccion', form.direccion)
      formData.append('latitud', form.latitud)
      formData.append('longitud', form.longitud)
      formData.append('deportes', JSON.stringify(form.deportes))
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) {
        formData.append('fotoperfil', fotoperfil)
      }

      await api.post('/api/clubes/registro', formData)
      // El club queda PENDIENTE: no hay sesión hasta que el backoffice lo apruebe
      navigate('/login', { state: { clubRegistrado: true } })
    } catch (error) {
      console.error(error)
      setErrorGlobal(error.response?.data?.error || 'Ocurrió un error al registrar el club. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target.tagName.toLowerCase() === 'textarea') {
        return
      }
      e.preventDefault()
      if (!cargando) {
        registro()
      }
    }
  }

  return (
    <>
     <Header />
  <div className="registro-bg">
    <div className="registro-container">

      <div className="registro-header">

         <img src={logoSportlink} alt="Sportlink Logo" className="rj-logo" />

        <h1 className="registro-titulo">
          REGISTRATE COMO <span className="registro-titulo-color">CLUB</span>
        </h1>

        <p className="registro-subtitulo">
          Unite al ecosistema deportivo de rendimiento más avanzado del mundo.
        </p>

      </div>

      <div className="registro-card" onKeyDown={handleKeyDown}>
        {errorGlobal && (
          <div className="sl-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{errorGlobal}</span>
          </div>
        )}

        {/* COLUMNA IZQUIERDA */}
        <div className="registro-seccion">

          <p className="registro-seccion-titulo">
            INFORMACIÓN DEL CLUB
          </p>

          <div className="registro-divider"></div>

          <label className="registro-label">NOMBRE DEL CLUB</label>
          <input
            className="registro-input"
            name="nombre"
            type="text"
            placeholder="Tu club"
            value={form.nombre}
            onChange={cambiarForm}
            disabled={cargando}
          />
          {errors.nombre && (
            <span className="registro-error">{errors.nombre}</span>
          )}

          <label className="registro-label">
            UBICACIÓN EXACTA DE LA SEDE
          </label>

          <InputDireccionOSM
            value={form.direccion}
            onChangeText={(txt) => setForm((prev) => (
              // Si edita el texto a mano, la ubicación seleccionada deja de ser válida
              txt === prev.direccion ? prev : { ...prev, direccion: txt, latitud: null, longitud: null }
            ))}
            onSelectUbicacion={(loc) => {
              setErrors((prev) => ({ ...prev, ubicacion: '' }))
              setForm((prev) => ({
              ...prev,
              direccion: loc.direccion,
              // La zona (barrio/ciudad) se deriva de la dirección elegida
              ubicacion: loc.zona || loc.direccion,
              latitud: loc.latitud,
              longitud: loc.longitud,
              }))
            }}
            placeholder="Buscá la dirección o el nombre del club"
            disabled={cargando}
          />

          {errors.ubicacion && (
            <span className="registro-error">
              {errors.ubicacion}
            </span>
          )}

          {form.latitud != null && form.longitud != null && (
            <div style={{ marginTop: '10px' }}>
              <MapaUbicacionDark
                latitud={form.latitud}
                longitud={form.longitud}
                direccion={form.direccion}
                zona={form.ubicacion}
                nombre={form.nombre}
                tipo="club"
                height="160px"
                mostrarFooter={false}
              />
            </div>
          )}

          <label className="registro-label">
            DEPORTES QUE OFRECE
          </label>

          <div className="registro-deportes-grid">
            {deportesDisponibles.map(deporte => (
              <button
                key={deporte.id}
                type="button"
                className={`registro-deporte-btn ${
                  form.deportes.includes(deporte.id)
                    ? 'activo'
                    : ''
                }`}
                onClick={() => cambiarDeporte(deporte.id)}
                disabled={cargando}
              >
                {deporte.nombre}
              </button>
            ))}
          </div>

          {errors.deportes && (
            <span className="registro-error">
              {errors.deportes}
            </span>
          )}

          <label className="registro-label">
            DESCRIPCIÓN
          </label>

          <textarea
            className="registro-textarea"
            name="descripcion"
            placeholder="Contanos sobre las instalaciones y propuesta del club..."
            value={form.descripcion}
            onChange={cambiarForm}
            maxLength={500}
            disabled={cargando}
          />

          <span className="registro-char-count">
            {form.descripcion.length} / 500
          </span>

        </div>

        {/* COLUMNA DERECHA */}
        <div className="registro-seccion">

          <p className="registro-seccion-titulo">
            CREDENCIALES Y PERFIL
          </p>

          <div className="registro-divider"></div>

          <label className="registro-label">
            FOTO DE PERFIL
          </label>

          <label
            className={`registro-upload-area${fotoperfil ? ' con-foto' : ''}`}
            htmlFor="rc-file-upload"
            style={{ pointerEvents: cargando ? 'none' : 'auto' }}
          >
            {fotoperfil ? (
              <img
                src={fotoPreviewUrl}
                alt="Preview"
                className="registro-upload-preview"
              />
            ) : (
              <>
                <span className="registro-upload-icon">
                  <svg
                    width="28"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </span>

                <span className="registro-upload-text">
                  SUBIR IMAGEN (JPG, PNG)
                </span>
              </>
            )}
          </label>

          <input
            id="rc-file-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) =>
              setFotoperfil(e.target.files[0])
            }
            style={{ display: 'none' }}
            disabled={cargando}
          />

        </div>

      </div>

      <div className="registro-footer">

        <button
          className="registro-btn-siguiente"
          onClick={registro}
          disabled={cargando}
        >
          {cargando ? 'REGISTRANDO...' : 'REGISTRAR CLUB'}
        </button>

      </div>

    </div>
  </div>
  <Footer />
  </>
)
}

export default RegistroClub