import { useState } from 'react'
import axios from 'axios'
import './RegistroClub.css'
import Header from "../../header/header.jsx"
import Footer from "../../footer/footer.jsx"
import logoSportlink from "../../assets/logoSportlink.png"

const barriosArgentina = [
  "Agronomía", "Almagro", "Balvanera", "Barracas", "Belgrano", "Boedo",
  "Caballito", "Chacarita", "Coghlan", "Colegiales", "Constitución",
  "Flores", "Floresta", "La Boca", "La Paternal", "Liniers",
  "Mataderos", "Monte Castro", "Monserrat", "Nueva Pompeya", "Núñez",
  "Palermo", "Parque Avellaneda", "Parque Chacabuco", "Parque Chas",
  "Parque Patricios", "Puerto Madero", "Recoleta", "Retiro",
  "Saavedra", "San Cristóbal", "San Telmo", "Vélez Sarsfield",
  "Versalles", "Villa Crespo", "Villa del Parque", "Villa Devoto",
  "Villa Luro", "Villa Urquiza", "Zonas Norte GBA", "Zona Sur GBA", "Zona Oeste GBA"
]

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

function RegistroClub({ onRegistro }) {
  const [form, setForm] = useState({
    email: '',
    contrasenia: '',
    nombre: '',
    ubicacion: '',
    deportes: [],
    descripcion: ''
  })
  const [fotoperfil, setFotoperfil] = useState(null)
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
    if (!form.email) newErrors.email = 'Este campo es obligatorio'
    if (!form.contrasenia) newErrors.contrasenia = 'Este campo es obligatorio'
    if (!form.nombre) newErrors.nombre = 'Este campo es obligatorio'
    if (!form.ubicacion) newErrors.ubicacion = 'Este campo es obligatorio'
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
      formData.append('email', form.email)
      formData.append('contrasenia', form.contrasenia)
      formData.append('nombre', form.nombre)
      formData.append('ubicacion', form.ubicacion)
      formData.append('deportes', JSON.stringify(form.deportes))
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) {
        formData.append('fotoperfil', fotoperfil)
      }

      const response = await axios.post('http://localhost:3000/api/clubes/registro', formData)
      if (onRegistro) onRegistro(response.data)
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
            UBICACIÓN (BARRIO / ZONA)
          </label>

          <div className="registro-select-wrapper">
            <select
              className="registro-select"
              name="ubicacion"
              value={form.ubicacion}
              onChange={cambiarForm}
              disabled={cargando}
            >
              <option value="" disabled hidden>
                Seleccioná tu barrio
              </option>

              {barriosArgentina.map((barrio, index) => (
                <option key={index} value={barrio}>
                  {barrio}
                </option>
              ))}
            </select>

            <span className="registro-select-arrow">▼</span>
          </div>

          {errors.ubicacion && (
            <span className="registro-error">
              {errors.ubicacion}
            </span>
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
            EMAIL
          </label>

          <input
            className="registro-input"
            name="email"
            type="email"
            placeholder="club@email.com"
            value={form.email}
            onChange={cambiarForm}
            disabled={cargando}
          />

          {errors.email && (
            <span className="registro-error">
              {errors.email}
            </span>
          )}

          <label className="registro-label">
            CONTRASEÑA
          </label>

          <input
            className="registro-input"
            name="contrasenia"
            type="password"
            placeholder="••••••••"
            value={form.contrasenia}
            onChange={cambiarForm}
            disabled={cargando}
          />

          {errors.contrasenia && (
            <span className="registro-error">
              {errors.contrasenia}
            </span>
          )}

          <label className="registro-label">
            FOTO DE PERFIL
          </label>

          <label
            className="registro-upload-area"
            htmlFor="rc-file-upload"
            style={{ pointerEvents: cargando ? 'none' : 'auto' }}
          >
            {fotoperfil ? (
              <img
                src={URL.createObjectURL(fotoperfil)}
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