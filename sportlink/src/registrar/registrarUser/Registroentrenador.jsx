import { useState } from 'react'
import axios from 'axios'
import "./Registroentrenador.css"
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

function RegistroEntrenador({ onRegistro }) {
  const [form, setForm] = useState({
    email: '',
    contrasenia: '',
    nombre: '',
    apellido: '',
    iddeporte: '',
    telefono: '',
    titulo: '',
    fechanacimiento: '',
    experiencia: '',
    tieneclub: false,
    genero: '',
    ubicacion: '',
    descripcion: ''
  })

  const [fotoperfil, setFotoperfil] = useState(null)
  const [errors, setErrors] = useState({})
  const [dia, setDia] = useState("")
  const [mes, setMes] = useState("")
  const [anio, setAnio] = useState("")
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  function cambiarForm(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const getDayOptions = () => {
    const days = []
    for (let i = 1; i <= 31; i++) days.push(i)
    return days
  }

  const getMonthOptions = () => [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ]

  const getYearOptions = () => {
    const years = []
    const current = new Date().getFullYear()
    for (let y = current; y >= 1940; y--) years.push(y)
    return years
  }

  const handleDateChange = (field, value) => {
    const newDia = field === "dia" ? value : dia
    const newMes = field === "mes" ? value : mes
    const newAnio = field === "anio" ? value : anio
    if (field === "dia") setDia(value)
    if (field === "mes") setMes(value)
    if (field === "anio") setAnio(value)
    if (newDia && newMes && newAnio) {
      const monthIndex = String(getMonthOptions().indexOf(newMes) + 1).padStart(2, "0")
      const dayStr = String(newDia).padStart(2, "0")
      setForm((prev) => ({
        ...prev,
        fechanacimiento: `${newAnio}-${monthIndex}-${dayStr}`,
      }))
    }
  }

  async function registro() {
    if (cargando) return

    const newErrors = {}
    if (!form.nombre) newErrors.nombre = "Este campo es obligatorio"
    if (!form.apellido) newErrors.apellido = "Este campo es obligatorio"
    if (!form.email) newErrors.email = "El email es obligatorio"
    if (!form.contrasenia) newErrors.contrasenia = "La contraseña es obligatoria"
    if (!form.telefono) newErrors.telefono = "Este campo es obligatorio"
    if (!form.titulo) newErrors.titulo = "Este campo es obligatorio"
    if (!form.iddeporte) newErrors.iddeporte = "Este campo es obligatorio"
    if (!form.experiencia) newErrors.experiencia = "Este campo es obligatorio"
    if (!form.genero) newErrors.genero = "Este campo es obligatorio"
    if (!form.ubicacion) newErrors.ubicacion = "Este campo es obligatorio"
    if (!form.fechanacimiento) newErrors.fechanacimiento = "Este campo es obligatorio"

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
      formData.append('apellido', form.apellido)
      formData.append('iddeporte', form.iddeporte)
      formData.append('telefono', form.telefono)
      formData.append('titulo', form.titulo)
      formData.append('fechanacimiento', form.fechanacimiento)
      formData.append('experiencia', form.experiencia)
      formData.append('tieneclub', form.tieneclub)
      formData.append('genero', form.genero)
      formData.append('ubicacion', form.ubicacion)
      formData.append('descripcion', form.descripcion)
      if (fotoperfil) {
        formData.append('fotoperfil', fotoperfil)
      }

      const response = await axios.post(
        'http://localhost:3000/api/entrenadores/registro',
        formData
      )

      if (onRegistro) onRegistro(response.data)
    } catch (error) {
      console.error(error)
      setErrorGlobal(error.response?.data?.error || 'Ocurrió un error al registrar el entrenador. Intentá de nuevo.')
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
      <main className="rj-main">

        <div className="rj-hero rj-animate-hero">
          <img src={logoSportlink} alt="Sportlink Logo" className="rj-logo" />
          <h1 className="rj-title">
            REGISTRATE COMO <span className="rj-title-accent">ENTRENADOR</span>
          </h1>
          <p className="rj-subtitle">
            Únete al ecosistema deportivo de rendimiento más avanzado del mundo.
          </p>
        </div>

        <div className="rj-card rj-animate-content" onKeyDown={handleKeyDown}>
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

          <div className="rj-form-grid">

            {/* COLUMNA IZQUIERDA */}
            <div className="rj-col">
              <h2 className="rj-section-label">INFORMACIÓN PERSONAL</h2>
              <div className="rj-divider" />

              <div className="rj-field">
                <label className="rj-label">NOMBRE</label>
                <input className="rj-input" name="nombre" type="text" placeholder="Ej. Juan" value={form.nombre} onChange={cambiarForm} disabled={cargando} />
                {errors.nombre && <span className="rj-error">{errors.nombre}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">APELLIDO</label>
                <input className="rj-input" name="apellido" type="text" placeholder="Ej. Perez" value={form.apellido} onChange={cambiarForm} disabled={cargando} />
                {errors.apellido && <span className="rj-error">{errors.apellido}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">UBICACIÓN (BARRIO / ZONA)</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="ubicacion" value={form.ubicacion} onChange={cambiarForm} disabled={cargando}>
                    <option value="" disabled hidden>Seleccioná tu barrio</option>
                    {barriosArgentina.map((barrio, index) => (
                      <option key={index} value={barrio}>{barrio}</option>
                    ))}
                  </select>
                  <span className="rj-select-arrow">▼</span>
                </div>
                {errors.ubicacion && <span className="rj-error">{errors.ubicacion}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">EMAIL</label>
                <input className="rj-input" name="email" type="email" placeholder="entrenador@sportlink.com" value={form.email} onChange={cambiarForm} disabled={cargando} />
                {errors.email && <span className="rj-error">{errors.email}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">CONTRASEÑA</label>
                <input className="rj-input" name="contrasenia" type="password" placeholder="••••••••" value={form.contrasenia} onChange={cambiarForm} disabled={cargando} />
                {errors.contrasenia && <span className="rj-error">{errors.contrasenia}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">NÚMERO TELEFÓNICO</label>
                <div className="rj-phone-row">
                  <span className="rj-phone-prefix">+54</span>
                  <input className="rj-input rj-input-phone" name="telefono" type="text" placeholder="11 2345 6789" value={form.telefono} onChange={cambiarForm} disabled={cargando} />
                </div>
                {errors.telefono && <span className="rj-error">{errors.telefono}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">FECHA DE NACIMIENTO</label>
                <div className="rj-date-row">
                  <select className="sl-select-custom rj-select rj-date-select" value={dia} onChange={(e) => handleDateChange("dia", e.target.value)} disabled={cargando}>
                    <option value="">Día</option>
                    {getDayOptions().map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="sl-select-custom rj-select rj-date-select" value={mes} onChange={(e) => handleDateChange("mes", e.target.value)} disabled={cargando}>
                    <option value="">Mes</option>
                    {getMonthOptions().map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="sl-select-custom rj-select rj-date-select" value={anio} onChange={(e) => handleDateChange("anio", e.target.value)} disabled={cargando}>
                    <option value="">Año</option>
                    {getYearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.fechanacimiento && <span className="rj-error">{errors.fechanacimiento}</span>}
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="rj-col">
              <h2 className="rj-section-label">PERFIL Y PERFECCIONAMIENTO</h2>
              <div className="rj-divider" />

              <div className="rj-field">
                <label className="rj-label">TÍTULO PROFESIONAL</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="titulo" value={form.titulo} onChange={cambiarForm} disabled={cargando}>
                    <option value="">Seleccioná un título</option>
                    <option value="Licenciado en Ed. Física">Licenciado en Ed. Física</option>
                    <option value="Entrenador Nacional">Entrenador Nacional</option>
                    <option value="Entrenador UEFA/CONMEBOL">Entrenador UEFA/CONMEBOL</option>
                    <option value="Técnico Deportivo">Técnico Deportivo</option>
                    <option value="Sin título formal">Sin título formal</option>
                  </select>
                  <span className="rj-select-arrow">▼</span>
                </div>
                {errors.titulo && <span className="rj-error">{errors.titulo}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">ESPECIALIDAD (DEPORTE)</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="iddeporte" value={form.iddeporte} onChange={cambiarForm} disabled={cargando}>
                    <option value="">Seleccioná un deporte</option>
                    <option value="1">Fútbol</option>
                    <option value="2">Basket</option>
                    <option value="3">Tenis</option>
                    <option value="4">Voley</option>
                    <option value="5">Pádel</option>
                    <option value="6">Rugby</option>
                    <option value="7">Hockey</option>
                    <option value="8">Natación</option>
                    <option value="9">Atletismo</option>
                    <option value="10">Ciclismo</option>
                    <option value="11">Boxeo</option>
                    <option value="12">Artes Marciales</option>
                    <option value="13">Handball</option>
                    <option value="14">Béisbol</option>
                    <option value="15">Golf</option>
                  </select>
                  <span className="rj-select-arrow">▼</span>
                </div>
                {errors.iddeporte && <span className="rj-error">{errors.iddeporte}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">AÑOS DE EXPERIENCIA</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="experiencia" value={form.experiencia} onChange={cambiarForm} disabled={cargando}>
                    <option value="">Seleccioná experiencia</option>
                    <option value="0-2 años">0-2 años</option>
                    <option value="3-5 años">3-5 años</option>
                    <option value="6-10 años">6-10 años</option>
                    <option value="+10 años">+10 años</option>
                  </select>
                  <span className="rj-select-arrow">▼</span>
                </div>
                {errors.experiencia && <span className="rj-error">{errors.experiencia}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">¿TENÉS CLUB ACTUALMENTE?</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="tieneclub" value={form.tieneclub} onChange={cambiarForm} disabled={cargando}>
                    <option value="false">No, agente libre / independiente</option>
                    <option value="true">Sí, vinculado a una institución</option>
                  </select>
                  <span className="rj-select-arrow">▼</span>
                </div>
              </div>

              <div className="rj-field">
                <label className="rj-label">FOTO DE PERFIL</label>
                <label className="rj-upload-area" htmlFor="re-file-upload" style={{ pointerEvents: cargando ? 'none' : 'auto', opacity: cargando ? 0.5 : 1 }}>
                  {fotoperfil ? (
                    <img src={URL.createObjectURL(fotoperfil)} alt="Preview" className="rj-upload-preview" />
                  ) : (
                    <>
                      <span className="rj-upload-icon">
                        <svg width="28" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </span>
                      <span className="rj-upload-text">SUBIR IMAGEN (JPG, PNG)</span>
                    </>
                  )}
                </label>
                <input
                  id="re-file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFotoperfil(e.target.files[0])}
                  style={{ display: "none" }}
                  disabled={cargando}
                />
              </div>

              <div className="rj-field">
                <label className="rj-label">DESCRIPCIÓN</label>
                <textarea
                  className="rj-textarea"
                  name="descripcion"
                  placeholder="Contanos sobre tu metodología y experiencia..."
                  value={form.descripcion}
                  onChange={cambiarForm}
                  maxLength={500}
                  disabled={cargando}
                />
                <span className="rj-char-count">{form.descripcion.length} / 500</span>
              </div>

              <div className="rj-field">
                <label className="rj-label">GÉNERO</label>
                <div className="rj-gender-row">
                  <button
                    type="button"
                    className={`rj-gender-btn ${form.genero === "Masculino" ? "rj-gender-btn--active" : ""}`}
                    onClick={() => { setForm((p) => ({ ...p, genero: "Masculino" })); setErrors((p) => ({ ...p, genero: "" })) }}
                    disabled={cargando}
                  >
                    MASCULINO
                  </button>
                  <button
                    type="button"
                    className={`rj-gender-btn ${form.genero === "Femenino" ? "rj-gender-btn--active" : ""}`}
                    onClick={() => { setForm((p) => ({ ...p, genero: "Femenino" })); setErrors((p) => ({ ...p, genero: "" })) }}
                    disabled={cargando}
                  >
                    FEMENINO
                  </button>
                </div>
                {errors.genero && <span className="rj-error">{errors.genero}</span>}
              </div>

            </div>
          </div>
        </div>

        <div className="rj-footer-cta rj-animate-content">
          <button className="rj-submit-btn" onClick={registro} disabled={cargando}>
            {cargando ? 'REGISTRANDO...' : 'REGISTRARSE'}
          </button>
          <div className="rj-step-info">
            <span className="rj-step-text">PASO 2/2</span>
            <div className="rj-step-dots">
              <span className="rj-dot rj-dot--done" />
              <span className="rj-dot rj-dot--active" />
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </>
  )
}

export default RegistroEntrenador