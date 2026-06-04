import { useState } from "react";
import axios from "axios";
import "./Registrojugador.css";
import Header from "../../header/header.jsx";
import Footer from "../../footer/footer.jsx";
import logoSportlink from "../../assets/logoSportlink.png";

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
];

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
];

const RegistroJugador = () => {
  const [form, setForm] = useState({
    email: "",
    contrasenia: "",
    nombre: "",
    apellido: "",
    deportes: [],
    telefono: "",
    fechanacimiento: "",
    ubicacion: "",
    genero: "",
    descripcion: ""
  });

  const [fotoperfil, setFotoperfil] = useState(null);
  const [errors, setErrors] = useState({});
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleDeporte = (id) => {
    setForm((prev) => ({
      ...prev,
      deportes: prev.deportes.includes(id) ? [] : [id]
    }));
    setErrors((prev) => ({ ...prev, deportes: "" }));
  };

  const getDayOptions = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) days.push(i);
    return days;
  };

  const getMonthOptions = () => [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  const getYearOptions = () => {
    const years = [];
    const current = new Date().getFullYear();
    for (let y = current; y >= 1940; y--) years.push(y);
    return years;
  };

  const handleDateChange = (field, value) => {
    const newDia = field === "dia" ? value : dia;
    const newMes = field === "mes" ? value : mes;
    const newAnio = field === "anio" ? value : anio;
    if (field === "dia") setDia(value);
    if (field === "mes") setMes(value);
    if (field === "anio") setAnio(value);
    if (newDia && newMes && newAnio) {
      const monthIndex = String(getMonthOptions().indexOf(newMes) + 1).padStart(2, "0");
      const dayStr = String(newDia).padStart(2, "0");
      setForm((prev) => ({
        ...prev,
        fechanacimiento: `${newAnio}-${monthIndex}-${dayStr}`,
      }));
    }
  };

  async function handleRegistro() {
    const newErrors = {};
    if (!form.nombre) newErrors.nombre = "Este campo es obligatorio";
    if (!form.apellido) newErrors.apellido = "Este campo es obligatorio";
    if (!form.ubicacion) newErrors.ubicacion = "Este campo es obligatorio";
    if (!form.email) newErrors.email = "El email es obligatorio";
    if (!form.contrasenia) newErrors.contrasenia = "La contraseña es obligatoria";
    if (!form.telefono) newErrors.telefono = "Este campo es obligatorio";
    if (!form.fechanacimiento) newErrors.fechanacimiento = "Este campo es obligatorio";
    if (!form.genero) newErrors.genero = "Este campo es obligatorio";
    if (form.deportes.length === 0) newErrors.deportes = "Seleccioná al menos un deporte";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const formData = new FormData();
      formData.append('email', form.email);
      formData.append('contrasenia', form.contrasenia);
      formData.append('nombre', form.nombre);
      formData.append('apellido', form.apellido);
      formData.append('iddeporte', form.deportes[0]);
      formData.append('telefono', form.telefono);
      formData.append('fechanacimiento', form.fechanacimiento);
      formData.append('ubicacion', form.ubicacion);
      formData.append('genero', form.genero);
      formData.append('descripcion', form.descripcion);
      if (fotoperfil) {
        formData.append('fotoperfil', fotoperfil);
      }

    const response = await axios.post('http://localhost:3000/api/jugadores/registro', formData);
    alert('Jugador registrado correctamente');
    if (onRegistro) onRegistro(response.data)
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al registrar jugador');
    }
  }

  return (
    <>
      <Header />
      <main className="rj-main">
        <div className="rj-hero rj-animate-hero">
          <img src={logoSportlink} alt="Sportlink Logo" className="rj-logo" />
          <h1 className="rj-title">
            REGISTRATE COMO <span className="rj-title-accent">JUGADOR</span>
          </h1>
          <p className="rj-subtitle">
            Únete al ecosistema deportivo de rendimiento más avanzada del mundo.
          </p>
        </div>

        <div className="rj-card rj-animate-content">
          <div className="rj-form-grid">

            {/* COLUMNA IZQUIERDA */}
            <div className="rj-col">
              <h2 className="rj-section-label">INFORMACIÓN PERSONAL</h2>
              <div className="rj-divider" />

              <div className="rj-field">
                <label className="rj-label">NOMBRE</label>
                <input className="rj-input" name="nombre" type="text" placeholder="Ej. Carlos" value={form.nombre} onChange={handleChange} />
                {errors.nombre && <span className="rj-error">{errors.nombre}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">APELLIDO</label>
                <input className="rj-input" name="apellido" type="text" placeholder="Ej. Rodríguez" value={form.apellido} onChange={handleChange} />
                {errors.apellido && <span className="rj-error">{errors.apellido}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">UBICACIÓN (BARRIO / ZONA)</label>
                <div className="rj-select-wrapper">
                  <select className="rj-select" name="ubicacion" value={form.ubicacion} onChange={handleChange}>
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
                <input className="rj-input" name="email" type="email" placeholder="ejemplo@gmail.com" value={form.email} onChange={handleChange} />
                {errors.email && <span className="rj-error">{errors.email}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">CONTRASEÑA</label>
                <input className="rj-input" name="contrasenia" type="password" placeholder="••••••••" value={form.contrasenia} onChange={handleChange} />
                {errors.contrasenia && <span className="rj-error">{errors.contrasenia}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">NÚMERO TELEFÓNICO</label>
                <div className="rj-phone-row">
                  <span className="rj-phone-prefix">+54</span>
                  <input className="rj-input rj-input-phone" name="telefono" type="text" placeholder="11 2345 6789" value={form.telefono} onChange={handleChange} />
                </div>
                {errors.telefono && <span className="rj-error">{errors.telefono}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">FECHA DE NACIMIENTO</label>
                <div className="rj-date-row">
                  <select className="rj-select rj-date-select" value={dia} onChange={(e) => handleDateChange("dia", e.target.value)}>
                    <option value="">Día</option>
                    {getDayOptions().map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select className="rj-select rj-date-select" value={mes} onChange={(e) => handleDateChange("mes", e.target.value)}>
                    <option value="">Mes</option>
                    {getMonthOptions().map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="rj-select rj-date-select" value={anio} onChange={(e) => handleDateChange("anio", e.target.value)}>
                    <option value="">Año</option>
                    {getYearOptions().map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {errors.fechanacimiento && <span className="rj-error">{errors.fechanacimiento}</span>}
              </div>
            </div>

            {/* COLUMNA DERECHA */}
            <div className="rj-col">
              <h2 className="rj-section-label">DISCIPLINAS Y PERFIL</h2>
              <div className="rj-divider" />

              <div className="rj-field">
                <label className="rj-label">DEPORTE PRINCIPAL</label>
                <div className="rj-deportes-grid">
                  {deportesDisponibles.map((deporte) => (
                    <button
                      key={deporte.id}
                      type="button"
                      className={`rj-deporte-btn ${form.deportes.includes(deporte.id) ? 'rj-deporte-btn--active' : ''}`}
                      onClick={() => toggleDeporte(deporte.id)}
                    >
                      {deporte.nombre}
                    </button>
                  ))}
                </div>
                {errors.deportes && <span className="rj-error">{errors.deportes}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">FOTO DE PERFIL</label>
                <label className="rj-upload-area" htmlFor="rj-file-upload">
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
                  id="rj-file-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFotoperfil(e.target.files[0])}
                  style={{ display: "none" }}
                />
                {errors.foto && <span className="rj-error">{errors.foto}</span>}
              </div>

              <div className="rj-field">
                <label className="rj-label">DESCRIPCIÓN</label>
                <textarea
                  className="rj-textarea"
                  name="descripcion"
                  placeholder="Cuéntanos sobre tu carrera deportiva..."
                  value={form.descripcion}
                  onChange={handleChange}
                  maxLength={500}
                />
                <span className="rj-char-count">{form.descripcion.length} / 500</span>
              </div>

              <div className="rj-field">
                <label className="rj-label">GÉNERO</label>
                <div className="rj-gender-row">
                  <button
                    type="button"
                    className={`rj-gender-btn ${form.genero === "Masculino" ? "rj-gender-btn--active" : ""}`}
                    onClick={() => { setForm((p) => ({ ...p, genero: "Masculino" })); setErrors((p) => ({ ...p, genero: "" })); }}
                  >
                    MASCULINO
                  </button>
                  <button
                    type="button"
                    className={`rj-gender-btn ${form.genero === "Femenino" ? "rj-gender-btn--active" : ""}`}
                    onClick={() => { setForm((p) => ({ ...p, genero: "Femenino" })); setErrors((p) => ({ ...p, genero: "" })); }}
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
          <button className="rj-submit-btn" onClick={handleRegistro}>
            REGISTRARSE
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
  );
};

export default RegistroJugador;